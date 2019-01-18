/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const PaymentConditionsExtraFunctionality = artifacts.require('PaymentConditionsExtraFunctionality')

contract('PaymentConditions', (accounts) => {
    let zos
    let pAddress

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
            let n = await p.getNumber()
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })
    })
})
