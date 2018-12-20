/* global artifacts, contract, before, describe, it */
/* eslint-disable no-console, max-len */

const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const SLA = artifacts.require('ServiceExecutionAgreement.sol')
const PaymentCtrl = artifacts.require('PaymentConditions.sol')
const AccessCtrl = artifacts.require('AccessConditions.sol')
const testUtils = require('../utils')

const web3 = testUtils.getWeb3()

contract('ServiceExecutionAgreement', (accounts) => {
    describe('Test On-chain Authorization', () => {
        let token, market, sla, 
            paymentConditions, accessConditions, 
            resourceId, valuesHashList, 
            serviceId, conditionKeys, templateId

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
            sla = await SLA.new()
            paymentConditions = await PaymentCtrl.new(sla.address, token.address)
            accessConditions = await AccessCtrl.new(sla.address)
            // Do some preparations: give consumer funds, add an asset
            // consumer request initial funds to play
            console.log(consumer)
            await market.requestTokens(testUtils.toBigNumber(1000), fromConsumer)
            const bal = await token.balanceOf.call(consumer)
            console.log(`consumer has balance := ${bal.valueOf()} now`)
            resourceId = did
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
                testUtils.valueHash(['bytes32', 'bytes32'], [resourceId, resourceId]),
                testUtils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice]),
                testUtils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice])]
            console.log('conditions control contracts', contracts)
            console.log('functions: ', funcFingerPrints, valuesHashList)
            const setupTx = await sla.setupTemplate(
                serviceTemplateId,
                contracts,
                funcFingerPrints,
                dependencies,
                fulfillmentIndices,
                fulfilmentOperator,
                fromProvider
            )
            // Grab `TemplateSetup` event to fetch the serviceTemplateId
            templateId = testUtils.getEventArgsFromTx(setupTx, 'TemplateSetup').templateId
            conditionKeys = testUtils.generateConditionsKeys(templateId, contracts, funcFingerPrints)
            console.log('conditions: ', conditionKeys)
        })

        it('Consume asset happy path', async () => {
            const agreementId = testUtils.generateId(web3)

            const slaMsgHash = testUtils.createSLAHash(
                web3, templateId, conditionKeys,
                valuesHashList, timeouts,
                agreementId
            )
            const signature = await web3.eth.sign(slaMsgHash, consumer)

            await testUtils.signAgreement(
                sla, templateId, signature, consumer, valuesHashList, timeouts, agreementId, did, fromProvider
            )

            try {
                const fn = testUtils.getSelector(web3, accessConditions, 'checkPermissions')
                const invalidKey = testUtils.generateConditionsKeys(
                    templateId,
                    [accessConditions.address],
                    [fn])[0]
                await sla.getConditionStatus(agreementId, invalidKey)
            } catch (error) {
                console.log('invalid condition status: ', error)
            }

            let locked = await sla.getConditionStatus(agreementId, conditionKeys[0])
            await token.approve(
                paymentConditions.address,
                testUtils.toBigNumber(200),
                fromConsumer
            )
            const payTx = await paymentConditions.lockPayment(
                agreementId,
                resourceId,
                resourcePrice,
                fromConsumer
            )
            console.log(
                'lockpayment event: ',
                testUtils.getEventArgsFromTx(payTx, 'PaymentLocked').agreementId)

            locked = await sla.getConditionStatus(agreementId, conditionKeys[0])
            console.log('locked: ', locked.toNumber())
            const hasPermission = await accessConditions.checkPermissions(consumer, resourceId)
            console.log('consumer permission: ', hasPermission)
            // grant access
            const dep = await sla.hasUnfulfilledDependencies(agreementId, conditionKeys[1])
            console.log('has dependencies: ', dep)

            await sla.getConditionStatus(agreementId, conditionKeys[1])
            const gaccTx = await accessConditions.grantAccess(agreementId, resourceId, resourceId, fromProvider)
            console.log(
                'accessgranted event: ',
                testUtils.getEventArgsFromTx(gaccTx, 'AccessGranted').agreementId)
            const hasPermission1 = await accessConditions.checkPermissions(consumer, resourceId)
            console.log('consumer permission: ', hasPermission1)
            await sla.getConditionStatus(agreementId, conditionKeys[1])

            // release payment
            await sla.getConditionStatus(agreementId, conditionKeys[2])
            const releaseTx = await paymentConditions.releasePayment(agreementId, resourceId, resourcePrice, fromProvider)
            console.log(
                'releasepayment event: ',
                testUtils.getEventArgsFromTx(releaseTx, 'PaymentReleased').agreementId)
            await sla.getConditionStatus(agreementId, conditionKeys[2])

            try {
                await paymentConditions.refundPayment(agreementId, resourceId, resourcePrice, fromConsumer)
            } catch (err) {
                console.log('\t >> Good, refund is denied as expected.')
            }
        })

        it('Consume asset with Refund', async () => {
            const agreementId = testUtils.generateId(web3)
            const slaMsgHash = testUtils.createSLAHash(
                web3, templateId, conditionKeys,
                valuesHashList, timeouts,
                agreementId
            )
            const signature = await web3.eth.sign(slaMsgHash, consumer)

            await testUtils.signAgreement(
                sla, templateId, signature, consumer, valuesHashList, timeouts, agreementId, did, fromProvider
            )
            try {
                await paymentConditions.refundPayment(agreementId, resourceId, resourcePrice, fromConsumer)
            } catch (err) {
                console.log('\t >> Good, refund is denied as expected since payment is not locked yet.')
            }

            await token.approve(paymentConditions.address, testUtils.toBigNumber(200), fromConsumer)
            const payTx = await paymentConditions.lockPayment(agreementId, resourceId, resourcePrice, fromConsumer)
            console.log('lockpayment event: ', testUtils.getEventArgsFromTx(payTx, 'PaymentLocked').agreementId)
            // Now refund should go through, after timeout
            await testUtils.sleep(4000)
            try {
                const refundTx = await paymentConditions.refundPayment(agreementId, resourceId, resourcePrice, fromConsumer)
                console.log('refundPayment event: ', testUtils.getEventArgsFromTx(refundTx, 'PaymentRefund').agreementId)
            } catch (err) {
                console.log('\t >> Error: refund is denied, this should not occur.', err.message)
            }
        })
    })
})
