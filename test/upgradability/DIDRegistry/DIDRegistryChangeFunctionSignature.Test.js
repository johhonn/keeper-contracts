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
            let valueType = 0
            let did = web3.utils.fromAscii('did:ocn:test-attr')
            let provider = web3.utils.fromAscii('provider')

            // should revert
            await testUtils.assertRevert(p.registerAttribute(
                valueType,
                did,
                provider,
                'this is not the contract you are looking for'))

            // act
            let result = await p.registerAttribute(
                valueType,
                did,
                provider,
                'this is not the contract you are looking for')

            // eval
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
