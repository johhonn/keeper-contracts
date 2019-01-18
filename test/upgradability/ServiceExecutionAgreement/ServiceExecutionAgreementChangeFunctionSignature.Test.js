/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const ServiceExecutionAgreementChangeFunctionSignature = artifacts.require('ServiceExecutionAgreementChangeFunctionSignature')

contract('ServiceExecutionAgreement', (accounts) => {
    let zos
    let serviceExecutionAgreementAddress

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
        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('ServiceExecutionAgreementChangeFunctionSignature')

            let p = await ServiceExecutionAgreementChangeFunctionSignature.at(serviceExecutionAgreementAddress)

            // expect revert
            await testUtils.assertRevert(p.setupTemplate(
                [],
                testUtils.templateId,
                [],
                [],
                [],
                0))

            // Approve and test new logic
            await zos.approveLatestTransaction()

            // act
            const result = await p.setupTemplate(
                [],
                testUtils.templateId,
                [],
                [],
                [],
                0)

            // eval
            testUtils.assertEmitted(result, 1, 'TemplateSetup')
            const status = await p.getTemplateStatus(testUtils.templateId)
            assert.strictEqual(status, true)
        })
    })
})
