/* eslint-env mocha */
/* global artifacts, contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const testUtils = require('../../helpers/utils.js')
const constants = require('../../helpers/constants.js')

contract('DIDRegistry', (accounts) => {
    async function setupTest({
        owner = accounts[1]
    } = {}) {
        const didRegistryLibrary = await DIDRegistryLibrary.new()
        await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
        const didRegistry = await DIDRegistry.new()

        await didRegistry.initialize(owner)
        const common = await Common.new()
        return {
            common,
            didRegistry,
            owner
        }
    }

    describe('Register decentralised identifiers with attributes, fetch attributes by DID', () => {
        it('Should discover the attribute after registering it', async () => {
            const { didRegistry } = await setupTest()
            const did = constants.did[0]
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            const result = await didRegistry.registerAttribute(did, checksum, value)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual(did, payload._did)
            assert.strictEqual(accounts[0], payload._owner)
            assert.strictEqual(checksum, payload._checksum)
            assert.strictEqual(value, payload._value)
        })

        it('Should find the event from the block number', async () => {
            const { didRegistry } = await setupTest()
            const did = constants.did[0]
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            const result = await didRegistry.registerAttribute(did, checksum, value)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            // get owner for a did
            const owner = await didRegistry.getDIDOwner(did)
            assert.strictEqual(accounts[0], owner)

            // get the blockNumber for the last update
            const blockNumber = await didRegistry.getBlockNumberUpdated(did)
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
            didRegistry.getPastEvents(filterOptions, function(error, logItems) {
                if (!error) {
                    if (logItems.length > 0) {
                        const logItem = logItems[logItems.length - 1]
                        assert.strictEqual(did, logItem.returnValues._did)
                        assert.strictEqual(owner, logItem.returnValues._owner)
                        assert.strictEqual(value, logItem.returnValues._value)
                    }
                }
            })
        })

        it('Should not fail to register the same attribute twice', async () => {
            const { didRegistry } = await setupTest()
            const did = constants.did[0]
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            await didRegistry.registerAttribute(did, checksum, value)

            // try to register the same attribute the second time
            const result = await didRegistry.registerAttribute(did, checksum, value)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')
        })

        it('Should only allow the owner to set an attribute', async () => {
            const { didRegistry } = await setupTest()
            const did = constants.did[0]
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            await didRegistry.registerAttribute(did, checksum, value)

            const anotherPerson = { from: accounts[1] }

            // a different owner can register his own DID
            await assert.isRejected(
                // must not be able to add attributes to someone else's DID
                didRegistry.registerAttribute(did, checksum, value, anotherPerson),
                constants.registry.error.onlyDIDOwner
            )
        })

        it('Should not allow url value gt 2048 bytes long', async () => {
            const { didRegistry } = await setupTest()
            const did = constants.did[0]
            const checksum = testUtils.generateId()
            // value is about 2049
            const value = 'dabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345xdfwfg'

            await assert.isRejected(
                didRegistry.registerAttribute(did, checksum, value),
                constants.registry.error.invalidValueSize
            )
        })
        it('Should DID registry handle DID duplicates consistently', async () => {
            const { didRegistry } = await setupTest()
            const did = constants.did[0]
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            await didRegistry.registerAttribute(did, checksum, value)
            const didRegistryListSizeBefore = (await didRegistry.getDIDRegistrySize()).toNumber()

            // update checksum & value
            const newValue = 'https://exmaple.net/did/ocean/test-attr-example.txt'
            const newChecksum = testUtils.generateId()
            await didRegistry.registerAttribute(did, newChecksum, newValue)
            const didRegistryListSizeAfter = (await didRegistry.getDIDRegistrySize()).toNumber()

            assert.equal(
                didRegistryListSizeBefore,
                didRegistryListSizeAfter,
                'Indicating invalid DID duplicate handling'
            )

            // registering new DID
            const newDid = constants.did[1]
            await didRegistry.registerAttribute(newDid, checksum, value)
            // assert
            assert.equal(
                (await didRegistry.getDIDRegistrySize()).toNumber(),
                2,
                'Indicating invalid DID duplicate handling'
            )
        })
    })
    describe('get DIDRegister', () => {
        it('successful register should DIDRegister', async () => {
            const { common, didRegistry } = await setupTest()
            const did = constants.did[0]
            const checksum = testUtils.generateId()
            const value = 'https://exmaple.com/did/ocean/test-attr-example.txt'
            const blockNumber = await common.getCurrentBlockNumber()
            await didRegistry.registerAttribute(did, checksum, value)
            const storedDIDRegister = await didRegistry.getDIDRegister(did)
            assert.strictEqual(
                storedDIDRegister.owner,
                accounts[0]
            )
            assert.strictEqual(
                storedDIDRegister.lastChecksum,
                checksum
            )
            assert.strictEqual(
                storedDIDRegister.lastUpdatedBy,
                accounts[0]
            )
            assert.strictEqual(
                storedDIDRegister.blockNumberUpdated.toNumber(),
                blockNumber.toNumber()
            )

            const getDIDRegisterIds = await didRegistry.getDIDRegisterIds()
            assert.lengthOf(getDIDRegisterIds, 1)
            assert.strictEqual(
                getDIDRegisterIds[0],
                did
            )
        })
    })
})
