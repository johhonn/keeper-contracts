/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */

const testUtils = require('../../helpers/utils.js')
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

const DIDRegistryExtraFunctionality = artifacts.require('DIDRegistryExtraFunctionality')

contract('DIDRegistry', (accounts) => {
    let zos
    let dIDRegistryAddress

    before('Restore zos before all tests', async function() {
        zos = new ZeppelinHelper('DIDRegistry')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('DIDRegistry')
        await zos.initialize(accounts[0], true)
        dIDRegistryAddress = zos.getProxyAddress('DIDRegistry')
    })

    describe('Test upgradability for DIDRegistry', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('DIDRegistryExtraFunctionality')
            let p = await DIDRegistryExtraFunctionality.at(dIDRegistryAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n = await p.getNumber()
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })
    })
})
