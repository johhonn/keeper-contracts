/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const LockRewardCondition = artifacts.require('LockRewardCondition.sol')
const EscrowReward = artifacts.require('EscrowReward.sol')
const constants = require('../../../helpers/constants.js')

contract('EscrowReward constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        setupConditionStoreManager = true
    } = {}) {
        const epochLibrary = await EpochLibrary.new({ from: accounts[0] })
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

        const conditionStoreManager = await ConditionStoreManager.new({ from: createRole })
        if (setupConditionStoreManager) {
            await conditionStoreManager.initialize(
                createRole,
                { from: accounts[0] }
            )
        }

        const oceanToken = await OceanToken.new({ from: createRole })
        await oceanToken.initialize(createRole)

        const lockRewardCondition = await LockRewardCondition.new()
        await lockRewardCondition.initialize(
            conditionStoreManager.address,
            oceanToken.address,
            { from: createRole }
        )

        const escrowReward = await EscrowReward.new()
        await escrowReward.initialize(
            conditionStoreManager.address,
            oceanToken.address,
            { from: createRole }
        )

        return { escrowReward, lockRewardCondition, oceanToken, conditionStoreManager, conditionId, conditionType, createRole }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new({ from: accounts[0] })
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            const oceanToken = await OceanToken.new({ from: accounts[0] })

            const escrowReward = await EscrowReward.new()
            await escrowReward.initialize(
                conditionStoreManager.address,
                oceanToken.address,
                { from: accounts[0] }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist', async () => {
            await setupTest()
            const { escrowReward } = await setupTest()

            let nonce = constants.bytes32.one
            let lockConditionId = accounts[2]
            let releaseConditionId = accounts[3]
            let sender = accounts[0]
            let receiver = accounts[1]
            let amount = 10

            await assert.isRejected(
                escrowReward.fulfill(
                    nonce,
                    amount,
                    receiver,
                    sender,
                    lockConditionId,
                    releaseConditionId),
                constants.condition.reward.escrowReward.error.lockConditionNeedsToBeFulfilled
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist for account address', async () => {
            const { escrowReward, lockRewardCondition, oceanToken, conditionStoreManager } = await setupTest()

            let nonce = constants.bytes32.one
            let sender = accounts[0]
            let receiver = accounts[1]
            let amount = 10

            let hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            let conditionLockId = await lockRewardCondition.generateId(nonce, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            let lockConditionId = conditionLockId
            let releaseConditionId = conditionLockId

            let hashValues = await escrowReward.hashValues(
                amount,
                receiver,
                sender,
                lockConditionId,
                releaseConditionId)
            let conditionId = await escrowReward.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                constants.bytes32.one,
                escrowReward.address)

            await conditionStoreManager.createCondition(
                conditionId,
                escrowReward.address)

            await oceanToken.mint(sender, amount)
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(nonce, escrowReward.address, amount)

            await escrowReward.fulfill(
                nonce,
                amount,
                receiver,
                sender,
                lockConditionId,
                releaseConditionId)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )
        })
    })

    describe('fail to fulfill existing condition', () => {
    })
})
