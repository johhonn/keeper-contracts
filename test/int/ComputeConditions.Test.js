/* global artifacts, contract, before, describe, it, assert */
/* eslint-disable no-console, max-len */

const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const AccessConditions = artifacts.require('AccessConditions.sol')
const ComputeConditions = artifacts.require('ComputeConditions.sol')
const testUtils = require('../utils')
const web3 = testUtils.getWeb3()
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')

contract('ComputeConditions', (accounts) => {
    describe('Test On-Premise Compute Service Use Case', () => {
        let token, market, serviceAgreement, paymentConditions, accessConditions, computeConditions, valuesHashList, serviceId, conditionKeys, templateId
        let funcFingerPrints, contracts, serviceAgreementId, slaMsgHash, signature, algorithmHash
        const publisher = accounts[0]
        const datascientist = accounts[1]
        // for more info about the Compute use case dependencyBits: https://github.com/oceanprotocol/dev-ocean/pull/85
        const fulfillmentIndices = [3, 4] // Root Conditions
        const fulfilmentOperator = 1 // OR
        const dependencies = [0, 1, 4, 16, 3]
        const price = 5 // 5 OCN tokens
        const timeouts = [0, 0, 0, 0, 100]
        const did = testUtils.generateId(web3)
        const serviceTemplateId = testUtils.generateId(web3)
        serviceAgreementId = testUtils.generateId(web3)
        const algorithm = 'THIS IS FAKE CODE foo=Hello World!'
        const debug = ' -s'

        before(async () => {
            let tokenAddress = execSync('npx zos create OceanToken --init' + debug).toString().trim()
            let marketAddress = execSync('npx zos create OceanMarket --init initialize --args ' + tokenAddress + debug).toString().trim()
            let agreementAddress = execSync('npx zos create ServiceAgreement ' + debug).toString().trim()
            let paymentAddress = execSync('npx zos create PaymentConditions --init initialize --args ' + agreementAddress + ',' + tokenAddress + ' + debug').toString().trim()
            let accessAddress = execSync('npx zos create AccessConditions --init initialize --args ' + agreementAddress + debug).toString().trim()
            let computeAddress = execSync('npx zos create ComputeConditions --init initialize --args ' + agreementAddress + ' + debug').toString().trim()

            token = await OceanToken.at(tokenAddress)
            market = await OceanMarket.at(marketAddress)
            serviceAgreement = await ServiceAgreement.at(agreementAddress)
            paymentConditions = await PaymentConditions.at(paymentAddress)
            accessConditions = await AccessConditions.at(accessAddress)
            computeConditions = await ComputeConditions.at(computeAddress)

            await market.requestTokens(testUtils.toBigNumber(1000), { from: datascientist })
            // conditions
            contracts = [paymentConditions.address, computeConditions.address, accessConditions.address, paymentConditions.address, paymentConditions.address]
            funcFingerPrints = [
                testUtils.getSelector(web3, paymentConditions, 'lockPayment'),
                testUtils.getSelector(web3, computeConditions, 'fulfillUpload'),
                testUtils.getSelector(web3, accessConditions, 'grantAccess'),
                testUtils.getSelector(web3, paymentConditions, 'releasePayment'),
                testUtils.getSelector(web3, paymentConditions, 'refundPayment')
            ]
            valuesHashList = [
                testUtils.valueHash(['bytes32', 'uint256'], [did, price]),
                testUtils.valueHash(['bool'], [true]),
                testUtils.valueHash(['bytes32', 'bytes32'], [did, did]),
                testUtils.valueHash(['bytes32', 'uint256'], [did, price]),
                testUtils.valueHash(['bytes32', 'uint256'], [did, price])
            ]
            // create new on-premise compute template
            const createAgreementTemplate = await serviceAgreement.setupAgreementTemplate(
                serviceTemplateId, contracts, funcFingerPrints, dependencies,
                web3.utils.fromAscii('on-premise-compute'), fulfillmentIndices,
                fulfilmentOperator, { from: publisher }
            )
            templateId = testUtils.getEventArgsFromTx(createAgreementTemplate, 'SetupAgreementTemplate').serviceTemplateId
            // create new agreement instance

            conditionKeys = testUtils.generateConditionsKeys(templateId, contracts, funcFingerPrints)
            slaMsgHash = testUtils.createSLAHash(web3, templateId, conditionKeys, valuesHashList, timeouts, serviceAgreementId)
            signature = await web3.eth.sign(slaMsgHash, datascientist)
            serviceId = await testUtils.signAgreement(
                serviceAgreement, templateId, signature,
                datascientist, valuesHashList, timeouts,
                serviceAgreementId, did, { from: publisher }
            )
            assert.strictEqual(serviceId, serviceAgreementId, 'Error: unable to retrieve service agreement Id')
            await token.approve(paymentConditions.address, testUtils.toBigNumber(200), { from: datascientist })
        })

        it('Data Scientist should be able to lock payment for on-premise compute', async () => {
            await paymentConditions.lockPayment(serviceId, did, price, { from: datascientist })
            const locked = await serviceAgreement.getConditionStatus(serviceAgreementId, conditionKeys[0])
            assert.strictEqual(locked.toNumber(), 1, 'Error: Unable to lock payment!')
        })

        it('Data scientist should be able to submit algorithm signature', async () => {
            algorithmHash = web3.utils.soliditySha3({ type: 'string', value: algorithm }).toString('hex')
            const signature = await web3.eth.sign(algorithmHash, datascientist)
            const submitAlgorithmSignature = await computeConditions.submitHashSignature(serviceAgreementId, signature, { from: datascientist })
            const isSignatureSubmitted = testUtils.getEventArgsFromTx(submitAlgorithmSignature, 'HashSignatureSubmitted')
            assert.strictEqual(isSignatureSubmitted.state, true, 'Error: Unable to submit signature')
        })

        it('Service publisher should be able to submit algorithm hash and start computation', async () => {
            const submitAlgorithmHash = await computeConditions.submitAlgorithmHash(serviceAgreementId, algorithmHash, { from: publisher })
            const isHashSubmitted = testUtils.getEventArgsFromTx(submitAlgorithmHash, 'HashSubmitted')
            assert.strictEqual(isHashSubmitted.state, true, 'Error: Unable to submit algorithm hash')
            const fulfillUploadConditionState = await serviceAgreement.getConditionStatus(serviceAgreementId, conditionKeys[1])
            assert.strictEqual(fulfillUploadConditionState.toNumber(), 1, 'Error: unable to fulfill the upload condition')
        })

        it('Service publisher should be able to grant access for derived asset to the data scientist', async () => {
            await accessConditions.grantAccess(serviceAgreementId, did, did, { from: publisher })
            const fulfillAccessConditionState = await serviceAgreement.getConditionStatus(serviceAgreementId, conditionKeys[2])
            assert.strictEqual(fulfillAccessConditionState.toNumber(), 1, 'Error: unable to fulfill granted access to derived asset condition')
        })

        it('Service publisher should be able to release payment', async () => {
            await paymentConditions.releasePayment(serviceAgreementId, did, price, { from: publisher })
            const fulfillReleasePaymentConditionState = await serviceAgreement.getConditionStatus(serviceAgreementId, conditionKeys[3])
            assert.strictEqual(fulfillReleasePaymentConditionState.toNumber(), 1, 'Error: unable to fulfill release payment condition')
        })

        it('data scientist should not be able to make refund payment', async () => {
            await paymentConditions.refundPayment(serviceAgreementId, did, price, { from: datascientist })
            const fulfillRefundPaymentConditionState = await serviceAgreement.getConditionStatus(serviceAgreementId, conditionKeys[4])
            assert.strictEqual(fulfillRefundPaymentConditionState.toNumber(), 0, 'Error: unable to fulfill refund payment condition')
        })

        it('Service agreement should be fulfilled', async () => {
            await serviceAgreement.fulfillAgreement(serviceAgreementId, { from: publisher })
            const agreementTerminated = await serviceAgreement.isAgreementTerminated(serviceAgreementId, { from: publisher })
            assert.strictEqual(agreementTerminated, true, 'Error: unable to fulfill or terminate the agreement')
        })
    })
})
