/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it, before, beforeEach */

const testUtils = require('../helpers/utils.js')
const deploy = require('../helpers/zos/deploy')
const upgrade = require('../helpers/zos/upgrade')
const loadWallet = require('../helpers/wallet/loadWallet')
const createWallet = require('../helpers/wallet/createWallet')

const DIDRegistry = artifacts.require('DIDRegistry')
const DIDRegistryWithBug = artifacts.require('DIDRegistryWithBug')

contract('DIDRegistry', (accounts) => {
    let adminWallet,
        proxyAddress

    beforeEach('Deploy with zos before each tests', async function() {
        await createWallet(true)
        adminWallet = await loadWallet('upgrader') // zos admin MultiSig
        proxyAddress = await deploy('deploy', ['DIDRegistry'])
    })

    describe('Test upgradability for DIDRegistry', () => {
        it('Should be possible to fix/add a bug', async () => {
            let proxy = await DIDRegistry.at(proxyAddress)

            let did = web3.utils.sha3('did:ocn:test-attr')
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'

            let result = await proxy.registerAttribute(did, checksum, value)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            let payload = result.logs[0].args
            assert.strictEqual(did, payload.did)
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(checksum, payload.checksum)
            assert.strictEqual(value, payload.value)

            // Upgrade to insert bug
            // Upgrade to new version
            const txId = await upgrade(
                'DIDRegistry',
                'DIDRegistryWithBug',
                proxyAddress,
                adminWallet,
                accounts[0]
            )
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            proxy = await DIDRegistryWithBug.at(proxyAddress)

            // check functionality works
            did = web3.utils.sha3('did:ocn:test-attrN')
            result = await proxy.registerAttribute(did, checksum, value)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            payload = result.logs[0].args
            assert.strictEqual(did, payload.did)
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(checksum, payload.checksum)
            assert.strictEqual(value, payload.value)

            // test for bug
            assert.equal(
                (await proxy.getUpdateAt(did)).toNumber(), 42,
                'getUpdatedAt value is not 42 (according to bug)')
        })
    })
})
