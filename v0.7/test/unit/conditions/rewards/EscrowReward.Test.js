/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, beforeEach */

const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const LockRewardCondition = artifacts.require('LockRewardCondition.sol')
const EscrowReward = artifacts.require('EscrowReward.sol')
const constants = require('../../../helpers/constants.js')
const getBalance = require('../../../helpers/getBalance.js')

contract('EscrowReward constructor', (accounts) => {
    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            let oceanToken = await OceanToken.new({ from: accounts[0] })
            await EscrowReward.new(
                conditionStoreManager.address,
                oceanToken.address,
                { from: accounts[0] })
        })
    })

    describe('fulfill non existing condition', () => {
        let conditionStoreManager
        let oceanToken
        let lockRewardCondition
        let escrowReward
        let createRole = accounts[0]

        beforeEach(async () => {
            conditionStoreManager = await ConditionStoreManager.new({ from: createRole })
            await conditionStoreManager.setup(createRole)
            oceanToken = await OceanToken.new({ from: createRole })
            lockRewardCondition = await LockRewardCondition.new(
                conditionStoreManager.address,
                oceanToken.address,
                { from: createRole })
            escrowReward = await EscrowReward.new(
                conditionStoreManager.address,
                oceanToken.address,
                { from: createRole })
        })

        it('should not fulfill if conditions do not exist', async () => {
            let nonce = constants.bytes32.one
            let lockConditionId = accounts[2]
            let releaseConditionId = accounts[3]
            let sender = accounts[0]
            let receiver = accounts[1]
            let amount = 10

            try {
                await escrowReward.fulfill(
                    nonce,
                    amount,
                    receiver,
                    sender,
                    lockConditionId,
                    releaseConditionId)
            } catch (e) {
                assert.strictEqual(e.reason, 'LockCondition needs to be Fulfilled')
                return
            }
            assert.fail('Expected revert not received')
       })
    })

    describe('fulfill existing condition', () => {
        let conditionStoreManager
        let oceanToken
        let lockRewardCondition
        let escrowReward
        let createRole = accounts[0]

        beforeEach(async () => {
            conditionStoreManager = await ConditionStoreManager.new({ from: createRole })
            await conditionStoreManager.setup(createRole)
            oceanToken = await OceanToken.new({ from: createRole })
            lockRewardCondition = await LockRewardCondition.new(
                conditionStoreManager.address,
                oceanToken.address,
                { from: createRole })
            escrowReward = await EscrowReward.new(
                conditionStoreManager.address,
                oceanToken.address,
                { from: createRole })
        })

        it('should fulfill if conditions exist for account address', async () => {
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

            let state = await conditionStoreManager.getConditionState(conditionId)
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
        })
    })

    describe('fail to fulfill existing condition', () => {
        let conditionStoreManager
        let oceanToken
        let lockRewardCondition
        let createRole = accounts[0]

        beforeEach(async () => {
            conditionStoreManager = await ConditionStoreManager.new({ from: createRole })
            await conditionStoreManager.setup(createRole)
            oceanToken = await OceanToken.new({ from: createRole })
            lockRewardCondition = await LockRewardCondition.new(
                conditionStoreManager.address,
                oceanToken.address,
                { from: createRole })
        })

        it('out of balance should fail to fulfill if conditions exist', async () => {
            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let amount = 10

            let hashValues = await lockRewardCondition.hashValues(rewardAddress, amount)
            let conditionId = await lockRewardCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockRewardCondition.address)

            try {
                await lockRewardCondition.fulfill(nonce, rewardAddress, amount)
            } catch (e) {
                assert.strictEqual(e.reason, undefined)
                return
            }
            assert.fail('Expected revert not received')
        })

        it('not approved should fail to fulfill if conditions exist', async () => {
            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let amount = 10
            let sender = accounts[0]

            let hashValues = await lockRewardCondition.hashValues(rewardAddress, amount)
            let conditionId = await lockRewardCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockRewardCondition.address)

            await oceanToken.mint(sender, amount)

            try {
                await lockRewardCondition.fulfill(nonce, rewardAddress, amount)
            } catch (e) {
                assert.strictEqual(e.reason, undefined)
                return
            }
            assert.fail('Expected revert not received')
        })

        it('right transfer should fail to fulfill if conditions already fulfilled', async () => {
            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let amount = 10
            let sender = accounts[0]

            let hashValues = await lockRewardCondition.hashValues(rewardAddress, amount)
            let conditionId = await lockRewardCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockRewardCondition.address)

            await oceanToken.mint(sender, amount)
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(nonce, rewardAddress, amount)
            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())

            try {
                await lockRewardCondition.fulfill(nonce, rewardAddress, amount)
            } catch (e) {
                assert.strictEqual(e.reason, undefined)
                let { state } = await conditionStoreManager.getCondition(conditionId)
                assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
                return
            }
            assert.fail('Expected revert not received')
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let amount = 10
            let sender = accounts[0]

            let hashValues = await lockRewardCondition.hashValues(rewardAddress, amount)
            let conditionId = await lockRewardCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                accounts[0])

            await oceanToken.mint(sender, amount)
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            try {
                await lockRewardCondition.fulfill(nonce, rewardAddress, amount)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})