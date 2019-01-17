/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it, before, beforeEach */

const testUtils = require('../helpers/utils.js')
const ZeppelinHelper = require('../helpers/ZeppelinHelper.js')

const DIDRegistry = artifacts.require('DIDRegistry')
const DIDRegistryWithBug = artifacts.require('DIDRegistryWithBug')
const DIDRegistryChangeInStorage = artifacts.require('DIDRegistryChangeInStorage')
const DIDRegistryExtraFunctionality = artifacts.require('DIDRegistryExtraFunctionality')
const DIDRegistryChangeInStorageAndLogic = artifacts.require('DIDRegistryChangeInStorageAndLogic')
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
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('DIDRegistryExtraFunctionality')
            let p = await DIDRegistryExtraFunctionality.at(dIDRegistryAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n = await p.getNumber()
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

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

        it('Should be possible to append storage variables and change logic', async () => {
            // register attribute
            let registry = await DIDRegistry.at(dIDRegistryAddress)
            let did = web3.utils.fromAscii('did:ocn:test-attr')
            let providerDID = 'did:ocn:provider'
            let provider = web3.utils.fromAscii('provider')
            let valueType = 0
            let result = await registry.registerAttribute(did, valueType, provider, providerDID)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            let payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-attr', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(0, web3.utils.toDecimal(payload.valueType))
            assert.strictEqual('provider', web3.utils.hexToString(payload.key))
            assert.strictEqual(providerDID, payload.value)

            // should not be possible to read storage variables before upgrade is approved
            await zos.upgradeToNewContract('DIDRegistryChangeInStorageAndLogic')
            let p = await DIDRegistryChangeInStorageAndLogic.at(dIDRegistryAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.timeOfRegister(did))

            // Approve and call again
            await zos.approveLatestTransaction()
            let n = await p.timeOfRegister(did)
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')

            // check new functionality works
            did = web3.utils.fromAscii('did:ocn:test-attrN')
            result = await registry.registerAttribute(did, valueType, provider, providerDID)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-attrN', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(0, web3.utils.toDecimal(payload.valueType))
            assert.strictEqual('provider', web3.utils.hexToString(payload.key))
            assert.strictEqual(providerDID, payload.value)

            await p.timeOfRegister(did).then(i => { n = i })
            assert.equal(n.toNumber() > 0, true, 'time of registry not created')
        })

        it('Should be possible to fix/add a bug', async () => {
            // register attribute
            let registry = await DIDRegistry.at(dIDRegistryAddress)
            let did = web3.utils.fromAscii('did:ocn:test-attr')
            let providerDID = 'did:ocn:provider'
            let provider = web3.utils.fromAscii('provider')
            let valueType = 0
            let result = await registry.registerAttribute(did, valueType, provider, providerDID)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            let payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-attr', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(0, web3.utils.toDecimal(payload.valueType))
            assert.strictEqual('provider', web3.utils.hexToString(payload.key))
            assert.strictEqual(providerDID, payload.value)

            // Upgrade to insert bug
            await zos.upgradeToNewContract('DIDRegistryWithBug')
            let p = await DIDRegistryWithBug.at(dIDRegistryAddress)
            await zos.approveLatestTransaction()

            // check functionality works
            did = web3.utils.fromAscii('did:ocn:test-attrN')
            result = await registry.registerAttribute(did, valueType, provider, providerDID)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-attrN', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(0, web3.utils.toDecimal(payload.valueType))
            assert.strictEqual('provider', web3.utils.hexToString(payload.key))
            assert.strictEqual(providerDID, payload.value)

            // test for bug
            let n = await p.getUpdateAt(did)
            assert.equal(n.toNumber(), 42, 'getUpdatedAt value is not 42 (according to bug)')
        })

        it('Should be possible to change function signature', async () => {
            // Get proxy and upgrade to new instance
            let p = await DIDRegistryChangeFunctionSignature.at(dIDRegistryAddress)
            await zos.upgradeToNewContract('DIDRegistryChangeFunctionSignature')
            await zos.approveLatestTransaction()

            // check new functionality works
            let valueType = 0
            let did = web3.utils.fromAscii('did:ocn:test-attr')
            let provider = web3.utils.fromAscii('provider')
            let result = await p.registerAttribute(valueType, did, provider)

            testUtils.assertEmitted(result, 1, 'DIDAttributeRegistered')

            let payload = result.logs[0].args
            assert.strictEqual('did:ocn:test-attr', web3.utils.hexToString(payload.did))
            assert.strictEqual(accounts[0], payload.owner)
            assert.strictEqual(0, web3.utils.toDecimal(payload.valueType))
            assert.strictEqual('provider', web3.utils.hexToString(payload.key))
            assert.strictEqual('this is not the contract you are looking for', payload.value)
        })
    })
})
