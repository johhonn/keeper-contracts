/* global artifacts, contract, before, describe, it, assert */
/* eslint-disable no-console, max-len */

const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const FitchainConditions = artifacts.require('FitchainConditions.sol')
const testUtils = require('./utils')
const web3 = testUtils.getWeb3()

contract('FitchainConditions', (accounts) => {
    describe('Test Fitchain Conditions', () => {
        let token, market, serviceAgreement, paymentConditions, valuesHashList, serviceId, conditionKeys, templateId
        let fingerPrints, contracts, serviceAgreementId, slaMsgHash, signature, fitchainConditions, GPCVerifiers, VPCVerifiers, i, myFreeSlots

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
        const did = testUtils.generateId(web3)
        const serviceTemplateId = testUtils.generateId(web3)
        serviceAgreementId = testUtils.generateId(web3)
        GPCVerifiers = []
        VPCVerifiers = []
        before(async () => {
            token = await OceanToken.deployed()
            market = await OceanMarket.deployed(token.address)
            serviceAgreement = await ServiceAgreement.deployed()
            paymentConditions = await PaymentConditions.deployed(serviceAgreement.address, token.address)
            fitchainConditions = await FitchainConditions.new(serviceAgreement.address, price, 1)

            await market.requestTokens(testUtils.toBigNumber(1000), { from: consumer })
            await market.requestTokens(testUtils.toBigNumber(1000), { from: publisher })
            await market.requestTokens(testUtils.toBigNumber(1000), { from: verifier1 })
            await market.requestTokens(testUtils.toBigNumber(1000), { from: verifier2 })
            await market.requestTokens(testUtils.toBigNumber(1000), { from: verifier3 })
            await market.requestTokens(testUtils.toBigNumber(1000), { from: verifier4 })

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
            const createAgreementTemplate = await serviceAgreement.setupAgreementTemplate(
                serviceTemplateId, contracts, fingerPrints, dependencies,
                web3.utils.fromAscii('fitchain'), fulfillmentIndices,
                fulfilmentOperator, { from: publisher }
            )
            templateId = testUtils.getEventArgsFromTx(createAgreementTemplate, 'SetupAgreementTemplate').serviceTemplateId
            // create new agreement instance
            conditionKeys = testUtils.generateConditionsKeys(templateId, contracts, fingerPrints)
            slaMsgHash = testUtils.createSLAHash(web3, templateId, conditionKeys, valuesHashList, timeouts, serviceAgreementId)
            signature = await web3.eth.sign(slaMsgHash, consumer)
            serviceId = await testUtils.signAgreement(
                serviceAgreement, templateId, signature,
                consumer, valuesHashList, timeouts,
                serviceAgreementId, did, { from: publisher }
            )
            // TODO: verifiers approve token for fitchain staking
        })
        it('should be able to get maximum number of slots', async () => {
            const maxSlotsNumber = await fitchainConditions.getMaximumNumberOfSlots()
            assert.strictEqual(1, maxSlotsNumber.toNumber(), 'invalid maximum slots number value')
        })
        it('should data scientist locks payment for the model provider', async () => {
            await token.approve(paymentConditions.address, price, { from: consumer })
            await paymentConditions.lockPayment(serviceId, did, price, { from: consumer })
            const locked = await serviceAgreement.getConditionStatus(serviceAgreementId, conditionKeys[0])
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
        it('should model provider init Training proof (PoT)', async () => {
            const availableSlots = await fitchainConditions.getAvailableVerifiersCount()
            assert.strictEqual(4, availableSlots.toNumber(), 'invalid number of verifiers/slots')
            const verifierState = await fitchainConditions.initPoT(serviceAgreementId, kVerifiers, 1, { from: publisher })
            for (i = 0; i < verifierState.logs.length - 1; i++) {
                GPCVerifiers[i] = verifierState.logs[i].args.verifier
            }
            assert.strictEqual(verifierState.logs[verifierState.logs.length - 1].args.state, true, 'unable to initialize the PoT verification')
        })
        it('should GPC verifiers submit votes to fulfill Proof of Training condition', async () => {
            for (i = 0; i < GPCVerifiers.length; i++) {
                await fitchainConditions.voteForPoT(serviceAgreementId, true, { from: GPCVerifiers[i] })
            }
        })
        it('should model provider fulfill the PoT condition', async () => {
            const PoTstate = await fitchainConditions.setPoT(serviceAgreementId, kVerifiers, { from: publisher })
            assert.strictEqual(true, PoTstate.logs[0].args.state, 'unable to fulfill the proof of training condition')
        })
        it('should a byzantine GPC verifier fails to submit vote twice', async () => {
            try {
                await fitchainConditions.voteForPoT(serviceAgreementId, true, { from: GPCVerifiers[0] })
            } catch (error) {
                return error
            }
        })
        it('should GPC verifiers release their slots after voting', async () => {
            for (i = 0; i < GPCVerifiers.length; i++) {
                await fitchainConditions.freeMySlots(serviceAgreementId, { from: GPCVerifiers[i] })
            }
        })
        it('should data-compute provider init verification proof', async () => {
            const verifierState = await fitchainConditions.initVPCProof(serviceAgreementId, kVerifiers, 1, { from: publisher })
            for (i = 0; i < verifierState.logs.length - 1; i++) {
                VPCVerifiers[i] = verifierState.logs[i].args.verifier
            }
            assert.strictEqual(verifierState.logs[verifierState.logs.length - 1].args.state, true, 'unable to initialize the PoT verification')
        })
        it('should VPC verifiers submit votes to fulfill the verification game', async () => {
            for (i = 0; i < VPCVerifiers.length; i++) {
                await fitchainConditions.voteForVPC(serviceAgreementId, true, { from: VPCVerifiers[i] })
            }
        })
        it('should data-compute provider fulfill verification proof of VPC condition', async () => {
            const VPCstate = await fitchainConditions.setVPC(serviceAgreementId, kVerifiers, { from: publisher })
            assert.strictEqual(true, VPCstate.logs[0].args.state, 'unable to fulfill the proof of training condition')
            for (i = 0; i < VPCVerifiers.length; i++) {
                await fitchainConditions.freeMySlots(serviceAgreementId, { from: VPCVerifiers[i] })
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
                assert(slots, myFreeSlots, 'invalid free slots')
            }
        })
    })
})
