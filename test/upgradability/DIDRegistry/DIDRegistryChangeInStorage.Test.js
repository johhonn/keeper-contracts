/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it, before, beforeEach */

const testUtils = require('../../helpers/utils.js')
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

const DIDRegistryChangeInStorage = artifacts.require('DIDRegistryChangeInStorage')

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
        it('Should be possible to append storage variables ', async () => {
            let did = web3.utils.fromAscii('did:ocn:test-attr')
            await zos.upgradeToNewContract('DIDRegistryChangeInStorage')
            let p = await DIDRegistryChangeInStorage.at(dIDRegistryAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.timeOfRegister(did))

            // Approve and call again
            await zos.approveLatestTransaction()
            let n = await p.timeOfRegister(did)
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })
    })
})
