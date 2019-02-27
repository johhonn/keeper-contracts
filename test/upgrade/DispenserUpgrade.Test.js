/* eslint-env mocha */
/* global artifacts, web3, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const { encodeCall } = require('zos-lib')

const testUtils = require('../helpers/utils')

const {
    upgradeContracts,
    deployContracts,
    confirmUpgrade,
    confirmTransaction,
    loadWallet
} = require('../../scripts/deploy/deploymentHandler')

const OceanToken = artifacts.require('OceanToken')
const Dispenser = artifacts.require('Dispenser')
const DispenserChangeFunctionSignature = artifacts.require('DispenserChangeFunctionSignature')
const DispenserChangeInStorage = artifacts.require('DispenserChangeInStorage')
const DispenserChangeInStorageAndLogic = artifacts.require('DispenserChangeInStorageAndLogic')
const DispenserExtraFunctionality = artifacts.require('DispenserExtraFunctionality')
const DispenserWithBug = artifacts.require('DispenserWithBug')

contract('Dispenser', (accounts) => {
    let OceanTokenAddress,
        DispenserAddress,
        ownerWallet

    const requester = accounts[2]
    const approver = accounts[3]

    const verbose = true

    beforeEach('Load wallet each time', async function() {
        const addressBook = await deployContracts(
            web3,
            artifacts,
            [
                'OceanToken',
                'Dispenser'
            ]
        )
        OceanTokenAddress = addressBook['OceanToken']
        DispenserAddress = addressBook['Dispenser']

        ownerWallet = await loadWallet(
            web3,
            'owner'
        )
    })

    async function setupTest({
        requestedAmount = 200
    } = {}) {
        const oceanToken = await OceanToken.at(OceanTokenAddress)
        const dispenser = await Dispenser.at(DispenserAddress)
        // act
        await dispenser.requestTokens(requestedAmount)
        return {
            dispenser,
            oceanToken,
            DispenserAddress,
            OceanTokenAddress,
            requestedAmount
        }
    }

    describe('Test upgradability for Dispenser', () => {
        it('Should be possible to fix/add a bug', async () => {
            let { dispenser, DispenserAddress } = await setupTest()

            const taskBook = await upgradeContracts(
                web3,
                ['DispenserWithBug:Dispenser'],
                true
            )

            await confirmUpgrade(
                web3,
                taskBook['Dispenser'],
                approver
            )

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

            const tx = await ownerWallet.submitTransaction(
                ...args,
                { from: requester }
            )

            await confirmTransaction(
                ownerWallet,
                tx.logs[0].args.transactionId.toNumber(),
                approver,
                verbose
            )

            const newMaxAmount = await dispenser.getMaxAmount()

            // assert
            assert.strictEqual(
                newMaxAmount.toString(),
                web3.utils.toBN(20).toString(),
                'getMaxAmount value is not 20 (according to bug)'
            )
        })

        xit('Should be possible to change function signature', async () => {
            let { DispenserAddress, requestedAmount } = await setupTest()

            const taskBook = await upgradeContracts(
                web3,
                ['DispenserChangeFunctionSignature:Dispenser']
            )

            // act
            await confirmUpgrade(
                web3,
                taskBook['Dispenser'],
                approver
            )

            const dispenser = await DispenserChangeFunctionSignature.at(DispenserAddress)

            // assert
            const result = await dispenser.setMinPeriod(
                requestedAmount,
                accounts[1]
            )

            testUtils.assertEmitted(result, 1, 'DispenserChangeFunctionSignatureEvent')
        })

        xit('Should be possible to append storage variable(s) ', async () => {
            let { DispenserAddress } = await setupTest()

            const taskBook = await upgradeContracts(
                web3,
                ['DispenserChangeInStorage:Dispenser']
            )

            // act
            await confirmUpgrade(
                web3,
                taskBook['Dispenser'],
                approver
            )
            const dispenser = await DispenserChangeInStorage.at(DispenserAddress)
            const totalUnMintedAmount = await dispenser.totalUnMintedAmount()

            // assert
            assert.strictEqual(
                totalUnMintedAmount.toString(),
                web3.utils.toBN(0).toString(),
                'totalUnMintedAmount storage variable does not exists'
            )
        })

        xit('Should be possible to append storage variables and change logic', async () => {
            let { DispenserAddress, requestedAmount } = await setupTest()

            const taskBook = await upgradeContracts(
                web3,
                ['DispenserChangeInStorageAndLogic:Dispenser']
            )

            // act
            await confirmUpgrade(
                web3,
                taskBook['Dispenser'],
                approver
            )

            const dispenser = await DispenserChangeInStorageAndLogic.at(DispenserAddress)

            const totalUnMintedAmount = await dispenser.totalUnMintedAmount()

            // assert
            assert.strictEqual(
                totalUnMintedAmount.toString(),
                web3.utils.toBN(0).toString(),
                'totalUnMintedAmount storage variable does not exists'
            )
            const result = await dispenser.setMinPeriod(
                requestedAmount,
                accounts[1]
            )

            testUtils.assertEmitted(result, 1, 'DispenserChangeFunctionSignatureEvent')
        })

        xit('Should be able to call new method added after upgrade is approved', async () => {
            let { DispenserAddress } = await setupTest()

            const taskBook = await upgradeContracts(
                web3,
                ['DispenserExtraFunctionality:Dispenser']
            )

            // act
            await confirmUpgrade(
                web3,
                taskBook['Dispenser'],
                approver
            )

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
