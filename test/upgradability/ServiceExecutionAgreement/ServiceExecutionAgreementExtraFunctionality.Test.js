/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const ServiceExecutionAgreementExtraFunctionality = artifacts.require('ServiceExecutionAgreementExtraFunctionality')

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
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('ServiceExecutionAgreementExtraFunctionality')
            let p = await ServiceExecutionAgreementExtraFunctionality.at(serviceExecutionAgreementAddress)

            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()

            const n = await p.getNumber()
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })
    })
})
