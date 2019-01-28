/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it, before, beforeEach */

const testUtils = require('../../helpers/utils.js')
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

const DIDRegistryChangeFunctionSignature = artifacts.require('DIDRegistryChangeFunctionSignature')

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
        it('Should be possible to change function signature', async () => {
            // Get proxy and upgrade to new instance
            let p = await DIDRegistryChangeFunctionSignature.at(dIDRegistryAddress)
            await zos.upgradeToNewContract('DIDRegistryChangeFunctionSignature')
            await zos.approveLatestTransaction()

            // prepare
            const did = web3.utils.sha3('did:ocn:test-attr')
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'

            // should revert
            await testUtils.assertRevert(p.registerAttribute(checksum, did, value))

            // act
            let result = await p.registerAttribute(checksum, did, value)

            // eval
            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual(did, payload.did)
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(checksum, payload.checksum)
            assert.strictEqual(value, payload.value)
        })
    })
})
