/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, beforeEach */

const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const SignCondition = artifacts.require('SignCondition.sol')
const constants = require('../../helpers/constants.js')

contract('SignCondition constructor', (accounts) => {
    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            await SignCondition.new(conditionStoreManager.address, { from: accounts[0] })
        })
    })

    describe('fulfill non existing condition', () => {
        let conditionStoreManager
        let signCondition

        beforeEach(async () => {
            conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            signCondition = await SignCondition.new(conditionStoreManager.address, { from: accounts[0] })
        })

        it('should not fulfill if conditions do not exist for bytes32 message', async () => {
            let nonce = constants.bytes32.one
            let {
                message,
                publicKey,
                signature
            } = constants.condition.sign.bytes32

            try {
                await signCondition.fulfill(nonce, message, publicKey, signature)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('fulfill existing condition', () => {
        let conditionStoreManager
        let signCondition
        let createRole

        beforeEach(async () => {
            conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            createRole = accounts[0]
            await conditionStoreManager.setup(createRole)
            signCondition = await SignCondition.new(conditionStoreManager.address, { from: accounts[0] })
        })

        it('should fulfill if conditions exist for bytes32 message', async () => {
            let nonce = constants.bytes32.one
            let {
                message,
                publicKey,
                signature
            } = constants.condition.sign.bytes32

            let hashValues = await signCondition.hashValues(message, publicKey)
            let conditionId = await signCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                signCondition.address)

            await signCondition.fulfill(nonce, message, publicKey, signature)

            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
        })
    })

    describe('fail to fulfill existing condition', () => {
        let conditionStoreManager
        let signCondition
        let createRole

        beforeEach(async () => {
            conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            createRole = accounts[0]
            await conditionStoreManager.setup(createRole)
            signCondition = await SignCondition.new(conditionStoreManager.address, { from: accounts[0] })
        })

        it('wrong signature should fail to fulfill if conditions exist for bytes32 message', async () => {
            let nonce = constants.bytes32.one
            let {
                message,
                publicKey
            } = constants.condition.sign.bytes32

            let hashValues = await signCondition.hashValues(message, publicKey)
            let conditionId = await signCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                signCondition.address)

            try {
                await signCondition.fulfill(
                    nonce, message, publicKey,
                    constants.bytes32.one
                )
            } catch (e) {
                assert.strictEqual(e.reason, 'Could not recover signature')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('right signature should fail to fulfill if conditions already fulfilled for bytes32', async () => {
            let nonce = constants.bytes32.one
            let {
                message,
                publicKey,
                signature
            } = constants.condition.sign.bytes32

            let hashValues = await signCondition.hashValues(message, publicKey)
            let conditionId = await signCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                signCondition.address)

            // fulfill once
            await signCondition.fulfill(nonce, message, publicKey, signature)
            // try to fulfill another time
            try {
                await signCondition.fulfill(nonce, message, publicKey, signature)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            let nonce = constants.bytes32.one
            let {
                message,
                publicKey,
                signature
            } = constants.condition.sign.bytes32

            let hashValues = await signCondition.hashValues(message, publicKey)
            let conditionId = await signCondition.generateId(nonce, hashValues)

            // create a condition of a type different than sign condition
            await conditionStoreManager.createCondition(
                conditionId,
                accounts[0])

            // try to fulfill from sign condition
            try {
                await signCondition.fulfill(nonce, message, publicKey, signature)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
