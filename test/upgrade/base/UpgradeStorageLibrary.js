/* eslint-env mocha */
/* global artifacts, web3, assert, contract, describe, it, beforeEach */
const constants = require('../../helpers/constants.js')

const {
    upgradeContracts,
    deployContracts,
    confirmUpgrade
} = require('../../../scripts/deploy/deploymentHandler')

const StorageContract = artifacts.require('StorageContract')
const StorageContractLibraryExtendedData = artifacts.require('StorageContractLibraryExtendedData')

contract('StorageContract', (accounts) => {
    let storageContractAddress

    const verbose = false
    const approver = accounts[2]

    beforeEach('Deploy with zos before each tests', async function() {
        const addressBook = await deployContracts(
            web3,
            artifacts,
            ['StorageContract'],
            verbose
        )
        storageContractAddress = addressBook['StorageContract']
    })

    describe('Test upgradability for StorageContract', () => {
        it('Should be possible to fix/add a bug', async () => {
            let StorageContractInstance =
                await StorageContract.at(storageContractAddress)

            const expectedValue = 42
            await StorageContractInstance.mySetS(expectedValue)

            assert.strictEqual(
                (await StorageContractInstance.myGetS()).toNumber(),
                expectedValue
            )

            // Upgrade to new version
            const taskBook = await upgradeContracts(
                web3,
                ['StorageContractLibraryExtendedData:StorageContract'],
                verbose
            )
            await confirmUpgrade(
                web3,
                taskBook['StorageContract'],
                approver,
                verbose
            )

            StorageContractInstance = await StorageContractLibraryExtendedData.at(storageContractAddress)

            assert.strictEqual(
                (await StorageContractInstance.myGetS()).s.toNumber(),
                expectedValue
            )

            assert.strictEqual(
                (await StorageContractInstance.myGetS()).sender,
                constants.address.zero
            )

            const expectedValueUpdate = 420
            await StorageContractInstance.mySetS(expectedValueUpdate)

            assert.strictEqual(
                (await StorageContractInstance.myGetS()).s.toNumber(),
                expectedValueUpdate
            )
            assert.strictEqual(
                (await StorageContractInstance.myGetS()).sender,
                accounts[0]
            )
        })
    })
})
