/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('../helpers/ZeppelinHelper.js')
const testUtils = require('../helpers/utils.js')

const OceanToken = artifacts.require('OceanToken.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const PaymentConditionsWithBug = artifacts.require('PaymentConditionsWithBug')
const PaymentConditionsChangeInStorage = artifacts.require('PaymentConditionsChangeInStorage')
const PaymentConditionsExtraFunctionality = artifacts.require('PaymentConditionsExtraFunctionality')
const PaymentConditionsChangeInStorageAndLogic = artifacts.require('PaymentConditionsChangeInStorageAndLogic')
const PaymentConditionsChangeFunctionSignature = artifacts.require('PaymentConditionsChangeFunctionSignature')

global.artifacts = artifacts
global.web3 = web3
let zos

contract('PaymentConditions', (accounts) => {
    let token
    let pAddress
    let consumer = accounts[1]
    const assetId = '0x0000000000000000000000000000000000000000000000000000000000000001'
    const templateId = '0x0000000000000000000000000000000000000000000000000000000000000002'
    let serviceAgreementId = testUtils.generateId(web3)
    let price = 1

    function createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer) {
        const conditionKeys = testUtils.generateConditionsKeys(templateId, contracts, fingerprints)
        const hash = testUtils.createSLAHash(web3, templateId, conditionKeys, valueHashes, timeoutValues, serviceAgreementId)
        return web3.eth.sign(hash, consumer)
    }

    async function initAgreement() {
        /* eslint-disable-next-line prefer-destructuring */
        let contracts = [pAddress]
        let fingerprints = [testUtils.getSelector(web3, PaymentConditions, 'lockPayment')]
        let dependenciesBits = [0]
        let valueHashes = [testUtils.valueHash(['bytes32', 'uint256'], [assetId, price])]
        let timeoutValues = [0]

        token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
        let agreement = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))

        const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
        await agreement.setupAgreementTemplate(templateId, contracts, fingerprints, dependenciesBits, templateId, [0], 0, { from: accounts[0] })
        await agreement.executeAgreement(templateId, signature, consumer, valueHashes, timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })
        await token.setReceiver(consumer, { from: accounts[0] })
        await token.approve(pAddress, price, { from: consumer })
    }

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('PaymentConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('PaymentConditions')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('PaymentConditions')
    })

    describe('Test upgradability for PaymentConditions', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('PaymentConditionsExtraFunctionality')
            let p = await PaymentConditionsExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('PaymentConditionsChangeInStorage')
            let p = await PaymentConditionsChangeInStorage.at(pAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to append storage variables and change logic', async () => {
            await initAgreement()
            let p = await PaymentConditionsChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('PaymentConditionsChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            const result = await p.lockPayment(serviceAgreementId, assetId, price, { from: consumer })
            // assert
            testUtils.assertEmitted(result, 1, 'PaymentLocked')

            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to fix/add a bug', async () => {
            await initAgreement()
            let p = await PaymentConditionsWithBug.at(pAddress)
            await zos.upgradeToNewContract('PaymentConditionsWithBug')
            await zos.approveLatestTransaction()
            const result = await p.lockPayment(serviceAgreementId, assetId, price, { from: consumer })
            testUtils.assertEmitted(result, 0, 'PaymentLocked')
        })

        it('Should be possible to change function signature', async () => {
            await initAgreement()
            await zos.upgradeToNewContract('PaymentConditionsChangeFunctionSignature')
            let p = await PaymentConditionsChangeFunctionSignature.at(pAddress)
            await testUtils.assertRevert(p.lockPayment(serviceAgreementId, assetId, { from: consumer }))
            await zos.approveLatestTransaction()

            // upgrade and test again
            try {
                await p.methods['lockPayment(bytes32,bytes32)'](serviceAgreementId, assetId, { from: consumer })
                assert.fail('Expected revert not received')
            } catch (error) {
                assert.equal(error.reason, 'Invalid condition key', 'invalid revert reason')
            }
        })
    })
})
