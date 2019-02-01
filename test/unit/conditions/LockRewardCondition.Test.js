/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, beforeEach */

const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const LockRewardCondition = artifacts.require('LockRewardCondition.sol')
const constants = require('../../helpers/constants.js')
const Web3 = require('web3')

const nodeUrl = `http://localhost:${process.env.ETHEREUM_RPC_PORT || '8545'}`
let web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl))
let getBalance = async (token, address) => {
    return web3.utils.toDecimal(
        await token.balanceOf.call(address)
    )
}

contract('LockRewardCondition constructor', (accounts) => {
    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            let oceanToken = await OceanToken.new({ from: accounts[0] })
            await LockRewardCondition.new(
                conditionStoreManager.address,
                oceanToken.address,
                { from: accounts[0] })
        })
    })

    describe('fulfill non existing condition', () => {
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

        it('should not fulfill if conditions do not exist', async () => {
            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let sender = accounts[0]
            let amount = 10

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

    describe('fulfill existing condition', () => {
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

        it('should fulfill if conditions exist for account address', async () => {
            let nonce = constants.bytes32.one
            let rewardAddress = accounts[2]
            let sender = accounts[0]
            let amount = 10

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
            let rewardBalance = await getBalance(oceanToken, rewardAddress)
            assert.strictEqual(rewardBalance, amount)
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
