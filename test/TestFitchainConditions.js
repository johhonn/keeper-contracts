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
        let funcFingerPrints, contracts, serviceAgreementId, slaMsgHash, signature, algorithmHash

        const publisher = accounts[0]
        const consumer  = accounts[1]
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

        before(async() => {
            token = await OceanToken.deployed()
            market = await OceanMarket.deployed()
            serviceAgreement = await ServiceAgreement.deployed()
            paymentConditions = await PaymentConditions.deployed(serviceAgreement.address, token.address)
            fitchainConditions = await FitchainConditions.deployed(serviceAgreement.address, 5)
            // conditions
            contracts = [paymentConditions.address, fitchainConditions.address, fitchainConditions, paymentConditions.address, paymentConditions.address]
            funcFingerPrints = [
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
            templateId = testUtils.getEventArgsFromTx(createAgreementTemplate, 'SetupAgreementTemplate').serviceTemplateId
            // create new agreement instance
            conditionKeys = testUtils.generateConditionsKeys(templateId, contracts, funcFingerPrints)
            slaMsgHash = testUtils.createSLAHash(web3, templateId, conditionKeys, valuesHashList, timeouts, serviceAgreementId)
            signature = await web3.eth.sign(slaMsgHash, consumer)
            serviceId = await testUtils.signAgreement(
                serviceAgreement, templateId, signature,
                datascientist, valuesHashList, timeouts,
                serviceAgreementId, did, { from: publisher }
            )
            assert.strictEqual(serviceId, serviceAgreementId, 'Error: unable to retrieve service agreement Id')
            await token.approve(paymentConditions.address, testUtils.toBigNumber(200), { from: consumer })
        })

    })
})
