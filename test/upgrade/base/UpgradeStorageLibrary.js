/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */

const constants = require('../../helpers/constants.js')
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

const StorageContract = artifacts.require('StorageContract')
const StorageContractLibraryExtendedData = artifacts.require('StorageContractLibraryExtendedData')

contract('StorageContract', (accounts) => {
    let zos
    let storageContractAddress

    before('Restore zos before all tests', async function() {
        zos = new ZeppelinHelper('StorageContract')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('StorageContract')
        await zos.initialize(accounts[0], true)
        storageContractAddress = zos.getProxyAddress('StorageContract')
    })

    describe('Test upgradability for StorageContract', () => {
        it('Should be possible to fix/add a bug', async () => {
            let proxy = await StorageContract.at(storageContractAddress)

            const expectedValue = 42
            await proxy.mySetS(expectedValue)

            assert.strictEqual(
                (await proxy.myGetS()).toNumber(),
                expectedValue
            )

            // Upgrade to new version
            await zos.upgradeToNewContract('StorageContractLibraryExtendedData', accounts[0])
            proxy = await StorageContractLibraryExtendedData.at(storageContractAddress)
            await zos.approveLatestTransaction(accounts[1])

            assert.strictEqual(
                (await proxy.myGetS()).s.toNumber(),
                expectedValue
            )
            assert.strictEqual(
                (await proxy.myGetS()).sender,
                constants.address.zero
            )

            const expectedValueUpdate = 420
            await proxy.mySetS(expectedValueUpdate)

            assert.strictEqual(
                (await proxy.myGetS()).s.toNumber(),
                expectedValueUpdate
            )
            assert.strictEqual(
                (await proxy.myGetS()).sender,
                accounts[0]
            )
        })
    })
})
