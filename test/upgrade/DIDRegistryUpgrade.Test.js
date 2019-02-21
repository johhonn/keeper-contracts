/* eslint-env mocha */
/* global artifacts, contract, describe, it, beforeEach, before */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const constants = require('../helpers/constants.js')
const testUtils = require('../helpers/utils.js')
const deploy = require('../helpers/zos/deploy')
const upgrade = require('../helpers/zos/upgrade')
const loadWallet = require('../helpers/wallet/loadWallet')
const createWallet = require('../helpers/wallet/createWallet')

const DIDRegistry = artifacts.require('DIDRegistry')
const DIDRegistryChangeFunctionSignature = artifacts.require('DIDRegistryChangeFunctionSignature')
const DIDRegistryChangeInStorage = artifacts.require('DIDRegistryChangeInStorage')
const DIDRegistryChangeInStorageAndLogic = artifacts.require('DIDRegistryChangeInStorageAndLogic')
const DIDRegistryExtraFunctionality = artifacts.require('DIDRegistryExtraFunctionality')
const DIDRegistryWithBug = artifacts.require('DIDRegistryWithBug')

contract('DIDRegistry', (accounts) => {
    let adminWallet,
        proxyAddress,
        addresses

    before('Create wallet', async () => {
        await createWallet(true)
    })

    async function setupTest({
        did = constants.did[0],
        owner = accounts[0],
        checksum = testUtils.generateId(),
        value = 'https://example.com/did/ocean/test-attr-example.txt'
    } = {}) {
        const proxy = await DIDRegistry.at(proxyAddress)

        let result = await proxy.registerAttribute(
            did, checksum, value
        )
        // some quick checks

        testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

        let payload = result.logs[0].args
        assert.strictEqual(did, payload._did)
        assert.strictEqual(accounts[0], payload._owner)
        assert.strictEqual(checksum, payload._checksum)
        assert.strictEqual(value, payload._value)

        return { proxy, did, checksum, value }
    }

    describe('Test upgradability for DIDRegistry', () => {
        beforeEach('Load wallet each time', async function() {
            adminWallet = await loadWallet('upgrader') // zos admin MultiSig
            addresses = await deploy('deploy', ['DIDRegistry'])
            proxyAddress = addresses.contractAddress
        })

        it('Should be possible to fix/add a bug', async () => {
            let { proxy, did } = await setupTest()
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

            assert.strictEqual(await proxy.getDIDOwner(did), accounts[0])

            // check functionality works
            const newDid = constants.did[1]
            const newChecksum = testUtils.generateId()
            const newValue = 'https://example.com/newdid/ocean/test.txt'
            const result = await proxy.registerAttribute(newChecksum, newDid, newValue)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual(newDid, payload._did)
            assert.strictEqual(accounts[0], payload._owner)
            assert.strictEqual(newChecksum, payload._checksum)
            assert.strictEqual(newValue, payload._value)

            // test for bug
            assert.equal(
                (await proxy.getBlockNumberUpdated(newDid)).toNumber(), 42,
                'getUpdatedAt value is not 42 (according to bug)')
        })

        it('Should be possible to change function signature', async () => {
            let { proxy } = await setupTest()
            // Upgrade to new version
            const txId = await upgrade(
                'DIDRegistry',
                'DIDRegistryChangeFunctionSignature',
                proxyAddress,
                adminWallet,
                accounts[0]
            )
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            proxy = await DIDRegistryChangeFunctionSignature.at(proxyAddress)

            // check functionality works
            const newDid = constants.did[1]
            const newChecksum = testUtils.generateId()
            const newValue = 'https://example.com/newdid/ocean/test.txt'

            // TODO: @ahmed - should revert
            await proxy.registerAttribute(newDid, newChecksum, newValue)

            // act
            const result = await proxy.registerAttribute(newChecksum, newDid, newValue)

            // eval
            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual(newDid, payload._did)
            assert.strictEqual(accounts[0], payload._owner)
            assert.strictEqual(newChecksum, payload._checksum)
            assert.strictEqual(newValue, payload._value)
        })

        it('Should be possible to append storage variables ', async () => {
            let { proxy, did } = await setupTest()
            // Upgrade to new version
            const txId = await upgrade(
                'DIDRegistry',
                'DIDRegistryChangeInStorage',
                proxyAddress,
                adminWallet,
                accounts[0]
            )

            proxy = await DIDRegistryChangeInStorage.at(proxyAddress)

            // should not be able to be called before upgrade is approved
            await assert.isRejected(proxy.timeOfRegister(did))
            // call again after approved
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            assert.equal(
                (await proxy.timeOfRegister(did)).toNumber(), 0,
                'Error calling added storage variable')
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let { proxy, did } = await setupTest()
            // Upgrade to new version
            const txId = await upgrade(
                'DIDRegistry',
                'DIDRegistryChangeInStorageAndLogic',
                proxyAddress,
                adminWallet,
                accounts[0]
            )

            proxy = await DIDRegistryChangeInStorageAndLogic.at(proxyAddress)

            // should not be able to be called before upgrade is approved
            await assert.isRejected(proxy.timeOfRegister(did))
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })

            // Approve and call again
            assert.equal((await proxy.timeOfRegister(did)).toNumber(),
                0, 'Error calling added storage variable')

            // check functionality works
            const newDid = constants.did[1]
            const newChecksum = testUtils.generateId()
            const newValue = 'https://example.com/newdid/ocean/test.txt'

            // act
            const result = await proxy.registerAttribute(newChecksum, newDid, newValue)

            // eval
            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual(newDid, payload._did)
            assert.strictEqual(accounts[0], payload._owner)
            assert.strictEqual(newChecksum, payload._checksum)
            assert.strictEqual(newValue, payload._value)

            assert.equal(
                (await proxy.timeOfRegister(did)).toNumber(), 0,
                'Error calling added storage variable')
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            let { proxy } = await setupTest()
            // Upgrade to new version
            const txId = await upgrade(
                'DIDRegistry',
                'DIDRegistryExtraFunctionality',
                proxyAddress,
                adminWallet,
                accounts[0]
            )

            proxy = await DIDRegistryExtraFunctionality.at(proxyAddress)

            // should not be able to be called before upgrade is approved
            await assert.isRejected(proxy.getNumber())
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })

            // Approve and call again
            assert.equal((await proxy.getNumber()).toNumber(),
                42, 'Error calling getNumber')
        })
    })
})
