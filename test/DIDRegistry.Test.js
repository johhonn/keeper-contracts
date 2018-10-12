/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const DIDRegistry = artifacts.require('DIDRegistry.sol')

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const utils = require('./utils.js')

contract('DIDRegistry', (accounts) => {
    describe('Register decentralised identifiers with attributes, fetch attributes by DID', () => {
        it('Should discover the attribute after registering it', async () => {
            const registry = await DIDRegistry.new()

            const did = web3.utils.fromAscii('did:ocn:test-attr')
            const providerDID = 'did:ocn:provider'
            const provider = web3.utils.fromAscii('provider')
            const assetType = 0
            const result = await registry.registerAttribute(did, assetType, provider, providerDID)

            utils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-attr', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(0, web3.utils.toDecimal(payload._type))
            assert.strictEqual('provider', web3.utils.hexToString(payload.key))
            assert.strictEqual(providerDID, payload.value)
        })

        it('Should not fail to register the same attribute twice', async () => {
            const registry = await DIDRegistry.new()

            const did = web3.utils.fromAscii('did:ocn:test-attr-twice')
            const providerDID = 'did:ocn:provider'
            const provider = web3.utils.fromAscii('provider')
            const assetType = 0

            await registry.registerAttribute(did, assetType, provider, providerDID)
            // try to register the same attribute the second time
            const result = await registry.registerAttribute(did, assetType, provider, providerDID)

            utils.assertEmitted(result, 1, 'DIDAttributeRegistered')
        })

        it('Should not fail to register crazy long did', async () => {
            const registry = await DIDRegistry.new()

            const crazyLongDID = 'did:ocn:test-attr-twice-crazy-long-dude-really-oh-yeah'
            const did = web3.utils.sha3(crazyLongDID)
            const providerDID = 'did:ocn:provider'
            const provider = web3.utils.fromAscii('provider')
            const assetType = 0

            const result = await registry.registerAttribute(did, assetType, provider, providerDID)
            const payload = result.logs[0].args
            assert.strictEqual(did, payload.did)
        })

        it('Should register multiple attributes', async () => {
            const registry = await DIDRegistry.new()

            const did = web3.utils.fromAscii('did:ocn:test-multiple-attrs')
            const providerDID = 'http://example.com'
            const provider = web3.utils.fromAscii('provider')
            const assetType = 0

            await registry.registerAttribute(did, assetType, provider, providerDID)

            const nameKey = web3.utils.fromAscii('name')
            const name = 'My asset.'
            const result = await registry.registerAttribute(did, assetType, nameKey, name)

            utils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-multiple-attrs', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(0, web3.utils.toDecimal(payload._type))
            assert.strictEqual('name', web3.utils.hexToString(payload.key))
            assert.strictEqual(name, payload.value)
        })

        it('Should only allow the owner to set an attribute', async () => {
            const registry = await DIDRegistry.new()

            const did = web3.utils.fromAscii('did:ocn:test-ownership')
            const providerDID = 'did:ocn:provider'
            const provider = web3.utils.fromAscii('provider')
            const assetType = 0

            await registry.registerAttribute(did, assetType, provider, providerDID)

            const anotherPerson = { from: accounts[1] }
            const anotherDID = web3.utils.fromAscii('did:ocn:test-another-owner')
            // a different owner can register his own DID
            await registry.registerAttribute(anotherDID, assetType, provider, providerDID, anotherPerson)

            var failed = false
            try {
                // must not be able to add attributes to someone else's DID
                await registry.registerAttribute(did, assetType, provider, providerDID, anotherPerson)
            } catch (e) {
                failed = true
            }
            assert.equal(true, failed)
        })
    })
})
