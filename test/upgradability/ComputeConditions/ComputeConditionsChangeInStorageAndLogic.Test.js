/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const OceanToken = artifacts.require('OceanToken.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const AccessConditions = artifacts.require('AccessConditions.sol')
const ComputeConditions = artifacts.require('ComputeConditions.sol')

const ComputeConditionsChangeInStorageAndLogic = artifacts.require('ComputeConditionsChangeInStorageAndLogic')

contract('ComputeConditions', (accounts) => {
    let zos
    let pAddress
    let token, market, serviceAgreement, paymentConditions, accessConditions, computeConditions, valuesHashList, serviceId, conditionKeys, templateId
    let funcFingerPrints, contracts, slaMsgHash, signature, algorithmHash
    const publisher = accounts[0]
    const datascientist = accounts[1]
    // for more info about the Compute use case dependencyBits: https://github.com/oceanprotocol/dev-ocean/pull/85
    const fulfillmentIndices = [3, 4] // Root Conditions
    const fulfilmentOperator = 1 // OR
    const dependencies = [0, 1, 4, 16, 3]
    const price = 5 // 5 OCN tokens
    const timeouts = [0, 0, 0, 0, 100]
    const did = testUtils.generateId()
    const serviceTemplateId = testUtils.generateId()
    let serviceAgreementId = testUtils.generateId()
    const algorithm = 'THIS IS FAKE CODE foo=Hello World!'

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('ComputeConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('ComputeConditions')
        zos.addDependency('PaymentConditions')
        zos.addDependency('AccessConditions')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('ComputeConditions')
    })

    async function setupContracts() {
        token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
        serviceAgreement = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))
        paymentConditions = await PaymentConditions.at(zos.getProxyAddress('PaymentConditions'))
        accessConditions = await AccessConditions.at(zos.getProxyAddress('AccessConditions'))
        computeConditions = await ComputeConditions.at(zos.getProxyAddress('ComputeConditions'))

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
    }

    describe('Test upgradability for ComputeConditions', () => {
        it('Should be possible to append storage variables and change logic', async () => {
            await setupContracts()
            await zos.upgradeToNewContract('ComputeConditionsChangeInStorageAndLogic')
            let p = await ComputeConditionsChangeInStorageAndLogic.at(pAddress)
            algorithmHash = web3.utils.soliditySha3({ type: 'string', value: algorithm }).toString('hex')
            const signature = await web3.eth.sign(algorithmHash, datascientist)
            // should work after approval
            await zos.approveLatestTransaction()
            const submitAlgorithmSignature = await p.submitHashSignature(serviceAgreementId, signature, { from: datascientist })

            const isSignatureSubmitted = testUtils.getEventArgsFromTx(submitAlgorithmSignature, 'HashSignatureSubmitted')
            assert.strictEqual(isSignatureSubmitted.state, true, 'Error: Unable to submit signature')

            let n = await p.called(datascientist)
            assert.equal(n.toNumber() > 0, true, 'time of registry not created')
        })
    })
})
