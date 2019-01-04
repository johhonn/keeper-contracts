/* global artifacts, contract, describe, it, before */
/* eslint-disable no-console, max-len */

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const AccessConditions = artifacts.require('AccessConditions.sol')

const { hashAgreement } = require('../../helpers/hashAgreement.js')
const utils = require('../../helpers/utils')

const web3 = utils.getWeb3()

// console coloring source code here: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

contract('ServiceExecutionAgreement', (accounts) => {
    describe('Test Access Service Agreement', () => {
        let token, market, sea, paymentConditions, accessConditions, resourceId,
            valuesHashList, serviceId, conditionKeys, testTemplateId

        let funcFingerPrints, contracts
        const provider = accounts[0]
        const consumer = accounts[1]
        const fromProvider = { from: provider }
        const fromConsumer = { from: consumer }
        const resourcePrice = 3
        let timeouts = [0, 0, 0, 3]
        const fulfillmentIndices = [0] // Root Condition
        const fulfilmentOperator = 0 // AND
        const dependencies = [0, 1, 4, 1 | 2 ** 2 | 2 ** 3] // dependency bit | timeout bit
        const did = '0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
        const serviceTemplateId = '0x419d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
        before(async () => {
            token = await OceanToken.new()
            // await token.setReceiver(consumer)
            market = await OceanMarket.new(token.address)
            sea = await ServiceExecutionAgreement.new()
            paymentConditions = await PaymentConditions.new(sea.address, token.address)
            accessConditions = await AccessConditions.new(sea.address)
            // Do some preperations: give consumer funds, add an asset
            // consumer request initial funds to play
            console.log(consumer)
            await market.requestTokens(1000, fromConsumer)
            const bal = await token.balanceOf.call(consumer)
            console.log(`consumer has balance := ${bal.valueOf()} now`)
            resourceId = did
            console.log('publisher registers asset with id = ', resourceId)
            contracts = [paymentConditions.address, accessConditions.address, paymentConditions.address, paymentConditions.address]
            funcFingerPrints = [
                utils.getSelector(web3, paymentConditions, 'lockPayment'),
                utils.getSelector(web3, accessConditions, 'grantAccess'),
                utils.getSelector(web3, paymentConditions, 'releasePayment'),
                utils.getSelector(web3, paymentConditions, 'refundPayment')
            ]
            valuesHashList = [
                utils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice]),
                utils.valueHash(['bytes32'], [resourceId]),
                utils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice]),
                utils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice])]
            console.log('conditions control contracts', contracts)
            console.log('functions: ', funcFingerPrints, valuesHashList)
            const setupTx = await sea.setupTemplate(
                serviceTemplateId,
                contracts,
                funcFingerPrints,
                dependencies,
                fulfillmentIndices,
                fulfilmentOperator,
                fromProvider
            )
            // Grab `SetupAgreementTemplate` event to fetch the serviceTemplateId
            const { templateId } = utils.getEventArgsFromTx(setupTx, 'TemplateSetup')
            testTemplateId = templateId

            // console.log('templateid: ', templateId)
            conditionKeys = utils.generateConditionsKeys(templateId, contracts, funcFingerPrints)
            console.log('conditions: ', conditionKeys)
        })

        it('Consume asset happy path', async () => {
            const serviceAgreementId = utils.generateId()
            const slaMsgHash = hashAgreement(
                testTemplateId,
                conditionKeys,
                valuesHashList,
                timeouts,
                serviceAgreementId
            )
            const signature = await web3.eth.sign(slaMsgHash, consumer)

            serviceId = await utils.initializeAgreement(
                sea, testTemplateId, signature, consumer, valuesHashList, timeouts, serviceAgreementId, did, fromProvider
            )

            try {
                const fn = utils.getSelector(web3, accessConditions, 'checkPermissions')
                const invalidKey = utils.generateConditionsKeys(testTemplateId, [accessConditions.address], [fn])[0]
                await sea.getConditionStatus(serviceId, invalidKey)
            } catch (error) {
                console.log('invalid condition status: ', error)
            }

            let locked = await sea.getConditionStatus(serviceId, conditionKeys[0])
            await token.approve(paymentConditions.address, 200, fromConsumer)
            const payTx = await paymentConditions.lockPayment(serviceId, resourceId, resourcePrice, fromConsumer)
            console.log('lockpayment event: ', utils.getEventArgsFromTx(payTx, 'PaymentLocked').serviceId)

            locked = await sea.getConditionStatus(serviceId, conditionKeys[0])
            console.log('locked: ', locked.toNumber())
            const hasPermission = await accessConditions.checkPermissions(consumer, resourceId)
            console.log('consumer permission: ', hasPermission)
            // grant access
            const dep = await sea.hasUnfulfilledDependencies(serviceId, conditionKeys[1])
            console.log('has dependencies: ', dep)

            await sea.getConditionStatus(serviceId, conditionKeys[1])
            const gaccTx = await accessConditions.grantAccess(serviceId, resourceId, fromProvider)
            console.log('accessgranted event: ', utils.getEventArgsFromTx(gaccTx, 'AccessGranted').serviceId)
            const hasPermission1 = await accessConditions.checkPermissions(consumer, resourceId)
            console.log('consumer permission: ', hasPermission1)
            await sea.getConditionStatus(serviceId, conditionKeys[1])

            // release payment
            await sea.getConditionStatus(serviceId, conditionKeys[2])
            const releaseTx = await paymentConditions.releasePayment(serviceId, resourceId, resourcePrice, fromProvider)
            console.log('releasepayment event: ', utils.getEventArgsFromTx(releaseTx, 'PaymentReleased').serviceId)
            await sea.getConditionStatus(serviceId, conditionKeys[2])

            try {
                await paymentConditions.refundPayment(serviceId, resourceId, resourcePrice, fromConsumer)
            } catch (err) {
                console.log('\t >> Good, refund is denied as expected.')
            }
        })

        it('Consume asset with Refund', async () => {
            const serviceAgreementId = utils.generateId()
            const slaMsgHash = hashAgreement(
                testTemplateId,
                conditionKeys,
                valuesHashList,
                timeouts,
                serviceAgreementId
            )
            const signature = await web3.eth.sign(slaMsgHash, consumer)

            serviceId = await utils.initializeAgreement(
                sea, testTemplateId, signature, consumer, valuesHashList, timeouts, serviceAgreementId, did, fromProvider
            )
            try {
                await paymentConditions.refundPayment(serviceId, resourceId, resourcePrice, fromConsumer)
            } catch (err) {
                console.log('\t >> Good, refund is denied as expected since payment is not locked yet.')
            }

            await token.approve(paymentConditions.address, 200, fromConsumer)
            const payTx = await paymentConditions.lockPayment(serviceId, resourceId, resourcePrice, fromConsumer)
            console.log('lockpayment event: ', utils.getEventArgsFromTx(payTx, 'PaymentLocked').agreementId)
            // Now refund should go through, after timeout
            await utils.sleep(4000)
            try {
                const refundTx = await paymentConditions.refundPayment(serviceId, resourceId, resourcePrice, fromConsumer)
                console.log('refundPayment event: ', utils.getEventArgsFromTx(refundTx, 'PaymentRefund').agreementId)
            } catch (err) {
                console.log('\t >> Error: refund is denied, this should not occur.', err.message)
            }
        })
    })
})
