/* eslint-env mocha */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { encodeCall } = require('zos-lib')
const deploy = require('../helpers/zos/deploy')
const upgrade = require('../helpers/zos/upgrade')
const loadWallet = require('../helpers/wallet/loadWallet')
const createWallet = require('../helpers/wallet/createWallet')
const constants = require('../helpers/constants.js')

const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const ConditionStoreChangeFunctionSignature = artifacts.require('ConditionStoreChangeFunctionSignature')
const ConditionStoreChangeInStorage = artifacts.require('ConditionStoreChangeInStorage')
const ConditionStoreChangeInStorageAndLogic = artifacts.require('ConditionStoreChangeInStorageAndLogic')
const ConditionStoreExtraFunctionality = artifacts.require('ConditionStoreExtraFunctionality')
const ConditionStoreWithBug = artifacts.require('ConditionStoreWithBug')

contract('ConditionStoreManager', (accounts) => {
    let adminWallet,
        owner,
        addresses,
        conditionStoreManager

    beforeEach('Load wallet each time', async function() {
        await createWallet(true)
        adminWallet = await loadWallet('upgrader') // zos admin MultiSig
        owner = await loadWallet('owner')
        addresses = await deploy('deploy', ['ConditionStoreManager'])
    })

    async function setupTest({
        contractAddress = null,
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy
    } = {}) {
        conditionStoreManager = await ConditionStoreManager.at(contractAddress)
        return { conditionStoreManager, conditionId, conditionType }
    }

    describe('Test upgradability for ConditionStoreManager', () => {
        it('Should be possible to fix/add a bug', async () => {
            let { conditionId } = await setupTest({ contractAddress: addresses.contractAddress })

            const upgradeTxId = await upgrade(
                'ConditionStoreManager',
                'ConditionStoreWithBug',
                addresses.contractAddress,
                adminWallet,
                accounts[0]
            )
            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedConditionStoreManager = await ConditionStoreWithBug.at(addresses.contractAddress)

            // assert
            assert.strictEqual(
                (await upgradedConditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled,
                'condition should be fulfilled (according to bug)'
            )
        })

        it('Should be possible to change function signature', async () => {
            let { conditionId, conditionType } = await setupTest({ contractAddress: addresses.contractAddress })

            const upgradeTxId = await upgrade(
                'ConditionStoreManager',
                'ConditionStoreChangeFunctionSignature',
                addresses.contractAddress,
                adminWallet,
                accounts[0]
            )
            // init
            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedConditionStoreManager = await ConditionStoreChangeFunctionSignature.at(addresses.contractAddress)

            // delegate
            const DelegateCreateRole = encodeCall(
                'delegateCreateRole',
                ['address'],
                [accounts[0]]
            )
            const args = [
                addresses.contractAddress,
                0,
                DelegateCreateRole
            ]

            const tx = await owner.submitTransaction(...args, { from: accounts[1] })
            await owner.confirmTransaction(tx.logs[0].args.transactionId.toNumber(), { from: accounts[2] })

            // assert
            assert.strictEqual(
                await upgradedConditionStoreManager.getCreateRole(),
                accounts[0],
                'Invalid create role!'
            )

            await upgradedConditionStoreManager.createCondition(conditionId, conditionType, accounts[0], { from: accounts[0] })

            // assert
            assert.strictEqual(
                (await upgradedConditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.unfulfilled,
                'condition should be unfulfilled'
            )
        })

        it('Should be possible to append storage variable(s) ', async () => {
            await setupTest({ contractAddress: addresses.contractAddress })

            const upgradeTxId = await upgrade(
                'ConditionStoreManager',
                'ConditionStoreChangeInStorage',
                addresses.contractAddress,
                adminWallet,
                accounts[0]
            )
            // init
            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedConditionStoreManager = await ConditionStoreChangeInStorage.at(addresses.contractAddress)
            assert.strictEqual((await upgradedConditionStoreManager.conditionCount()).toNumber(), 0)
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let { conditionId, conditionType } = await setupTest({ contractAddress: addresses.contractAddress })

            const upgradeTxId = await upgrade(
                'ConditionStoreManager',
                'ConditionStoreChangeInStorageAndLogic',
                addresses.contractAddress,
                adminWallet,
                accounts[0]
            )
            // init
            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedConditionStoreManager = await ConditionStoreChangeInStorageAndLogic.at(addresses.contractAddress)

            // delegate
            const DelegateCreateRole = encodeCall(
                'delegateCreateRole',
                ['address'],
                [accounts[0]]
            )
            const args = [
                addresses.contractAddress,
                0,
                DelegateCreateRole
            ]

            const tx = await owner.submitTransaction(...args, { from: accounts[1] })
            await owner.confirmTransaction(tx.logs[0].args.transactionId.toNumber(), { from: accounts[2] })

            assert.strictEqual((await upgradedConditionStoreManager.conditionCount()).toNumber(), 0)

            await upgradedConditionStoreManager.createCondition(conditionId, conditionType, accounts[0], { from: accounts[0] })

            assert.strictEqual(
                (await upgradedConditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.unfulfilled,
                'condition should be unfulfilled'
            )
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            await setupTest({ contractAddress: addresses.contractAddress })
            const upgradeTxId = await upgrade(
                'ConditionStoreManager',
                'ConditionStoreExtraFunctionality',
                addresses.contractAddress,
                adminWallet,
                accounts[0]
            )
            // init
            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedConditionStoreManager = await ConditionStoreExtraFunctionality.at(addresses.contractAddress)
            // asset
            assert.strictEqual(
                await upgradedConditionStoreManager.dummyFunction(),
                true)
        })
    })
})
