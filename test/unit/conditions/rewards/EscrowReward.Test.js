/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const OceanToken = artifacts.require('OceanToken')
const LockRewardCondition = artifacts.require('LockRewardCondition')
const EscrowReward = artifacts.require('EscrowReward')

const constants = require('../../../helpers/constants.js')
const getBalance = require('../../../helpers/getBalance.js')

contract('EscrowReward constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        owner = accounts[1]
    } = {}) {
        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

        const conditionStoreManager = await ConditionStoreManager.new()
        await conditionStoreManager.initialize(
            owner,
            createRole,
            { from: owner }
        )

        const oceanToken = await OceanToken.new()
        await oceanToken.initialize(owner, owner)

        const lockRewardCondition = await LockRewardCondition.new()
        await lockRewardCondition.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: owner }
        )

        const escrowReward = await EscrowReward.new()
        await escrowReward.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: createRole }
        )

        return {
            escrowReward,
            lockRewardCondition,
            oceanToken,
            conditionStoreManager,
            conditionId,
            conditionType,
            createRole,
            owner
        }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const conditionStoreManager = await ConditionStoreManager.new()
            const oceanToken = await OceanToken.new()

            const escrowReward = await EscrowReward.new()
            await escrowReward.initialize(
                accounts[0],
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
            const {
                escrowReward,
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

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

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(nonce, escrowReward.address, amount)

            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), amount)

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

            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), amount)

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(escrowReward.address, amount, { from: sender })
            await oceanToken.transfer(escrowReward.address, amount, { from: sender })

            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), amount)
            await assert.isRejected(
                escrowReward.fulfill(nonce, amount, receiver, sender, lockConditionId, releaseConditionId),
                constants.condition.state.error.invalidStateTransition
            )
        })
    })

    describe('fail to fulfill existing condition', () => {
    })
})
