/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common.sol')
const HashLockCondition = artifacts.require('HashLockCondition.sol')
const EpochLibrary = artifacts.require('EpochLibrary.sol')
const ConditionStoreLibrary = artifacts.require('ConditionStoreLibrary.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')

const constants = require('../../helpers/constants.js')
const increaseTime = require('../../helpers/increaseTime.js')

contract('ConditionStoreManager', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        setupConditionStoreManager = true
    } = {}) {
        const common = await Common.new()
        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreLibrary.link('EpochLibrary', epochLibrary.address)
        const conditionStoreLibrary = await ConditionStoreLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        await ConditionStoreManager.link('ConditionStoreLibrary', conditionStoreLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new()

        if (setupConditionStoreManager) {
            await conditionStoreManager.initialize(
                createRole,
                { from: accounts[0] }
            )
        }
        const hashLockCondition = await HashLockCondition.new()
        await hashLockCondition.initialize(conditionStoreManager.address, { from: accounts[0] })

        return {
            common,
            hashLockCondition,
            epochLibrary,
            conditionStoreManager,
            conditionId,
            conditionType,
            createRole
        }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            // act-assert
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreLibrary.link('EpochLibrary', epochLibrary.address)
            const conditionStoreLibrary = await ConditionStoreLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            await ConditionStoreManager.link('ConditionStoreLibrary', conditionStoreLibrary.address)
            await ConditionStoreManager.new()
        })

        it('contract should setup', async () => {
            let conditionStoreManager = await ConditionStoreManager.new()
            let getCreateRole = await conditionStoreManager.getCreateRole()
            // address should be 0x0 before setup
            assert.strictEqual(getCreateRole, constants.address.zero)

            // address should be set after correct setup
            let createRole = accounts[1]
            await conditionStoreManager.initialize(createRole)
            getCreateRole = await conditionStoreManager.getCreateRole()
            assert.strictEqual(getCreateRole, createRole)
        })

        it('contract should not setup with zero', async () => {
            let conditionStoreManager = await ConditionStoreManager.new()

            // setup with zero fails
            let createRole = constants.address.zero
            await assert.isRejected(
                conditionStoreManager.initialize(createRole),
                constants.address.error.invalidAddress0x0
            )
        })

        it('anyone should not change createRole after setup', async () => {
            // setup correctly
            let conditionStoreManager = await ConditionStoreManager.new()
            let createRole = accounts[1]
            await conditionStoreManager.initialize(createRole)

            let getCreateRole = await conditionStoreManager.getCreateRole()
            assert.strictEqual(getCreateRole, createRole)

            // try to force with other account
            let otherCreateConditionRole = accounts[0]
            assert.notEqual(otherCreateConditionRole, createRole)
            await assert.isRejected(
                conditionStoreManager.initialize(otherCreateConditionRole),
                'Contract instance has already been initialized'
            )
            assert.strictEqual(getCreateRole, createRole)
        })
    })

    describe('create conditions', () => {
        it('createRole should create', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.uninitialized)
            assert.strictEqual((await conditionStoreManager.getConditionListSize()).toNumber(), 0)

            // conditionId should exist after create
            await conditionStoreManager.createCondition(conditionId, conditionType)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.unfulfilled)
            assert.strictEqual((await conditionStoreManager.getConditionListSize()).toNumber(), 1)
        })

        it('createRole should create with zero timeout and timelock', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()
            await conditionStoreManager.createCondition(conditionId, conditionType)

            // conditionId should exist after create
            let {
                typeRef,
                state,
                timeLock,
                timeOut
            } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(typeRef, conditionType)
            assert.strictEqual(state.toNumber(), constants.condition.state.unfulfilled)
            assert.strictEqual(timeLock.toNumber(), 0)
            assert.strictEqual(timeOut.toNumber(), 0)
        })

        it('createRole should create with nonzero timeout and timelock', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()
            let conditionTimeLock = 1
            let conditionTimeOut = 10

            await conditionStoreManager.createCondition(
                conditionId,
                conditionType,
                conditionTimeLock,
                conditionTimeOut)

            let {
                typeRef,
                state,
                timeLock,
                timeOut,
                blockNumber
            } = await conditionStoreManager.getCondition(conditionId)

            assert.strictEqual(typeRef, conditionType)
            assert.strictEqual(state.toNumber(), constants.condition.state.unfulfilled)
            assert.strictEqual(timeLock.toNumber(), conditionTimeLock)
            assert.strictEqual(timeOut.toNumber(), conditionTimeOut)
            assert.isAbove(blockNumber.toNumber(), 0)
        })

        it('invalid createRole should not create', async () => {
            const {
                conditionStoreManager,
                conditionId,
                conditionType
            } = await setupTest({ createRole: accounts[1] })

            await assert.isRejected(
                conditionStoreManager.createCondition(conditionId, conditionType),
                constants.acl.error.invalidCreateConditionRole
            )
        })

        it('invalid address should not create', async () => {
            const {
                conditionStoreManager,
                conditionId,
                conditionType
            } = await setupTest({ conditionType: constants.address.zero })

            await assert.isRejected(
                conditionStoreManager.createCondition(conditionId, conditionType),
                constants.address.error.invalidAddress0x0
            )
        })

        it('existing ID should not create', async () => {
            const {
                conditionStoreManager,
                conditionId,
                conditionType
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.createCondition(conditionId, conditionType)

            await assert.isRejected(
                conditionStoreManager.createCondition(conditionId, conditionType),
                constants.condition.id.error.idAlreadyExists
            )
        })
    })

    describe('get conditions', () => {
        it('successful create should get unfulfilled condition', async () => {
            const { common, conditionStoreManager, conditionId, conditionType } = await setupTest()

            const blockNumber = await common.getCurrentBlockNumber()
            // returns true on create
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let {
                typeRef,
                state,
                timeLock,
                timeOut,
                lastUpdatedBy,
                blockNumberUpdated
            } = await conditionStoreManager.getCondition(conditionId)

            assert.strictEqual(typeRef, conditionType)
            assert.strictEqual(state.toNumber(), constants.condition.state.unfulfilled)
            assert.strictEqual(timeLock.toNumber(), 0)
            assert.strictEqual(timeOut.toNumber(), 0)
            expect(lastUpdatedBy)
                .to.equal(accounts[0])
            expect(blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })

        it('no create should get uninitialized Condition', async () => {
            const { conditionStoreManager, conditionId } = await setupTest()

            let { typeRef, state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(typeRef, constants.address.zero)
            assert.strictEqual(state.toNumber(), constants.condition.state.uninitialized)
        })
    })

    describe('update condition state', () => {
        it('should not transition from uninitialized', async () => {
            const { conditionStoreManager, conditionId } = await setupTest()
            let newState = constants.condition.state.unfulfilled
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('correct role should transition from unfulfilled to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.fulfilled
            await conditionStoreManager.updateConditionState(conditionId, newState)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)
        })

        it('correct role should transition from unfulfilled to aborted', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.aborted
            await conditionStoreManager.updateConditionState(conditionId, newState)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.aborted)
        })

        it('correct role should not transition from unfulfilled to uninitialized', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.uninitialized
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from unfulfilled to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.unfulfilled
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from fulfilled to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from fulfilled to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from aborted to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from fulfilled to uninitialized', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.uninitialized),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from aborted to uninitialized', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.uninitialized),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from fulfilled to aborted', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from aborted to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from fulfilled to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from aborted to aborted', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('wrong role should not update', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.fulfilled
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.acl.error.invalidUpdateRole
            )
        })
    })

    describe('time locked conditions', () => {
        it('zero time lock should not time lock', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            let conditionTimeLock = 0
            let conditionTimeOut = 0

            await conditionStoreManager.createCondition(
                conditionId,
                conditionType,
                conditionTimeLock,
                conditionTimeOut)
            assert.strictEqual(
                await conditionStoreManager.isConditionTimeLocked(conditionId),
                false
            )
        })

        it('nonzero time lock should time lock', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            let conditionTimeLock = 10
            let conditionTimeOut = 0

            await conditionStoreManager.createCondition(
                conditionId,
                conditionType,
                conditionTimeLock,
                conditionTimeOut)
            assert.strictEqual(
                await conditionStoreManager.isConditionTimeLocked(conditionId),
                true
            )
        })

        it('nonzero time lock should not update', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            let conditionTimeLock = 10
            let conditionTimeOut = 0

            await conditionStoreManager.createCondition(
                conditionId,
                conditionType,
                conditionTimeLock,
                conditionTimeOut)
            let newState = constants.condition.state.fulfilled
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.condition.epoch.error.isTimeLocked
            )
        })

        it('nonzero time lock should update after timeLock expires', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            let conditionTimeLock = 3
            let conditionTimeOut = 0

            await conditionStoreManager.createCondition(
                conditionId,
                conditionType,
                conditionTimeLock,
                conditionTimeOut)
            let newState = constants.condition.state.fulfilled
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.condition.epoch.error.isTimeLocked
            )
            // waited for a block
            await increaseTime(1)

            await conditionStoreManager.updateConditionState(conditionId, newState)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)
        })
    })

    describe('timeout conditions', () => {
        it('zero time out should not time out', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            let conditionTimeLock = 0
            let conditionTimeOut = 0

            await conditionStoreManager.createCondition(
                conditionId,
                conditionType,
                conditionTimeLock,
                conditionTimeOut)
            assert.strictEqual(
                await conditionStoreManager.isConditionTimedOut(conditionId),
                false
            )
        })

        it('nonzero time out should time out', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            let conditionTimeLock = 0
            let conditionTimeOut = 1

            await conditionStoreManager.createCondition(
                conditionId,
                conditionType,
                conditionTimeLock,
                conditionTimeOut)

            assert.strictEqual(
                await conditionStoreManager.isConditionTimedOut(conditionId),
                false
            )
            // wait for a block
            await increaseTime(1)

            assert.strictEqual(
                await conditionStoreManager.isConditionTimedOut(conditionId),
                true
            )
        })

        it('nonzero time out should not abort after time out', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            let conditionTimeLock = 0
            let conditionTimeOut = 1

            await conditionStoreManager.createCondition(
                conditionId,
                conditionType,
                conditionTimeLock,
                conditionTimeOut)

            // wait for a block
            await increaseTime(1)

            let newState = constants.condition.state.fulfilled
            await conditionStoreManager.updateConditionState(conditionId, newState)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.aborted)
        })

        it('nonzero time lock should update before time out', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            let conditionTimeLock = 0
            let conditionTimeOut = 1

            await conditionStoreManager.createCondition(
                conditionId,
                conditionType,
                conditionTimeLock,
                conditionTimeOut)

            let newState = constants.condition.state.fulfilled
            await conditionStoreManager.updateConditionState(conditionId, newState)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)
        })

        it('timed out condition should abort by timeout', async () => {
            const {
                conditionStoreManager,
                hashLockCondition,
                conditionId
            } = await setupTest()

            let conditionTimeLock = 0
            let conditionTimeOut = 1

            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut)

            // wait for a block
            await increaseTime(1)

            await hashLockCondition.abortByTimeOut(conditionId)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.aborted)
        })

        it('timed out condition should not abort before timeout', async () => {
            const {
                conditionStoreManager,
                hashLockCondition,
                conditionId
            } = await setupTest()

            let conditionTimeLock = 0
            let conditionTimeOut = 10

            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut)

            // wait for a block
            await increaseTime(1)

            await assert.isRejected(
                hashLockCondition.abortByTimeOut(conditionId),
                constants.condition.epoch.error.conditionNeedsToBeTimedOut)
        })
    })
})
