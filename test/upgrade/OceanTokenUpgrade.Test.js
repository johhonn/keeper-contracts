/* eslint-env mocha */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Web3 = require('web3')
const deploy = require('../helpers/zos/deploy')
const upgrade = require('../helpers/zos/upgrade')
const loadWallet = require('../helpers/wallet/loadWallet')
const createWallet = require('../helpers/wallet/createWallet')

const OceanToken = artifacts.require('OceanToken')

const OceanTokenChangeInStorage = artifacts.require('OceanTokenChangeInStorage')
const OceanTokenChangeInStorageAndLogic = artifacts.require('OceanTokenChangeInStorageAndLogic')
const OceanTokenExtraFunctionality = artifacts.require('OceanTokenExtraFunctionality')

contract('OceanToken', (accounts) => {
    let adminWallet,
        OceanTokenAddress,
        addresses

    beforeEach('Load wallet each time', async function() {
        await createWallet(true)
        adminWallet = await loadWallet('upgrader') // zos admin MultiSig
        addresses = await deploy('deploy', ['OceanToken'])
        OceanTokenAddress = addresses.oceanTokenAddress
    })

    async function setupTest({
        requestedAmount = 200
    } = {}) {
        const oceanToken = await OceanToken.at(OceanTokenAddress)
        // act
        return { oceanToken, OceanTokenAddress }
    }

    describe('Test upgradability for OceanToken', () => {
        it('Should be possible to append storage variable(s) ', async () => {
            let { OceanTokenAddress } = await setupTest()

            const txId = await upgrade(
                'OceanToken',
                'OceanTokenChangeInStorage',
                OceanTokenAddress,
                adminWallet,
                accounts[0]
            )

            // act
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            const oceanToken = await OceanTokenChangeInStorage.at(OceanTokenAddress)

            const mintCount = await oceanToken.mintCount()

            // assert
            assert.strictEqual(
                mintCount.toString(),
                Web3.utils.toBN(0).toString(),
                'mintCount new storage variable does not exists'
            )
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let { OceanTokenAddress } = await setupTest()

            const txId = await upgrade(
                'OceanToken',
                'OceanTokenChangeInStorageAndLogic',
                OceanTokenAddress,
                adminWallet,
                accounts[0]
            )

            // act
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            const oceanToken = await OceanTokenChangeInStorageAndLogic.at(OceanTokenAddress)

            const mintCountBefore = await oceanToken.mintCount()

            // assert
            assert.strictEqual(
                mintCountBefore.toString(),
                Web3.utils.toBN(0).toString(),
                'mintCount new storage variable does not exists'
            )

            await oceanToken.incrementMintCount({ from: accounts[3] })

            const mintCountAfter = await oceanToken.mintCount()

            assert.strictEqual(
                mintCountAfter.toString(),
                Web3.utils.toBN(1).toString(),
                'mintCount new storage variable does not exists'
            )
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            let { OceanTokenAddress } = await setupTest()

            const txId = await upgrade(
                'OceanToken',
                'OceanTokenExtraFunctionality',
                OceanTokenAddress,
                adminWallet,
                accounts[0]
            )

            // act
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            const oceanToken = await OceanTokenExtraFunctionality.at(OceanTokenAddress)

            // assert
            assert.strictEqual(
                await oceanToken.dummyFunction(),
                true,
                'failed to inject a new method!'
            )
        })
    })
})
