/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const EpochLibrary = artifacts.require('EpochLibrary.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const constants = require('../../helpers/constants.js')

contract('ConditionStore constructor', (accounts) => {

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
        return {epochLibrary, conditionStoreManager, conditionId, conditionType, createRole}
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
            try {
                await conditionStoreManager.setup(createRole)
            } catch (e) {
                assert.strictEqual(e.reason, constants.address.error.invalidAddress0x0)
                return
            }
            assert.fail('Expected revert not received')
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

        it('createRole should create', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()
            
            assert.strictEqual(await conditionStoreManager.exists(conditionId), false)
            assert.strictEqual((await conditionStoreManager.getConditionListSize()).toNumber(), 0)

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
            assert.strictEqual(conditionType, typeRef)
            assert.strictEqual(constants.condition.state.unfulfilled, state.toNumber())
            assert.strictEqual(0, timeLock.toNumber())
            assert.strictEqual(0, timeOut.toNumber())
        })

        it('createRole should create with nonzero timeout and timelock', async () => {
            const { conditionStoreManager, epochLibrary, conditionId, conditionType } = await setupTest()
            let conditionTimeLock = 10
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

            assert.strictEqual(conditionType, typeRef)
            assert.strictEqual(constants.condition.state.unfulfilled, state.toNumber())
            assert.strictEqual(conditionTimeLock, timeLock.toNumber())
            assert.strictEqual(conditionTimeOut, timeOut.toNumber())
            assert.strictEqual(currentBlockNumber.toNumber(), blockNumber.toNumber())
        })

        it('invalid createRole should not create', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({createRole: accounts[1]})
            
            await assert.isRejected(
                conditionStoreManager.createCondition(conditionId, conditionType),
                'Invalid CreateRole'
            )
        })

        it('invalid address should not create', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: constants.address.zero})

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
            assert.strictEqual(conditionType, typeRef)
            assert.strictEqual(constants.condition.state.unfulfilled, state.toNumber())
            assert.strictEqual(0, timeLock.toNumber())
            assert.strictEqual(0, timeOut.toNumber())
        })

        it('no create should get uninitialized Condition', async () => {
            const { conditionStoreManager, conditionId } = await setupTest()

            let { typeRef, state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.address.zero, typeRef)
            assert.strictEqual(constants.condition.state.uninitialized, state.toNumber())
        })
    })

    describe('exists', () => {
        it('successful create should exist', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()
            
            // returns true on create
            await conditionStoreManager.createCondition(conditionId, conditionType)
            assert.strictEqual(true, await conditionStoreManager.exists(conditionId))
        })

        it('no create should not exist', async () => {
            const { conditionStoreManager, conditionId } = await setupTest()
            assert.strictEqual(false, await conditionStoreManager.exists(conditionId))
        })
    })

    describe('update condition state', () => {
        it('should not transition from uninitialized', async () => {
            const { conditionStoreManager, conditionId } = await setupTest()
            let newState = constants.condition.state.unfulfilled
            try {
                await conditionStoreManager.updateConditionState(conditionId, newState)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should transition from unfulfilled to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.fulfilled
            await conditionStoreManager.updateConditionState(conditionId, newState)
            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
        })

        it('correct role should transition from unfulfilled to aborted', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.aborted
            await conditionStoreManager.updateConditionState(conditionId, newState)
            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.aborted, state.toNumber())
        })

        it('correct role should not transition from unfulfilled to uninitialized', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.uninitialized
            try {
                await conditionStoreManager.updateConditionState(conditionId, newState)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should not transition from unfulfilled to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.unfulfilled
            try {
                await conditionStoreManager.updateConditionState(conditionId, newState)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should not transition from fulfilled to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            try {
                await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should not transition from fulfilled to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            try {
                await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should not transition from aborted to unfulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            try {
                await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should not transition from fulfilled to uninitialized', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            try {
                await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.uninitialized)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should not transition from aborted to uninitialized', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            try {
                await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.uninitialized)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should not transition from fulfilled to aborted', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            try {
                await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should not transition from aborted to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            try {
                await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should not transition from fulfilled to fulfilled', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            try {
                await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('correct role should not transition from aborted to aborted', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest({conditionType: accounts[0]})
            await conditionStoreManager.createCondition(conditionId, conditionType)

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            try {
                await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid state transition')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('wrong role should not update', async () => {
            const { conditionStoreManager, conditionId, conditionType } = await setupTest()
            await conditionStoreManager.createCondition(conditionId, conditionType)

            let newState = constants.condition.state.unfulfilled
            try {
                await conditionStoreManager.updateConditionState(conditionId, newState)
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid UpdateRole')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('no create should not exist', async () => {
            const { conditionStoreManager, conditionId } = await setupTest({conditionType: accounts[0]})
            assert.strictEqual(false, await conditionStoreManager.exists(conditionId))
        })
    })

})
