/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const HashLockCondition = artifacts.require('HashLockCondition.sol')
const constants = require('../../helpers/constants.js')

contract('HashLockCondition constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        setupConditionStoreManager = true
    } = {}) {
        const conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
        if (setupConditionStoreManager) {
            await conditionStoreManager.setup(createRole)
        }
        const hashLockCondition = await HashLockCondition.new(conditionStoreManager.address, { from: accounts[0] })

        return { hashLockCondition, conditionStoreManager, conditionId, conditionType, createRole }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            await HashLockCondition.new(conditionStoreManager.address, { from: accounts[0] })
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist for uint preimage', async () => {
            const { hashLockCondition, conditionId } = await setupTest({ setupConditionStoreManager: false })

            await assert.isRejected(
                hashLockCondition.fulfill(
                    conditionId,
                    constants.condition.hashlock.uint.preimage
                ),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('should not fulfill if conditions do not exist for string preimage', async () => {
            const { hashLockCondition, conditionId } = await setupTest({ setupConditionStoreManager: false })

            await assert.isRejected(
                hashLockCondition.methods['fulfill(bytes32,string)'](
                    conditionId,
                    constants.condition.hashlock.string.preimage
                ),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('should not fulfill if conditions do not exist for bytes32 preimage', async () => {
            const { hashLockCondition, conditionId } = await setupTest({ setupConditionStoreManager: false })

            await assert.isRejected(
                hashLockCondition.methods['fulfill(bytes32,bytes32)'](
                    conditionId,
                    constants.condition.hashlock.bytes32.preimage
                ),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist for uint preimage', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            let conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await hashLockCondition.fulfill(
                constants.bytes32.one,
                constants.condition.hashlock.uint.preimage
            )

            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
        })

        it('should fulfill if conditions exist for string preimage', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            let conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.string.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await hashLockCondition.methods['fulfill(bytes32,string)'](
                constants.bytes32.one,
                constants.condition.hashlock.string.preimage
            )

            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
        })

        it('should fulfill if conditions exist for bytes32 preimage', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            let conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.bytes32.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await hashLockCondition.methods['fulfill(bytes32,bytes32)'](
                constants.bytes32.one,
                constants.condition.hashlock.bytes32.preimage
            )

            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
        })
    })

    describe('fail to fulfill existing condition', () => {
        it('wrong preimage should fail to fulfill if conditions exist for uint preimage', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            let conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await assert.isRejected(
                hashLockCondition.fulfill(
                    constants.bytes32.one,
                    constants.condition.hashlock.uint.preimage + 333
                ),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('wrong preimage should fail to fulfill if conditions exist for uint preimage with string', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            let conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await assert.isRejected(
                hashLockCondition.methods['fulfill(bytes32,string)'](
                    constants.bytes32.one,
                    constants.condition.hashlock.uint.preimage + 'some bogus'
                ),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('wrong preimage should fail to fulfill if conditions exist for string preimage', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            let conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.string.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await assert.isRejected(
                hashLockCondition.fulfill(
                    constants.bytes32.one,
                    constants.condition.hashlock.uint.preimage
                ),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('wrong preimage should fail to fulfill if conditions exist for uint preimage with bytes32', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            let conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await assert.isRejected(
                hashLockCondition.methods['fulfill(bytes32,bytes32)'](
                    constants.bytes32.one,
                    constants.condition.hashlock.bytes32.preimage
                ),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('right preimage should fail to fulfill if conditions already fulfilled for uint', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            let conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            // fulfill once
            await hashLockCondition.fulfill(
                constants.bytes32.one,
                constants.condition.hashlock.uint.preimage
            )
            // try to fulfill another time
            await assert.isRejected(
                hashLockCondition.fulfill(
                    constants.bytes32.one,
                    constants.condition.hashlock.uint.preimage
                ),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            let conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )

            // create a condition of a type different than hashlockcondition
            await conditionStoreManager.createCondition(
                conditionId,
                accounts[0])

            // try to fulfill from hashlockcondition
            await assert.isRejected(
                hashLockCondition.fulfill(
                    constants.bytes32.one,
                    constants.condition.hashlock.uint.preimage
                ),
                constants.acl.error.invalidUpdateRole
            )
        })
    })
})
