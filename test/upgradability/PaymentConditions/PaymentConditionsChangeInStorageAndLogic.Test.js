/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const OceanToken = artifacts.require('OceanToken.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const PaymentConditionsChangeInStorageAndLogic = artifacts.require('PaymentConditionsChangeInStorageAndLogic')

contract('PaymentConditions', (accounts) => {
    let zos
    let token
    let pAddress
    let consumer = accounts[1]
    let serviceAgreementId = testUtils.generateId()
    let price = 1

    function createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer) {
        const conditionKeys = testUtils.generateConditionsKeys(testUtils.templateId, contracts, fingerprints)
        const hash = testUtils.createSLAHash(web3, testUtils.templateId, conditionKeys, valueHashes, timeoutValues, serviceAgreementId)
        return web3.eth.sign(hash, consumer)
    }

    async function initAgreement() {
        /* eslint-disable-next-line prefer-destructuring */
        let contracts = [pAddress]
        let fingerprints = [testUtils.getSelector(web3, PaymentConditions, 'lockPayment')]
        let dependenciesBits = [0]
        let valueHashes = [testUtils.valueHash(['bytes32', 'uint256'], [testUtils.assetId, price])]
        let timeoutValues = [0]

        token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
        let agreement = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))

        const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
        await agreement.setupAgreementTemplate(testUtils.templateId, contracts, fingerprints, dependenciesBits, testUtils.templateId, [0], 0, { from: accounts[0] })
        await agreement.executeAgreement(testUtils.templateId, signature, consumer, valueHashes, timeoutValues, serviceAgreementId, testUtils.templateId, { from: accounts[0] })
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
        it('Should be possible to append storage variables and change logic', async () => {
            await initAgreement()
            let p = await PaymentConditionsChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('PaymentConditionsChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            const result = await p.lockPayment(serviceAgreementId, testUtils.assetId, price, { from: consumer })
            // assert
            testUtils.assertEmitted(result, 1, 'PaymentLocked')

            let n = await p.called(zos.owner)
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })
    })
})
