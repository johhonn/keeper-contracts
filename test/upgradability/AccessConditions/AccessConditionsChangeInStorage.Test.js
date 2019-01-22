/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const AccessConditionsChangeInStorage = artifacts.require('AccessConditionsChangeInStorage')

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
        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('AccessConditionsChangeInStorage')

            let p = await AccessConditionsChangeInStorage.at(accessConditionsAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()

            let n = await p.called(zos.owner)
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })
    })
})
