/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')
const testUtils = require('../utils')

const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const AccessConditions = artifacts.require('AccessConditions.sol')
const ComputeConditions = artifacts.require('ComputeConditions.sol')

const ComputeConditionsWithBug = artifacts.require('ComputeConditionsWithBug')
const ComputeConditionsChangeInStorage = artifacts.require('ComputeConditionsChangeInStorage')
const ComputeConditionsExtraFunctionality = artifacts.require('ComputeConditionsExtraFunctionality')
const ComputeConditionsChangeInStorageAndLogic = artifacts.require('ComputeConditionsChangeInStorageAndLogic')
const ComputeConditionsChangeFunctionSignature = artifacts.require('ComputeConditionsChangeFunctionSignature')

global.artifacts = artifacts
global.web3 = web3

async function assertRevert(promise) {
    try {
        await promise
        assert.fail('Expected revert not received')
    } catch (error) {
        const revertFound = error.message.search('revert') >= 0
        assert(revertFound, `Expected "revert", got ${error} instead`)
    }
}

contract('ComputeConditions', (accounts) => {
    let zos
    let pAddress
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

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('ComputeConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('ComputeConditions')
        zos.addDependency('OceanMarket')
        zos.addDependency('PaymentConditions')
        zos.addDependency('AccessConditions')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('ComputeConditions')
    })

    async function setupContracts() {
        token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
        market = await OceanMarket.at(zos.getProxyAddress('OceanMarket'))
        serviceAgreement = await ServiceAgreement.at(zos.getProxyAddress('ServiceAgreement'))
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
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('ComputeConditionsExtraFunctionality')
            let p = await ComputeConditionsExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()

            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('ComputeConditionsChangeInStorage')
            let p = await ComputeConditionsChangeInStorage.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            // await p.setReceiver(accounts[0])
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

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

            let n
            await p.called(datascientist).then(i => { n = i })
            assert.equal(n.toNumber() > 0, true, 'time of registry not created')
        })

        it('Should be possible to fix/add a bug', async () => {
            await setupContracts()
            let p = await ComputeConditionsWithBug.at(pAddress)
            await zos.upgradeToNewContract('ComputeConditionsWithBug')
            algorithmHash = web3.utils.soliditySha3({ type: 'string', value: algorithm }).toString('hex')
            const signature = await web3.eth.sign(algorithmHash, accounts[2])
            assertRevert(p.submitHashSignature(serviceAgreementId, signature))
            await zos.approveLatestTransaction()
            await p.submitHashSignature(serviceAgreementId, signature)
        })

        it('Should be possible to change function signature', async () => {
            await setupContracts()
            await zos.upgradeToNewContract('ComputeConditionsChangeFunctionSignature')
            let p = await ComputeConditionsChangeFunctionSignature.at(pAddress)
            algorithmHash = web3.utils.soliditySha3({ type: 'string', value: algorithm }).toString('hex')
            const signature = await web3.eth.sign(algorithmHash, datascientist)

            assertRevert(p.submitHashSignature(true, signature, serviceAgreementId, { from: datascientist }))

            // should work after approval
            await zos.approveLatestTransaction()
            const submitAlgorithmSignature = await p.methods['submitHashSignature(bool,bytes,bytes32)'](true, signature, serviceAgreementId, { from: datascientist })

            const isSignatureSubmitted = testUtils.getEventArgsFromTx(submitAlgorithmSignature, 'HashSignatureSubmitted')
            assert.strictEqual(isSignatureSubmitted.state, true, 'Error: Unable to submit signature')
        })
    })
})
