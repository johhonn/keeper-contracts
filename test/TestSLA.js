/* global artifacts, contract, before, describe, it */
/* eslint-disable no-console, max-len */

const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const SLA = artifacts.require('ServiceAgreement.sol')
const PaymentCtrl = artifacts.require('PaymentConditions.sol')
const AccessCtrl = artifacts.require('AccessConditions.sol')
const testUtils = require('./utils')

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

contract('ServiceAgreement', (accounts) => {
    describe('Test On-chain Authorization', () => {
        let token, market, sla, paymentConditions, accessConditions, resourceId, valuesHashList, signature, serviceId
        let funcFingerPrints, contracts
        const provider = accounts[0]
        const consumer = accounts[1]
        const fromProvider = { from: provider }
        const fromConsumer = { from: consumer }
        const resourcePrice = 3
        const resourceName = 'self-driving ai data'
        const serviceName = resourceName
        let timeouts = [0, 0, 0, 3]
        const dependencies = [0, 4, 16, (2 ** 6) | (2 ** 7)] // dependency bit | timeout bit
        before(async () => {
            token = await OceanToken.new()
            // await token.setReceiver(consumer)
            market = await OceanMarket.new(token.address)
            sla = await SLA.new()
            paymentConditions = await PaymentCtrl.new(sla.address, token.address)
            accessConditions = await AccessCtrl.new(sla.address)
            // Do some preperations: give consumer funds, add an asset
            // consumer request initial funds to play
            console.log(consumer)
            await market.requestTokens(testUtils.toBigNumber(1000), fromConsumer)
            await market.requestTokens(testUtils.toBigNumber(1000), fromProvider)
            const bal = await token.balanceOf.call(consumer)
            console.log(`consumer has balance := ${bal.valueOf()} now`)
            // register dataset
            resourceId = await market.generateId(resourceName, fromProvider)
            await market.register(resourceId, testUtils.toBigNumber(resourcePrice), fromProvider)
            console.log('publisher registers asset with id = ', resourceId)
            contracts = [paymentConditions.address, accessConditions.address, paymentConditions.address, paymentConditions.address]
            funcFingerPrints = [
                testUtils.getSelector(web3, paymentConditions, 'lockPayment'),
                testUtils.getSelector(web3, accessConditions, 'grantAccess'),
                testUtils.getSelector(web3, paymentConditions, 'releasePayment'),
                testUtils.getSelector(web3, paymentConditions, 'refundPayment')
            ]
            valuesHashList = [
                testUtils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice]),
                testUtils.valueHash(['bytes32'], [resourceId]),
                testUtils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice]),
                testUtils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice])]
            console.log('conditions control contracts', contracts)
            console.log('functions: ', funcFingerPrints, valuesHashList)
            const setupTx = await sla.setupAgreementTemplate(
                contracts, funcFingerPrints, dependencies,
                web3.utils.fromAscii(serviceName), fromProvider
            )
            // Grab `SetupAgreementTemplate` event to fetch the serviceTemplateId
            const templateId = testUtils.getEventArgsFromTx(setupTx, 'SetupAgreementTemplate').serviceTemplateId
            console.log('templateid: ', templateId)
            const slaMsgHash = testUtils.createSLAHash(
                web3, templateId, testUtils.generateConditionsKeys(templateId, contracts, funcFingerPrints),
                valuesHashList, timeouts
            )
            signature = await web3.eth.sign(slaMsgHash, consumer)
            console.log('aaaaaaaaaaaaa')
            // Start a purchase, i.e. execute the service agreement
            serviceId = await testUtils.signAgreement(
                sla, templateId, signature, consumer, valuesHashList, timeouts, fromProvider
            )
            console.log('serviceId: ', serviceId)
            // console.log(execAgrArgs)
        })

        it('Consume asset happy path', async () => {
            // try to get access before lock payment, should fail
            // TODO:
            // Submit payment via the PaymentConditions contract
            // grab event of payment locked
            await token.approve(paymentConditions.address, testUtils.toBigNumber(200), fromConsumer)
            const payTx = await paymentConditions.lockPayment(serviceId, resourceId, resourcePrice, fromConsumer)
            console.log('lockpayment event: ', testUtils.getEventArgsFromTx(payTx, 'PaymentLocked').serviceId)

            // grant access
            await accessConditions.grantAccess(serviceId, resourceId, fromProvider)
            // console.log('accessgranted event: ', testUtils.getEventArgsFromTx(gaccTx, 'AccessGranted').serviceId)

            // release payment
            await paymentConditions.releasePayment(serviceId, resourceId, resourcePrice, fromProvider)
            // console.log('releasepayment event: ', testUtils.getEventArgsFromTx(releaseTx, 'PaymentReleased').serviceId)

            // const refundTx = await paymentConditions.refundPayment(serviceId, resourceId, resourcePrice, fromConsumer)
            // console.log('releasepayment event: ', testUtils.getEventArgsFromTx(releaseTx, 'PaymentRefund').serviceId)
        })

        it('Consume asset with Refund', async () => {
            console.log('refund ...')
        })
    })
})
