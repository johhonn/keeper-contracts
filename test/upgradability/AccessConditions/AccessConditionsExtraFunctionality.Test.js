/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const AccessConditionsExtraFunctionality = artifacts.require('AccessConditionsExtraFunctionality')

contract('AccessConditions', (accounts) => {
    let zos
    let accessConditionsAddress

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('AccessConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('AccessConditions')
        await zos.initialize(accounts[0], true)
        accessConditionsAddress = zos.getProxyAddress('AccessConditions')
    })

    describe('Test upgradability for AccessConditions', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('AccessConditionsExtraFunctionality')

            let p = await AccessConditionsExtraFunctionality.at(accessConditionsAddress)

            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()

            let n = await p.getNumber()
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })
    })
})
