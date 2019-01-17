/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const ServiceExecutionAgreementChangeInStorageAndLogic = artifacts.require('ServiceExecutionAgreementChangeInStorageAndLogic')

contract('ServiceExecutionAgreement', (accounts) => {
    let serviceExecutionAgreementAddress
    let zos

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('ServiceExecutionAgreement')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('ServiceExecutionAgreement')
        await zos.initialize(accounts[0], true)
        serviceExecutionAgreementAddress = zos.getProxyAddress('ServiceExecutionAgreement')
    })

    describe('Test upgradability for ServiceExecutionAgreement', () => {
        it('Should be possible to append storage variables and change logic', async () => {
            let p = await ServiceExecutionAgreementChangeInStorageAndLogic.at(serviceExecutionAgreementAddress)
            await zos.upgradeToNewContract('ServiceExecutionAgreementChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            // add test
            const result = await p.setupAgreementTemplate(
                testUtils.templateId,
                [],
                [],
                [],
                testUtils.emptyBytes32,
                [],
                { from: accounts[0] })

            // assert
            testUtils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await p.getTemplateStatus(testUtils.templateId)
            assert.strictEqual(status, true)
            const n = await p.called(zos.owner)
            assert.equal(n.toNumber(), 1, 'Error calling added storage variable')
        })
    })
})
