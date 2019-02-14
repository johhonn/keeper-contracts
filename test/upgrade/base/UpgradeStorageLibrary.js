/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, beforeEach */

const constants = require('../../helpers/constants.js')
const deploy = require('../../helpers/zos/deploy')
const upgrade = require('../../helpers/zos/upgrade')
const loadWallet = require('../../helpers/wallet/loadWallet')
const createWallet = require('../../helpers/wallet/createWallet')

const StorageContract = artifacts.require('StorageContract')
const StorageContractLibraryExtendedData = artifacts.require('StorageContractLibraryExtendedData')

contract('StorageContract', (accounts) => {
    let adminWallet,
        proxyAddress

    beforeEach('Deploy with zos before each tests', async function() {
        await createWallet(true)
        adminWallet = await loadWallet('upgrader') // zos admin MultiSig
        addresses = await deploy('deploy', ['StorageContract'])
        proxyAddress = addresses.contractAddress
    })

    describe('Test upgradability for StorageContract', () => {
        it('Should be possible to fix/add a bug', async () => {
            let proxy = await StorageContract.at(proxyAddress)

            const expectedValue = 42
            await proxy.mySetS(expectedValue)

            assert.strictEqual(
                (await proxy.myGetS()).toNumber(),
                expectedValue
            )

            // Upgrade to new version
            const txId = await upgrade(
                'StorageContract',
                'StorageContractLibraryExtendedData',
                proxyAddress,
                adminWallet,
                accounts[0]
            )
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            proxy = await StorageContractLibraryExtendedData.at(proxyAddress)

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
