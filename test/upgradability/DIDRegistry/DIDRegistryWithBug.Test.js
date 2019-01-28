/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it, before, beforeEach */

const testUtils = require('../../helpers/utils.js')
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

const DIDRegistry = artifacts.require('DIDRegistry')
const DIDRegistryWithBug = artifacts.require('DIDRegistryWithBug')

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
        it('Should be possible to fix/add a bug', async () => {
            // register attribute
            let registry = await DIDRegistry.at(dIDRegistryAddress)

            const did = web3.utils.sha3('did:ocn:test-attr')
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'

            let result = await registry.registerAttribute(checksum, did, value)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual(did, payload.did)
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(checksum, payload.checksum)
            assert.strictEqual(value, payload.value)

            // Upgrade to insert bug
            await zos.upgradeToNewContract('DIDRegistryWithBug')
            let p = await DIDRegistryWithBug.at(dIDRegistryAddress)
            await zos.approveLatestTransaction()

            // check functionality works
            did = web3.utils.fromAscii('did:ocn:test-attrN')
            result = await registry.registerAttribute(checksum, did, value)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-attrN', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(checksum, payload.checksum)
            assert.strictEqual(value, payload.value)

            // test for bug
            let n = await p.getUpdateAt(did)
            assert.equal(n.toNumber(), 42, 'getUpdatedAt value is not 42 (according to bug)')
        })
    })
})
