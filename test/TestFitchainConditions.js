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
        let fingerPrints, contracts, serviceAgreementId, slaMsgHash, signature

        const publisher = accounts[0]
        const consumer = accounts[1]
        const verifier1 = accounts[2]
        const verifier2 = accounts[3]
        const verifier3 = accounts[4]

        const fulfillmentIndices = [3, 4]
        const fulfilmentOperator = 1 // OR
        const dependencies = [0, 1, 4, 16, 3]
        const slots = 1
        const price = 5 // 5 OCN tokens
        const timeouts = [0, 0, 0, 0, 100]
        const did = testUtils.generateId(web3)
        const serviceTemplateId = testUtils.generateId(web3)
        serviceAgreementId = testUtils.generateId(web3)

        before(async () => {
            token = await OceanToken.new()
            await token.setReceiver(accounts[0])
            market = await OceanMarket.deployed()
            serviceAgreement = await ServiceAgreement.deployed()
            paymentConditions = await PaymentConditions.deployed(serviceAgreement.address, token.address)
            fitchainConditions = await FitchainConditions.deployed(serviceAgreement.address, 5)
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
                testUtils.valueHash(['uint256'], [3]),
                testUtils.valueHash(['uint256'], [3]),
                testUtils.valueHash(['bytes32', 'uint256'], [did, price]),
                testUtils.valueHash(['bytes32', 'uint256'], [did, price])
            ]
            // create new on-premise compute template
            const createAgreementTemplate = await serviceAgreement.setupAgreementTemplate(
                serviceTemplateId, contracts, fingerPrints, dependencies,
                web3.utils.fromAscii('fitchain-use-case'), fulfillmentIndices,
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
            assert.strictEqual(serviceId, serviceAgreementId, 'Error: unable to retrieve service agreement Id')
            // transfer token to actors
            await token.transfer(consumer, 100, {from: accounts[0]})
            assert.strictEqual(100, web3.utils.toDecimal(await token.balanceOf(consumer)), 'invalid transfer')
            await token.transfer(verifier1, 100, {from: accounts[0]})
            assert.strictEqual(100, web3.utils.toDecimal(await token.balanceOf(verifier1)), 'invalid transfer')
            await token.transfer(verifier2, 100, {from: accounts[0]})
            assert.strictEqual(100, web3.utils.toDecimal(await token.balanceOf(verifier2)), 'invalid transfer')
            await token.transfer(verifier3, 100, {from: accounts[0]})
            assert.strictEqual(100, web3.utils.toDecimal(await token.balanceOf(consumer)), 'invalid transfer')
            await token.approve(paymentConditions.address, price, { from: consumer })
            // TODO: verifiers approve token for fitchain staking
        })

        it('Data scientist locks payment for the model provider', async () => {
            await paymentConditions.lockPayment(serviceId, did, price, { from: consumer })
//            const locked = await serviceAgreement.getConditionStatus(serviceAgreementId, conditionKeys[0])
//            assert.strictEqual(locked.toNumber(), 1, 'Error: Unable to lock payment!')
        })
        it('Verifiers register and stake based on the number of slots', async () => {
            const registerVerifier1 = await fitchainConditions.registerVerifier(slots, { from: verifier1 })
            assert.strictEqual(verifier1, registerVerifier1.logs[0].args.verifier, 'invalid verifier address')
            assert.strictEqual(verifier1, registerVerifier1.logs[0].args.verifier, 'invalid verifier address')
            const registerVerifier2 = await fitchainConditions.registerVerifier(slots, { from: verifier2 })
            const registerVerifier3 = await fitchainConditions.registerVerifier(slots, { from: verifier3 })
        })
        it('Model provider init Proof of Training (PoT)', async () => {
        })
        it('GPC verifiers submit votes to fulfill Proof of Training condition', async () => {
        })
        it('Verifiers should able to deregister if their slots are free', async () => {
            const deregisterVerifier1 = await fitchainConditions.deregisterVerifier({ from: verifier1 })
            const deregisterVerifier2 = await fitchainConditions.deregisterVerifier({ from: verifier2 })
            const deregisterVerifier3 = await fitchainConditions.deregisterVerifier({ from: verifier3 })
            assert.strictEqual(verifier1, deregisterVerifier1.logs[0].args.verifier, 'unable to deregister')
            assert.strictEqual(verifier2, deregisterVerifier2.logs[0].args.verifier, 'unable to deregister')
            assert.strictEqual(verifier3, deregisterVerifier3.logs[0].args.verifier, 'unable to deregister')
        })
    })
})
