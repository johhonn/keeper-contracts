/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const ServiceExecutionAgreementWithBug = artifacts.require('ServiceExecutionAgreementWithBug')

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
        it('Should be possible to fix/add a bug', async () => {
            let p = await ServiceExecutionAgreementWithBug.at(serviceExecutionAgreementAddress)
            await zos.upgradeToNewContract('ServiceExecutionAgreementWithBug')
            await zos.approveLatestTransaction()
            // add test
            const result = await p.setupTemplate(
                testUtils.templateId,
                [],
                [],
                [],
                [],
                0,
                { from: accounts[0] })
            // assert
            testUtils.assertEmitted(result, 1, 'TemplateSetup')
            const status = await p.getTemplateStatus(testUtils.templateId)
            assert.strictEqual(status, false)
        })
    })
})
