/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, beforeEach, before */

const DIDRegistry = artifacts.require('DIDRegistry.sol')
const testUtils = require('../../helpers/utils.js')
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

const web3 = testUtils.getWeb3()

contract('DIDRegistry', (accounts) => {
    let registry

    before('restore zos state', async () => {
        let zos = new ZeppelinHelper('DIDRegistry')
        await zos.restoreState(accounts[9])
    })

    beforeEach(async () => {
        let zos = new ZeppelinHelper('DIDRegistry')
        await zos.initialize(accounts[0], false)
        registry = await DIDRegistry.at(zos.getProxyAddress('DIDRegistry'))
    })

    describe('Register decentralised identifiers with attributes, fetch attributes by DID', () => {
        it('Should discover the attribute after registering it', async () => {
            const did = web3.utils.fromAscii('did:ocn:test-attr')
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            const result = await registry.registerAttribute(did, checksum, value)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-attr', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(checksum, payload.checksum)
            assert.strictEqual(value, payload.value)
        })

        it('Should find the event from the block number', async () => {
            const did = web3.utils.sha3('did:ocn:test-read-event-from-filter-using-block-number')
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            const result = await registry.registerAttribute(did, checksum, value)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

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
                        assert.strictEqual(value, logItem.returnValues.value)
                    }
                }
            })
        })

        it('Should not fail to register the same attribute twice', async () => {
            const did = web3.utils.fromAscii('did:ocn:test-attr-twice')
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            await registry.registerAttribute(did, checksum, value)

            // try to register the same attribute the second time
            const result = await registry.registerAttribute(did, checksum, value)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')
        })

        it('Should not fail to register crazy long did', async () => {
            const crazyLongDID = 'did:ocn:test-attr-twice-crazy-long-dude-really-oh-yeah'
            const did = web3.utils.sha3(crazyLongDID)
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            const result = await registry.registerAttribute(did, checksum, value)

            const payload = result.logs[0].args
            assert.strictEqual(did, payload.did)
        })

        it('Should only allow the owner to set an attribute', async () => {
            const did = web3.utils.fromAscii('did:ocn:test-attr')
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            await registry.registerAttribute(did, checksum, value)

            const anotherPerson = { from: accounts[1] }

            // a different owner can register his own DID
            let failed = false
            try {
                // must not be able to add attributes to someone else's DID
                await registry.registerAttribute(did, checksum, value, anotherPerson)
            } catch (e) {
                failed = true
            }
            assert.equal(true, failed)
        })
        it('Should not allow url value gt 2048 bytes long', async () => {
            const did = web3.utils.fromAscii('did:ocn:test-attr')
            const checksum = testUtils.generateId()
            // value is about 2049
            const value = 'dabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345xdfwfg'

            try {
                await registry.registerAttribute(did, checksum, value)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid url size')
            }
        })
    })
})
