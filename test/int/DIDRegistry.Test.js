/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const DIDRegistry = artifacts.require('DIDRegistry.sol')
const utils = require('../helpers/utils.js')

const web3 = utils.getWeb3()

contract('DIDRegistry', (accounts) => {
    describe('Register decentralised identifiers with attributes, fetch attributes by DID', () => {
        it('Should discover the attribute after registering it', async () => {
            const registry = await DIDRegistry.new()

            const did = web3.utils.fromAscii('did:ocn:test-attr')
            const providerDID = 'did:ocn:provider'
            const provider = web3.utils.fromAscii('provider')
            const valueType = 0
            const result = await registry.registerAttribute(did, valueType, provider, providerDID)

            utils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-attr', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(0, web3.utils.toDecimal(payload.valueType))
            assert.strictEqual('provider', web3.utils.hexToString(payload.key))
            assert.strictEqual(providerDID, payload.value)
        })

        it('Should find the event from the block number', async () => {
            const registry = await DIDRegistry.new()

            const did = web3.utils.sha3('did:ocn:test-read-event-from-filter-using-block-number')
            const providerDID = 'did:ocn:provider'
            const providerKey = web3.utils.fromAscii('provider')
            const valueType = 0
            const result = await registry.registerAttribute(did, valueType, providerKey, providerDID)

            utils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            // get owner for a did
            const owner = await registry.getOwner(did)
            assert.strictEqual(accounts[0], owner)

            // get the blockNumber for the last update
            const blockNumber = await registry.getUpdateAt(did)
            assert(blockNumber > 0)

            // filter on the blockNumber only
            const filterOptions = {
                fromBlock: blockNumber,
                toBlock: blockNumber,
                filter: {
                    did: did,
                    owner: owner
                }
            }
            registry.getPastEvents(filterOptions, function(error, logItems) {
                if (!error) {
                    if (logItems.length > 0) {
                        const logItem = logItems[logItems.length - 1]
                        assert.strictEqual(did, logItem.returnValues.did)
                        assert.strictEqual(owner, logItem.returnValues.owner)
                        assert.strictEqual(0, web3.utils.toDecimal(logItem.returnValues.valueType))
                        assert.strictEqual('provider', web3.utils.hexToString(logItem.returnValues.key))
                        assert.strictEqual(providerDID, logItem.returnValues.value)
                    }
                }
            })
        })

        it('Should not fail to register the same attribute twice', async () => {
            const registry = await DIDRegistry.new()

            const did = web3.utils.fromAscii('did:ocn:test-attr-twice')
            const providerDID = 'did:ocn:provider'
            const provider = web3.utils.fromAscii('provider')
            const valueType = 0

            await registry.registerAttribute(did, valueType, provider, providerDID)
            // try to register the same attribute the second time
            const result = await registry.registerAttribute(did, valueType, provider, providerDID)

            utils.assertEmitted(result, 1, 'DIDAttributeRegistered')
        })

        it('Should not fail to register crazy long did', async () => {
            const registry = await DIDRegistry.new()

            const crazyLongDID = 'did:ocn:test-attr-twice-crazy-long-dude-really-oh-yeah'
            const did = web3.utils.sha3(crazyLongDID)
            const providerDID = 'did:ocn:provider'
            const provider = web3.utils.fromAscii('provider')
            const valueType = 0

            const result = await registry.registerAttribute(did, valueType, provider, providerDID)
            const payload = result.logs[0].args
            assert.strictEqual(did, payload.did)
        })

        it('Should register multiple attributes', async () => {
            const registry = await DIDRegistry.new()

            const did = web3.utils.fromAscii('did:ocn:test-multiple-attrs')
            const providerDID = 'http://example.com'
            const provider = web3.utils.fromAscii('provider')
            const valueType = 0

            await registry.registerAttribute(did, valueType, provider, providerDID)

            const nameKey = web3.utils.fromAscii('name')
            const name = 'My asset.'
            const result = await registry.registerAttribute(did, valueType, nameKey, name)

            utils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-multiple-attrs', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(0, web3.utils.toDecimal(payload.valueType))
            assert.strictEqual('name', web3.utils.hexToString(payload.key))
            assert.strictEqual(name, payload.value)
        })

        it('Should only allow the owner to set an attribute', async () => {
            const registry = await DIDRegistry.new()

            const did = web3.utils.fromAscii('did:ocn:test-ownership')
            const providerDID = 'did:ocn:provider'
            const provider = web3.utils.fromAscii('provider')
            const valueType = 0

            await registry.registerAttribute(did, valueType, provider, providerDID)

            const anotherPerson = { from: accounts[1] }
            const anotherDID = web3.utils.fromAscii('did:ocn:test-another-owner')
            // a different owner can register his own DID
            await registry.registerAttribute(anotherDID, valueType, provider, providerDID, anotherPerson)

            let failed = false
            try {
                // must not be able to add attributes to someone else's DID
                await registry.registerAttribute(did, valueType, provider, providerDID, anotherPerson)
            } catch (e) {
                failed = true
            }
            assert.equal(true, failed)
        })
    })
})
