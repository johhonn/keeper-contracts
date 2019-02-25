/* eslint-env mocha */
/* global artifacts, contract, describe, it, beforeEach, before */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const constants = require('../helpers/constants.js')
const testUtils = require('../helpers/utils.js')
const web3 = testUtils.getWeb3()

const setupWallets = require('../../scripts/deploy/wallet/setupWallets')
const loadWallet = require('../../scripts/deploy/wallet/loadWallet')
const requestContractUpgrade = require('../../scripts/deploy/contracts/requestContractUpgrades')
const deployContracts = require('../../scripts/deploy/contracts/deployContracts')

const DIDRegistry = artifacts.require('DIDRegistry')
const DIDRegistryChangeFunctionSignature = artifacts.require('DIDRegistryChangeFunctionSignature')
const DIDRegistryChangeInStorage = artifacts.require('DIDRegistryChangeInStorage')
const DIDRegistryChangeInStorageAndLogic = artifacts.require('DIDRegistryChangeInStorageAndLogic')
const DIDRegistryExtraFunctionality = artifacts.require('DIDRegistryExtraFunctionality')
const DIDRegistryWithBug = artifacts.require('DIDRegistryWithBug')

contract('DIDRegistry', (accounts) => {
    let adminWallet,
        DIDRegistryProxyAddress

    // define the roles
    const owner = accounts[0]
    const upgraderRole = accounts[1]
    const approverRole = accounts[2]

    before('Create wallet', async () => {
        await setupWallets(web3, true)
    })

    async function setupTest({
        did = constants.did[0],
        checksum = testUtils.generateId(),
        value = 'https://example.com/did/ocean/test-attr-example.txt'
    } = {}) {
        const DIDRegistryProxy = await DIDRegistry.at(DIDRegistryProxyAddress)

        let result = await DIDRegistryProxy.registerAttribute(
            did, checksum, value
        )
        // some quick checks

        testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

        let payload = result.logs[0].args
        assert.strictEqual(did, payload._did)
        assert.strictEqual(owner, payload._owner)
        assert.strictEqual(checksum, payload._checksum)
        assert.strictEqual(value, payload._value)

        return { proxy: DIDRegistryProxy, did, checksum, value }
    }

    describe('Test upgradability for DIDRegistry', () => {
        beforeEach('Load wallet each time', async () => {
            adminWallet = await loadWallet(
                web3, 'upgrader'
            )
            const addressBook = await deployContracts(
                web3,
                artifacts,
                'deploy',
                ['DIDRegistry']
            )
            DIDRegistryProxyAddress = addressBook['DIDRegistry']
        })

        it('Should be possible to fix/add a bug', async () => {
            let { proxy, did } = await setupTest()

            // Upgrade to new version
            const txId = await requestContractUpgrade(
                'DIDRegistry',
                'DIDRegistryWithBug',
                DIDRegistryProxyAddress,
                adminWallet,
                upgraderRole
            )

            await adminWallet.confirmTransaction(txId, { from: approverRole })
            proxy = await DIDRegistryWithBug.at(DIDRegistryProxyAddress)

            assert.strictEqual(await proxy.getDIDOwner(did), owner)

            // check functionality works
            const newDid = constants.did[1]
            const newChecksum = testUtils.generateId()
            const newValue = 'https://example.com/newdid/ocean/test.txt'
            const result = await proxy.registerAttribute(newChecksum, newDid, newValue)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            const payload = result.logs[0].args
            assert.strictEqual(newDid, payload._did)
            assert.strictEqual(owner, payload._owner, 'owner did not match')
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
            const txId = await requestContractUpgrade(
                'DIDRegistry',
                'DIDRegistryChangeFunctionSignature',
                DIDRegistryProxyAddress,
                adminWallet,
                upgraderRole
            )

            await adminWallet.confirmTransaction(txId, { from: approverRole })
            proxy = await DIDRegistryChangeFunctionSignature.at(DIDRegistryProxyAddress)

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
            assert.strictEqual(owner, payload._owner)
            assert.strictEqual(newChecksum, payload._checksum)
            assert.strictEqual(newValue, payload._value)
        })

        it('Should be possible to append storage variables ', async () => {
            let { proxy, did } = await setupTest()

            // Upgrade to new version
            const txId = await requestContractUpgrade(
                'DIDRegistry',
                'DIDRegistryChangeInStorage',
                DIDRegistryProxyAddress,
                adminWallet,
                upgraderRole
            )

            proxy = await DIDRegistryChangeInStorage.at(DIDRegistryProxyAddress)

            // should not be able to be called before upgrade is approved
            await assert.isRejected(proxy.timeOfRegister(did))
            // call again after approved
            await adminWallet.confirmTransaction(txId, { from: approverRole })
            assert.equal(
                (await proxy.timeOfRegister(did)).toNumber(), 0,
                'Error calling added storage variable')
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let { proxy, did } = await setupTest()

            // Upgrade to new version
            const txId = await requestContractUpgrade(
                'DIDRegistry',
                'DIDRegistryChangeInStorageAndLogic',
                DIDRegistryProxyAddress,
                adminWallet,
                upgraderRole
            )

            proxy = await DIDRegistryChangeInStorageAndLogic.at(DIDRegistryProxyAddress)

            // should not be able to be called before upgrade is approved
            await assert.isRejected(proxy.timeOfRegister(did))
            await adminWallet.confirmTransaction(txId, { from: approverRole })

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
            assert.strictEqual(owner, payload._owner)
            assert.strictEqual(newChecksum, payload._checksum)
            assert.strictEqual(newValue, payload._value)

            assert.equal(
                (await proxy.timeOfRegister(did)).toNumber(), 0,
                'Error calling added storage variable')
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            let { proxy } = await setupTest()

            // Upgrade to new version
            const txId = await requestContractUpgrade(
                'DIDRegistry',
                'DIDRegistryExtraFunctionality',
                DIDRegistryProxyAddress,
                adminWallet,
                upgraderRole
            )

            proxy = await DIDRegistryExtraFunctionality.at(DIDRegistryProxyAddress)

            // should not be able to be called before upgrade is approved
            await assert.isRejected(proxy.getNumber())
            await adminWallet.confirmTransaction(txId, { from: approverRole })

            // Approve and call again
            assert.equal((await proxy.getNumber()).toNumber(),
                42, 'Error calling getNumber')
        })
    })
})
