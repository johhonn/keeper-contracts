/* global artifacts, contract, before, describe, it, assert */
/* eslint-disable no-console, max-len */

const OceanToken = artifacts.require('OceanToken.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const FitchainConditions = artifacts.require('FitchainConditions.sol')
const testUtils = require('../helpers/utils')
const { hashAgreement } = require('../helpers/hashAgreement.js')

const web3 = testUtils.getWeb3()

contract('FitchainConditions', (accounts) => {
    describe('Test Fitchain Conditions', () => {
        let token, agreement, paymentConditions, valuesHashList, serviceId, conditionKeys
        let fingerPrints, contracts, agreementId, slaMsgHash, signature, fitchainConditions, GPCVerifiers, VPCVerifiers, i, myFreeSlots

        const publisher = accounts[0]
        const consumer = accounts[1]
        const verifier1 = accounts[2]
        const verifier2 = accounts[3]
        const verifier3 = accounts[4]
        const verifier4 = accounts[5]
        const fulfillmentIndices = [3, 4]
        const fulfilmentOperator = 1 // OR
        const dependencies = [0, 1, 4, 16, 3]
        const slots = 1
        const price = 10 // 10 OCN tokens
        const timeouts = [0, 0, 0, 0, 100]
        const kVerifiers = 3
        const did = testUtils.generateId()
        const serviceTemplateId = testUtils.generateId()
        agreementId = testUtils.generateId()
        GPCVerifiers = []
        VPCVerifiers = []
        before(async () => {
            agreement = await ServiceExecutionAgreement.new({ from: accounts[0] })
            token = await OceanToken.new({ from: accounts[0] })
            paymentConditions = await PaymentConditions.new(agreement.address, token.address, { from: accounts[0] })
            fitchainConditions = await FitchainConditions.new(agreement.address, price, slots)

            await token.mint(consumer, 1000)
            await token.mint(publisher, 1000)
            await token.mint(verifier1, 1000)
            await token.mint(verifier2, 1000)
            await token.mint(verifier3, 1000)
            await token.mint(verifier4, 1000)

            // conditions
            contracts = [paymentConditions.address, fitchainConditions.address, fitchainConditions.address, paymentConditions.address, paymentConditions.address]
            fingerPrints = [
                testUtils.getSelector(web3, paymentConditions, 'lockPayment'),
                testUtils.getSelector(web3, fitchainConditions, 'setPoT'),
                testUtils.getSelector(web3, fitchainConditions, 'setVPC'),
                testUtils.getSelector(web3, paymentConditions, 'releasePayment'),
                testUtils.getSelector(web3, paymentConditions, 'refundPayment')
            ]

            valuesHashList = [
                testUtils.valueHash(['bytes32', 'uint256'], [did, price]),
                testUtils.valueHash(['uint256'], [kVerifiers]),
                testUtils.valueHash(['uint256'], [kVerifiers]),
                testUtils.valueHash(['bytes32', 'uint256'], [did, price]),
                testUtils.valueHash(['bytes32', 'uint256'], [did, price])
            ]
            // create new on-premise compute template
            const createAgreementTemplate = await agreement.setupTemplate(
                serviceTemplateId,
                contracts,
                fingerPrints,
                dependencies,
                fulfillmentIndices,
                fulfilmentOperator, { from: publisher }
            )
            let { templateId } = testUtils.getEventArgsFromTx(createAgreementTemplate, 'TemplateSetup')
            // create new agreement instance
            conditionKeys = testUtils.generateConditionsKeys(templateId, contracts, fingerPrints)
            slaMsgHash = hashAgreement(
                templateId,
                conditionKeys,
                valuesHashList,
                timeouts,
                agreementId
            )
            signature = await web3.eth.sign(slaMsgHash, consumer)
            serviceId = await testUtils.initializeAgreement(
                agreement, templateId, signature,
                consumer, valuesHashList, timeouts,
                agreementId, did, { from: publisher }
            )
            // TODO: verifiers approve token for fitchain staking
        })
        it('should be able to get maximum number of slots', async () => {
            const maxSlotsNumber = await fitchainConditions.getMaximumNumberOfSlots()
            assert.strictEqual(1, maxSlotsNumber.toNumber(), 'invalid maximum slots number value')
        })
        it('should data scientist locks payment for the data-compute provider', async () => {
            await token.approve(paymentConditions.address, price, { from: consumer })
            await paymentConditions.lockPayment(serviceId, did, price, { from: consumer })
            const locked = await agreement.getConditionStatus(agreementId, conditionKeys[0])
            assert.strictEqual(locked.toNumber(), 1, 'Error: Unable to lock payment!')
        })
        it('should verifiers register and stake based on the number of slots', async () => {
            const registerVerifier1 = await fitchainConditions.registerVerifier(slots, { from: verifier1 })
            assert.strictEqual(verifier1, registerVerifier1.logs[0].args.verifier, 'invalid verifier address 1')
            const registerVerifier2 = await fitchainConditions.registerVerifier(slots, { from: verifier2 })
            assert.strictEqual(verifier2, registerVerifier2.logs[0].args.verifier, 'invalid verifier address 2')
            const registerVerifier3 = await fitchainConditions.registerVerifier(slots, { from: verifier3 })
            assert.strictEqual(verifier3, registerVerifier3.logs[0].args.verifier, 'invalid verifier address 3')
            const registerVerifier4 = await fitchainConditions.registerVerifier(slots, { from: verifier4 })
            assert.strictEqual(verifier4, registerVerifier4.logs[0].args.verifier, 'invalid verifier address 4')
        })
        it('should data-compute provider init Training proof (PoT)', async () => {
            const availableSlots = await fitchainConditions.getAvailableVerifiersCount()
            assert.strictEqual(4, availableSlots.toNumber(), 'invalid number of verifiers/slots')
            const verifierState = await fitchainConditions.initPoT(agreementId, kVerifiers, 1, { from: publisher })
            for (i = 0; i < verifierState.logs.length - 1; i++) {
                GPCVerifiers[i] = verifierState.logs[i].args.verifier
            }
            assert.strictEqual(verifierState.logs[verifierState.logs.length - 1].args.state, true, 'unable to initialize the PoT verification')
        })
        it('should GPC verifiers submit votes to fulfill Proof of Training condition', async () => {
            for (i = 0; i < GPCVerifiers.length; i++) {
                await fitchainConditions.voteForPoT(agreementId, true, { from: GPCVerifiers[i] })
            }
        })
        it('should data-compute provider fulfill the PoT condition', async () => {
            const PoTstate = await fitchainConditions.setPoT(agreementId, kVerifiers, { from: publisher })
            assert.strictEqual(true, PoTstate.logs[0].args.state, 'unable to fulfill the proof of training condition')
        })
        it('should a byzantine GPC verifier fails to submit vote twice', async () => {
            try {
                await fitchainConditions.voteForPoT(agreementId, true, { from: GPCVerifiers[0] })
            } catch (error) {
                return error
            }
        })
        it('should GPC verifiers release their slots after voting', async () => {
            for (i = 0; i < GPCVerifiers.length; i++) {
                await fitchainConditions.freeMySlots(agreementId, { from: GPCVerifiers[i] })
            }
        })
        it('should data-compute provider init verification proof', async () => {
            const verifierState = await fitchainConditions.initVPCProof(agreementId, kVerifiers, 1, { from: publisher })
            for (i = 0; i < verifierState.logs.length - 1; i++) {
                VPCVerifiers[i] = verifierState.logs[i].args.verifier
            }
            assert.strictEqual(verifierState.logs[verifierState.logs.length - 1].args.state, true, 'unable to initialize the PoT verification')
        })
        it('should VPC verifiers submit votes to fulfill the verification game', async () => {
            for (i = 0; i < VPCVerifiers.length; i++) {
                await fitchainConditions.voteForVPC(agreementId, true, { from: VPCVerifiers[i] })
            }
        })
        it('should data-compute provider fulfill verification proof of VPC condition', async () => {
            const VPCstate = await fitchainConditions.setVPC(agreementId, kVerifiers, { from: publisher })
            assert.strictEqual(true, VPCstate.logs[0].args.state, 'unable to fulfill the proof of training condition')
            for (i = 0; i < VPCVerifiers.length; i++) {
                await fitchainConditions.freeMySlots(agreementId, { from: VPCVerifiers[i] })
            }
        })
        it('should verifiers should able to deregister if their slots are free', async () => {
            const deregisterVerifier1 = await fitchainConditions.deregisterVerifier({ from: verifier1 })
            const deregisterVerifier2 = await fitchainConditions.deregisterVerifier({ from: verifier2 })
            const deregisterVerifier3 = await fitchainConditions.deregisterVerifier({ from: verifier3 })
            assert.strictEqual(verifier1, deregisterVerifier1.logs[0].args.verifier, 'unable to deregister')
            assert.strictEqual(verifier2, deregisterVerifier2.logs[0].args.verifier, 'unable to deregister')
            assert.strictEqual(verifier3, deregisterVerifier3.logs[0].args.verifier, 'unable to deregister')
        })
        it('should verifier able to get his free slots count', async () => {
            for (i = 0; i < VPCVerifiers.length; i++) {
                myFreeSlots = await fitchainConditions.getMyFreeSlots({ from: VPCVerifiers[i] })
                assert.strictEqual(slots, myFreeSlots.toNumber(), 'invalid free slots')
            }
        })
    })
})
