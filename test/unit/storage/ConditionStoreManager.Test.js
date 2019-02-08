/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary.sol')
const ConditionStoreLibrary = artifacts.require('ConditionStoreLibrary.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')

const constants = require('../../helpers/constants.js')
const increaseTime = require('../../helpers/increaseTime.js')

contract('ConditionStore constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createConditionRole = accounts[0],
        setupConditionStoreManager = true
    } = {}) {
        const epochLibrary = await EpochLibrary.new({ from: accounts[0] })
        await ConditionStoreLibrary.link('EpochLibrary', epochLibrary.address)
        const conditionStoreLibrary = await ConditionStoreLibrary.new({ from: accounts[0] })
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        await ConditionStoreManager.link('ConditionStoreLibrary', conditionStoreLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })

        if (setupConditionStoreManager) {
            await conditionStoreManager.setup(createConditionRole)
        }
        return { epochLibrary, conditionStoreManager, conditionId, conditionType, createConditionRole }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            // act-assert
            const epochLibrary = await EpochLibrary.new({ from: accounts[0] })
            await ConditionStoreLibrary.link('EpochLibrary', epochLibrary.address)
            const conditionStoreLibrary = await ConditionStoreLibrary.new({ from: accounts[0] })
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            await ConditionStoreManager.link('ConditionStoreLibrary', conditionStoreLibrary.address)
            await ConditionStoreManager.new({ from: accounts[0] })
        })

        it('contract should setup', async () => {
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            let getCreateConditionRole = await conditionStoreManager.getCreateConditionRole()
            // address should be 0x0 before setup
            assert.strictEqual(getCreateConditionRole, constants.address.zero)

            // address should be set after correct setup
            let createConditionRole = accounts[1]
            await conditionStoreManager.setup(createConditionRole)
            getCreateConditionRole = await conditionStoreManager.getCreateConditionRole()
            assert.strictEqual(getCreateConditionRole, createConditionRole)
        })

        it('contract should not setup with zero', async () => {
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })

            // setup with zero fails
            let createConditionRole = constants.address.zero
            await assert.isRejected(
                conditionStoreManager.setup(createConditionRole),
                constants.address.error.invalidAddress0x0
            )
        })

        it('anyone should not change createConditionRole after setup', async () => {
            // setup correctly
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            let createConditionRole = accounts[1]
            await conditionStoreManager.setup(createConditionRole)

            let getCreateConditionRole = await conditionStoreManager.getCreateConditionRole()
            assert.strictEqual(getCreateConditionRole, createConditionRole)

            // try to force with other account
            let otherCreateConditionRole = accounts[0]
            assert.notEqual(otherCreateConditionRole, createConditionRole)
            await conditionStoreManager.setup(otherCreateConditionRole)
            assert.strictEqual(getCreateConditionRole, createConditionRole)
        })
    })

    describe('create conditions', () => {
        it('createConditionRole should create', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()

            assert.strictEqual(await conditionStoreManager.exists(conditionId), false)
            assert.strictEqual((await conditionStoreManager.getConditionListSize()).toNumber(), 0)

            // conditionId should exist after create
            await conditionStoreManager.createCondition(conditionId, conditionType)
            assert.strictEqual(await conditionStoreManager.exists(conditionId), true)
            assert.strictEqual((await conditionStoreManager.getConditionListSize()).toNumber(), 1)
        })

        it('createConditionRole should create with zero timeout and timelock', async () => {
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

        it('createConditionRole should create with nonzero timeout and timelock', async () => {
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

        it('invalid createConditionRole should not create', async () => {
            const {
                conditionStoreManager,
                conditionId,
                conditionType
            } = await setupTest({ createConditionRole: accounts[1] })

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
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()

            // returns true on create
            await conditionStoreManager.createCondition(conditionId, conditionType)

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

        it('no create should get uninitialized Condition', async () => {
            const { conditionStoreManager, conditionId } = await setupTest()

            let { typeRef, state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(typeRef, constants.address.zero)
            assert.strictEqual(state.toNumber(), constants.condition.state.uninitialized)
        })
    })

    describe('exists', () => {
        it('successful create should exist', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()

            // returns true on create
            await conditionStoreManager.createCondition(conditionId, conditionType)
            assert.strictEqual(await conditionStoreManager.exists(conditionId), true)
        })

        it('no create should not exist', async () => {
            const { conditionStoreManager, conditionId } = await setupTest()
            assert.strictEqual(await conditionStoreManager.exists(conditionId), false)
        })
    })

    describe('update condition state', () => {
        it('should not transition from uninitialized', async () => {
            const { conditionStoreManager, conditionId } = await setupTest()
            let newState = constants.condition.state.unfulfilled
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.condition.state.error.invalidStateTransition
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
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('correct role should not transition from aborted to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('correct role should not transition from fulfilled to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('correct role should not transition from aborted to aborted', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
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

        it('no create should not exist', async () => {
            const { conditionStoreManager, conditionId } = await setupTest({ conditionType: accounts[0] })
            assert.strictEqual(await conditionStoreManager.exists(conditionId), false)
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
    })
})
