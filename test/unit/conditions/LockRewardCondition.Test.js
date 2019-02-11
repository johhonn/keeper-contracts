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
const constants = require('../../helpers/constants.js')
const getBalance = require('../../helpers/getBalance.js')

contract('LockRewardCondition', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        owner = accounts[1],
        createRole = accounts[0]
    } = {}) {
        const epochLibrary = await EpochLibrary.new({ from: owner })
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

        const conditionStoreManager = await ConditionStoreManager.new({ from: owner })
        await conditionStoreManager.initialize(
            owner,
            createRole,
            { from: owner }
        )

        const oceanToken = await OceanToken.new({ from: owner })
        await oceanToken.initialize(owner)

        const lockRewardCondition = await LockRewardCondition.new({ from: owner })

        await lockRewardCondition.initialize(
            conditionStoreManager.address,
            oceanToken.address,
            { from: createRole }
        )
        return {
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
            const epochLibrary = await EpochLibrary.new({ from: accounts[0] })
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            const oceanToken = await OceanToken.new({ from: accounts[0] })
            const lockRewardCondition = await LockRewardCondition.new()

            await lockRewardCondition.initialize(
                conditionStoreManager.address,
                oceanToken.address,
                { from: accounts[0] })
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist', async () => {
            const { lockRewardCondition, oceanToken, owner } = await setupTest()

            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let sender = accounts[0]
            let amount = 10

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await assert.isRejected(
                lockRewardCondition.fulfill(nonce, rewardAddress, amount),
                constants.acl.error.invalidUpdateRole
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist for account address', async () => {
            const {
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let sender = accounts[0]
            let amount = 10

            let hashValues = await lockRewardCondition.hashValues(rewardAddress, amount)
            let conditionId = await lockRewardCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockRewardCondition.address)

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(nonce, rewardAddress, amount)
            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
            let rewardBalance = await getBalance(oceanToken, rewardAddress)
            assert.strictEqual(rewardBalance, amount)
        })
    })

    describe('fail to fulfill existing condition', () => {
        it('out of balance should fail to fulfill if conditions exist', async () => {
            const { lockRewardCondition, conditionStoreManager } = await setupTest()

            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let amount = 10

            let hashValues = await lockRewardCondition.hashValues(rewardAddress, amount)
            let conditionId = await lockRewardCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockRewardCondition.address)

            await assert.isRejected(
                lockRewardCondition.fulfill(nonce, rewardAddress, amount),
                undefined
            )
        })

        it('not approved should fail to fulfill if conditions exist', async () => {
            const {
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let amount = 10
            let sender = accounts[0]

            let hashValues = await lockRewardCondition.hashValues(rewardAddress, amount)
            let conditionId = await lockRewardCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockRewardCondition.address)

            await oceanToken.mint(sender, amount, { from: owner })

            await assert.isRejected(
                lockRewardCondition.fulfill(nonce, rewardAddress, amount),
                undefined
            )
        })

        it('right transfer should fail to fulfill if conditions already fulfilled', async () => {
            const {
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let amount = 10
            let sender = accounts[0]

            let hashValues = await lockRewardCondition.hashValues(rewardAddress, amount)
            let conditionId = await lockRewardCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockRewardCondition.address)

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(nonce, rewardAddress, amount)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )

            await assert.isRejected(
                lockRewardCondition.fulfill(nonce, rewardAddress, amount),
                undefined
            )
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            const {
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let amount = 10
            let sender = accounts[0]

            let hashValues = await lockRewardCondition.hashValues(rewardAddress, amount)
            let conditionId = await lockRewardCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                accounts[0])

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await assert.isRejected(
                lockRewardCondition.fulfill(nonce, rewardAddress, amount),
                constants.acl.error.invalidUpdateRole
            )
        })
    })
})
