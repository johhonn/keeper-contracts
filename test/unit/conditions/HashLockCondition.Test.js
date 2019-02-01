/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, beforeEach */

const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const HashLockCondition = artifacts.require('HashLockCondition.sol')
const constants = require('../helpers/constants.js')

contract('HashLockCondition constructor', (accounts) => {

    describe('deploy and setup', () => {

        it('contract should deploy', async () => {
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            await HashLockCondition.new(conditionStoreManager.address, { from: accounts[0] })
        })

    })

    describe('fulfill non existing condition', () => {
        let conditionStoreManager
        let hashLockCondition

        beforeEach(async () => {
            conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            hashLockCondition = await HashLockCondition.new(conditionStoreManager.address, { from: accounts[0] })
        })

        it('should not fulfill if conditions do not exist for uint preimage', async () => {

            let nonce = constants.bytes32.one
            try {
                await hashLockCondition.fulfill(
                    nonce,
                    constants.condition.hashlock.uint.preimage
                )
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('should not fulfill if conditions do not exist for string preimage', async () => {

            let nonce = constants.bytes32.one

            try {
                await hashLockCondition.methods['fulfill(bytes32,string)'](
                    nonce,
                    constants.condition.hashlock.string.preimage
                )
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('should not fulfill if conditions do not exist for bytes32 preimage', async () => {

            let nonce = constants.bytes32.one

            try {
                await hashLockCondition.methods['fulfill(bytes32,bytes32)'](
                    nonce,
                    constants.condition.hashlock.bytes32.preimage
                )
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('fulfill existing condition', () => {
        let conditionStoreManager
        let hashLockCondition
        let createRole

        beforeEach(async () => {
            conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            createRole = accounts[0]
            await conditionStoreManager.setup(createRole)
            hashLockCondition = await HashLockCondition.new(conditionStoreManager.address, { from: accounts[0] })
        })

        it('should fulfill if conditions exist for uint preimage', async () => {
            let nonce = constants.bytes32.one;

            let conditionId = await hashLockCondition.generateId(
                nonce,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await hashLockCondition.fulfill(
                nonce,
                constants.condition.hashlock.uint.preimage,
            )

            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
        })

        it('should fulfill if conditions exist for string preimage', async () => {
            let nonce = constants.bytes32.one;

            let conditionId = await hashLockCondition.generateId(
                nonce,
                constants.condition.hashlock.string.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await hashLockCondition.methods['fulfill(bytes32,string)'](
                nonce,
                constants.condition.hashlock.string.preimage,
            )

            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
        })

        it('should fulfill if conditions exist for bytes32 preimage', async () => {
            let nonce = constants.bytes32.one;

            let conditionId = await hashLockCondition.generateId(
                nonce,
                constants.condition.hashlock.bytes32.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await hashLockCondition.methods['fulfill(bytes32,bytes32)'](
                nonce,
                constants.condition.hashlock.bytes32.preimage,
            )

            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
        })
    })

    describe('fail to fulfill existing condition', () => {
        let conditionStoreManager
        let hashLockCondition
        let createRole

        beforeEach(async () => {
            conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            createRole = accounts[0]
            await conditionStoreManager.setup(createRole)
            hashLockCondition = await HashLockCondition.new(conditionStoreManager.address, { from: accounts[0] })
        })

        it('wrong preimage should fail to fulfill if conditions exist for uint preimage', async () => {
            let nonce = constants.bytes32.one;

            let conditionId = await hashLockCondition.generateId(
                nonce,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            try {
                await hashLockCondition.fulfill(
                    nonce,
                    constants.condition.hashlock.uint.preimage + 333,
                )
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('wrong preimage should fail to fulfill if conditions exist for uint preimage with string', async () => {
            let nonce = constants.bytes32.one;

            let conditionId = await hashLockCondition.generateId(
                nonce,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            try {
                await hashLockCondition.methods['fulfill(bytes32,string)'](
                    nonce,
                    constants.condition.hashlock.uint.preimage + 'some bogus',
                )
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('wrong preimage should fail to fulfill if conditions exist for string preimage', async () => {
            let nonce = constants.bytes32.one;

            let conditionId = await hashLockCondition.generateId(
                nonce,
                constants.condition.hashlock.string.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            try {
                await hashLockCondition.fulfill(
                    nonce,
                    constants.condition.hashlock.uint.preimage,
                )
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('wrong preimage should fail to fulfill if conditions exist for uint preimage with bytes32', async () => {
            let nonce = constants.bytes32.one;

            let conditionId = await hashLockCondition.generateId(
                nonce,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            try {
                await hashLockCondition.methods['fulfill(bytes32,bytes32)'](
                    nonce,
                    constants.condition.hashlock.bytes32.preimage,
                )
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('right preimage should fail to fulfill if conditions already fulfilled for uint', async () => {
            let nonce = constants.bytes32.one;

            let conditionId = await hashLockCondition.generateId(
                nonce,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            // fulfill once
            await hashLockCondition.fulfill(
                nonce,
                constants.condition.hashlock.uint.preimage,
            )
            // try to fulfill another time
            try {
                await hashLockCondition.fulfill(
                    nonce,
                    constants.condition.hashlock.uint.preimage,
                )
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            let nonce = constants.bytes32.one;

            let conditionId = await hashLockCondition.generateId(
                nonce,
                constants.condition.hashlock.uint.keccak
            )

            // create a condition of a type different than hashlockcondition
            await conditionStoreManager.createCondition(
                conditionId,
                accounts[0])

            // try to fulfill from hashlockcondition
            try {
                await hashLockCondition.fulfill(
                    nonce,
                    constants.condition.hashlock.uint.preimage,
                )
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
