/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const EpochLibrary = artifacts.require('EpochLibrary.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const constants = require('../../helpers/constants.js')

contract('ConditionStore constructor', (accounts) => {
    let conditionId
    let conditionType
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        setupConditionStoreManager = true
    } = {}) {
        const epochLibrary = await EpochLibrary.new({ from: accounts[0] })
        const conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
        if (setupConditionStoreManager) {
            await conditionStoreManager.setup(createRole)
        }
        return { epochLibrary, conditionStoreManager, conditionId, conditionType, createRole }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            // act-assert
            await ConditionStoreManager.new({ from: accounts[0] })
        })

        it('contract should setup', async () => {
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            let getCreateRole = await conditionStoreManager.getCreateRole()
            // address should be 0x0 before setup
            assert.strictEqual(getCreateRole, constants.address.zero)

            // address should be set after correct setup
            let createRole = accounts[1]
            await conditionStoreManager.setup(createRole)
            getCreateRole = await conditionStoreManager.getCreateRole()
            assert.strictEqual(getCreateRole, createRole)
        })

        it('contract should not setup with zero', async () => {
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })

            // setup with zero fails
            let createRole = constants.address.zero
            await assert.isRejected(
                conditionStoreManager.setup(createRole),
                constants.address.error.invalidAddress0x0
            )
        })

        it('anyone should not change createRole after setup', async () => {
            // setup correctly
            let conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            let createRole = accounts[1]
            await conditionStoreManager.setup(createRole)

            let getCreateRole = await conditionStoreManager.getCreateRole()
            assert.strictEqual(getCreateRole, createRole)

            // try to force with other account
            let otherCreateRole = accounts[0]
            assert.notEqual(otherCreateRole, createRole)
            await conditionStoreManager.setup(otherCreateRole)
            assert.strictEqual(getCreateRole, createRole)
        })
    })

    describe('create conditions', () => {
        let conditionStoreManager
        let epochLibrary
        let createRole = accounts[0]

        beforeEach(async () => {
            epochLibrary = await EpochLibrary.new({ from: accounts[0] })
            conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
        })

        it('createRole should create', async () => {
            await conditionStoreManager.setup(createRole)

            // conditionId should exist after create
            await conditionStoreManager.createCondition(conditionId, conditionType)
            assert.strictEqual(await conditionStoreManager.exists(conditionId), true)
            assert.strictEqual((await conditionStoreManager.getConditionListSize()).toNumber(), 1)
        })

        it('createRole should create with nonzero timeout and timelock', async () => {
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
            await conditionStoreManager.setup(createRole)

            let conditionId = constants.bytes32.one
            let conditionType = constants.address.dummy
            let conditionTimeLock = 1
            let conditionTimeOut = 10

            let currentBlockNumber = await epochLibrary.getCurrentBlockNumber()

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
            assert.strictEqual(blockNumber.toNumber(), currentBlockNumber.toNumber())
        })

        it('invalid createRole should not create', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ createRole: accounts[1] })

            await assert.isRejected(
                conditionStoreManager.createCondition(conditionId, conditionType),
                'Invalid CreateRole'
            )
        })

        it('invalid address should not create', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: constants.address.zero })

            await assert.isRejected(
                conditionStoreManager.createCondition(conditionId, conditionType),
                'Invalid address: 0x0'
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
                'Invalid UpdateRole'
            )
        })

        it('correct role should transition from unfulfilled to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.fulfilled
            await conditionStoreManager.updateConditionState(conditionId, newState)
            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
        })

        it('correct role should transition from unfulfilled to aborted', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.aborted
            await conditionStoreManager.updateConditionState(conditionId, newState)
            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(state.toNumber(), constants.condition.state.aborted)
        })

        it('correct role should not transition from unfulfilled to uninitialized', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.uninitialized
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                'Invalid state transition'
            )
        })

        it('correct role should not transition from unfulfilled to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.unfulfilled
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                'Invalid state transition'
            )
        })

        it('correct role should not transition from fulfilled to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled),
                'Invalid state transition'
            )
        })

        it('correct role should not transition from fulfilled to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled),
                'Invalid state transition'
            )
        })

        it('correct role should not transition from aborted to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled),
                'Invalid state transition'
            )
        })

        it('correct role should not transition from fulfilled to uninitialized', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.uninitialized),
                'Invalid state transition'
            )
        })

        it('correct role should not transition from aborted to uninitialized', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.uninitialized),
                'Invalid state transition'
            )
        })

        it('correct role should not transition from fulfilled to aborted', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted),
                'Invalid state transition'
            )
        })

        it('correct role should not transition from aborted to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled),
                'Invalid state transition'
            )
        })

        it('correct role should not transition from fulfilled to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled),
                'Invalid state transition'
            )
        })

        it('correct role should not transition from aborted to aborted', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted),
                'Invalid state transition'
            )
        })

        it('wrong role should not update', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.unfulfilled
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                'Invalid UpdateRole'
            )
        })

        it('no create should not exist', async () => {
            const { conditionStoreManager, conditionId } = await setupTest({ conditionType: accounts[0] })
            assert.strictEqual(await conditionStoreManager.exists(conditionId), false)
        })
    })
})
