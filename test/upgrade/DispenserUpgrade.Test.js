/* eslint-env mocha */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const Web3 = require('web3')
const { encodeCall } = require('zos-lib')
const deploy = require('../helpers/zos/deploy')
const upgrade = require('../helpers/zos/upgrade')
const loadWallet = require('../helpers/wallet/loadWallet')
const createWallet = require('../helpers/wallet/createWallet')

const OceanToken = artifacts.require('OceanToken')
const Dispenser = artifacts.require('Dispenser')
const DispenserChangeFunctionSignature = artifacts.require('DispenserChangeFunctionSignature')
const DispenserChangeInStorage = artifacts.require('DispenserChangeInStorage')
const DispenserChangeInStorageAndLogic = artifacts.require('DispenserChangeInStorageAndLogic')
const DispenserExtraFunctionality = artifacts.require('DispenserExtraFunctionality')
const DispenserWithBug = artifacts.require('DispenserWithBug')

contract('Dispenser', (accounts) => {
    let adminWallet,
        OceanTokenAddress,
        DispenserAddress,
        addresses,
        owner

    beforeEach('Load wallet each time', async function() {
        await createWallet(true)
        adminWallet = await loadWallet('upgrader') // zos admin MultiSig
        owner = await loadWallet('owner')
        addresses = await deploy('deploy', ['OceanToken', 'Dispenser'])
        OceanTokenAddress = addresses.oceanTokenAddress
        DispenserAddress = addresses.dispenserAddress
    })

    async function setupTest({
        requestedAmount = 200
    } = {}) {
        const oceanToken = await OceanToken.at(OceanTokenAddress)
        const dispenser = await Dispenser.at(DispenserAddress)
        // act
        await dispenser.requestTokens(requestedAmount, { from: accounts[1] })
        return { dispenser, oceanToken, DispenserAddress, OceanTokenAddress, requestedAmount }
    }

    describe('Test upgradability for Dispenser', () => {
        it('Should be possible to fix/add a bug', async () => {
            let { dispenser, DispenserAddress } = await setupTest()

            const txId = await upgrade(
                'Dispenser',
                'DispenserWithBug',
                DispenserAddress,
                adminWallet,
                accounts[0]
            )

            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            dispenser = await DispenserWithBug.at(DispenserAddress)

            // set Max Amount
            const SetMaxAmount = encodeCall(
                'setMaxAmount',
                ['uint256'],
                [256]
            )

            const args = [
                DispenserAddress,
                0,
                SetMaxAmount
            ]

            const tx = await owner.submitTransaction(...args, { from: accounts[1] })
            await owner.confirmTransaction(tx.logs[0].args.transactionId.toNumber(), { from: accounts[2] })

            const newMaxAmount = await dispenser.getMaxAmount()

            // assert
            assert.strictEqual(
                newMaxAmount.toString(),
                Web3.utils.toBN(20).toString(),
                'getMaxAmount value is not 20 (according to bug)'
            )
        })

        it('Should be possible to change function signature', async () => {
            let { DispenserAddress, requestedAmount } = await setupTest()

            const txId = await upgrade(
                'Dispenser',
                'DispenserChangeFunctionSignature',
                DispenserAddress,
                adminWallet,
                accounts[0]
            )

            // act
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            const dispenser = await DispenserChangeFunctionSignature.at(DispenserAddress)

            // assert
            await assert.isRejected(
                dispenser.setMinPeriod(
                    0,
                    accounts[1],
                    { from: accounts[0] }
                ),
                'Invalid caller address'
            )
        })

        it('Should be possible to append storage variable(s) ', async () => {
            let { DispenserAddress } = await setupTest()

            const txId = await upgrade(
                'Dispenser',
                'DispenserChangeInStorage',
                DispenserAddress,
                adminWallet,
                accounts[0]
            )

            // act
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            const dispenser = await DispenserChangeInStorage.at(DispenserAddress)
            const totalUnMintedAmount = await dispenser.totalUnMintedAmount()

            // assert
            assert.strictEqual(
                totalUnMintedAmount.toString(),
                Web3.utils.toBN(0).toString(),
                'totalUnMintedAmount storage variable does not exists'
            )
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let { DispenserAddress, requestedAmount } = await setupTest()

            const txId = await upgrade(
                'Dispenser',
                'DispenserChangeInStorageAndLogic',
                DispenserAddress,
                adminWallet,
                accounts[0]
            )

            // act
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            const dispenser = await DispenserChangeInStorageAndLogic.at(DispenserAddress)

            const totalUnMintedAmount = await dispenser.totalUnMintedAmount()

            // assert
            assert.strictEqual(
                totalUnMintedAmount.toString(),
                Web3.utils.toBN(0).toString(),
                'totalUnMintedAmount storage variable does not exists'
            )

            await assert.isRejected(
                dispenser.setMinPeriod(
                    0,
                    accounts[1],
                    { from: accounts[0] }
                ),
                'Invalid caller address'
            )
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            let { DispenserAddress } = await setupTest()

            const txId = await upgrade(
                'Dispenser',
                'DispenserExtraFunctionality',
                DispenserAddress,
                adminWallet,
                accounts[0]
            )

            // act
            await adminWallet.confirmTransaction(txId, { from: accounts[1] })
            const dispenser = await DispenserExtraFunctionality.at(DispenserAddress)

            // assert
            assert.strictEqual(
                await dispenser.dummyFunction(),
                true,
                'failed to inject a new method!'
            )
        })
    })
})
