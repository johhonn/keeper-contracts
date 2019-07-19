/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const ThresholdCondition = artifacts.require('ThresholdCondition')
const HashLockCondition = artifacts.require('HashLockCondition')

const constants = require('../../helpers/constants.js')

contract('Threshold Condition', (accounts) => {
    let owner = accounts[1]
    let createRole = accounts[0]
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        owner = accounts[1],
        fulfillInputConditions = true
    } = {}) {
        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

        const conditionStoreManager = await ConditionStoreManager.new()
        await conditionStoreManager.initialize(
            owner,
            { from: accounts[0] }
        )

        await conditionStoreManager.delegateCreateRole(
            createRole,
            { from: owner }
        )

        const thresholdCondition = await ThresholdCondition.new()
        await thresholdCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: accounts[0] }
        )

        // create dummy and real input conditions
        hashLockCondition = await HashLockCondition.new()
        await hashLockCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: owner }
        )

        const firstConditionId = await hashLockCondition.generateId(
            constants.bytes32.one,
            constants.condition.hashlock.uint.keccak
        )

        const secondConditionId = await hashLockCondition.generateId(
            constants.bytes32.two,
            constants.condition.hashlock.uint.keccak
        )

        await conditionStoreManager.createCondition(
            firstConditionId,
            hashLockCondition.address
        )

        await conditionStoreManager.createCondition(
            secondConditionId,
            hashLockCondition.address
        )

        if(fulfillInputConditions)
        {
            await hashLockCondition.fulfill(
                constants.bytes32.one,
                constants.condition.hashlock.uint.preimage
            )

            await hashLockCondition.fulfill(
                constants.bytes32.two,
                constants.condition.hashlock.uint.preimage
            )

            const firstConditionState  = await conditionStoreManager.getCondition(firstConditionId)
            const secondConditionState  = await conditionStoreManager.getCondition(secondConditionId)
            assert.strictEqual(firstConditionState.state.toNumber(), constants.condition.state.fulfilled)
            assert.strictEqual(secondConditionState.state.toNumber(), constants.condition.state.fulfilled)
        }

        const inputConditions = [
            firstConditionId,
            secondConditionId
        ]

        return { thresholdCondition, conditionStoreManager, conditionId, conditionType, createRole, owner, inputConditions }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const conditionStoreManager = await ConditionStoreManager.new()
            await conditionStoreManager.initialize(
                owner,
                { from: owner }
            )

            await conditionStoreManager.delegateCreateRole(
                createRole,
                { from: owner }
            )

            const thresholdCondition = await ThresholdCondition.new()
            await thresholdCondition.initialize(
                owner,
                conditionStoreManager.address,
                { from: owner }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist', async () => {
            const { thresholdCondition, inputConditions } = await setupTest()
            const someone = accounts[9]
            let agreementId = constants.bytes32.three

            await assert.isRejected(
                thresholdCondition.fulfill(agreementId, inputConditions, 2, { from: accounts[2] }),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist', async () => {
            const {
                thresholdCondition,
                conditionStoreManager,
                inputConditions,
                owner,
                createRole
            } = await setupTest()

            let agreementId = constants.bytes32.three
            const someone = accounts[9]

            let hashValues = await thresholdCondition.hashValues(inputConditions, inputConditions.length)

            const conditionId = await thresholdCondition.generateId(
                agreementId,
                hashValues
            )

            await conditionStoreManager.createCondition(
                conditionId,
                thresholdCondition.address
            )

            await thresholdCondition.methods['fulfill(bytes32,bytes32[],uint256)'](
                agreementId,
                inputConditions,
                inputConditions.length,
                {
                    from: createRole
                }
            )

            let { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
        })
    })

    describe('fail to fulfill existing condition', () => {
        it('wrong value should fail to fulfill if conditions exist', async () => {
            const {
                thresholdCondition,
                conditionStoreManager,
                inputConditions,
                owner,
                createRole
            } = await setupTest()
            let agreementId = constants.bytes32.three
            const someone = accounts[9]

            let hashValues = await thresholdCondition.hashValues(inputConditions, inputConditions.length)

            const conditionId = await thresholdCondition.generateId(
                agreementId,
                hashValues
            )

            await conditionStoreManager.createCondition(
                conditionId,
                thresholdCondition.address
            )

            await thresholdCondition.methods['fulfill(bytes32,bytes32[],uint256)'](
                agreementId,
                inputConditions,
                inputConditions.length,
                {
                    from: createRole
                }
            )
            invalidInputConditions = [
                constants.bytes32.one,
                constants.bytes32.two
            ]
            await assert.isRejected(
                    thresholdCondition.methods['fulfill(bytes32,bytes32[],uint256)'](
                    agreementId,
                    invalidInputConditions,
                    inputConditions.length,
                    {
                        from: createRole
                    }
                ),
                'Invalid threshold fulfilment'
            )
        })

        it('wrong value should fail to fulfill if conditions exist', async () => {
            const {
                thresholdCondition,
                conditionStoreManager,
                inputConditions,
                owner,
                createRole
            } = await setupTest()
            let agreementId = constants.bytes32.three
            const someone = accounts[9]

            let hashValues = await thresholdCondition.hashValues(inputConditions, inputConditions.length)

            const conditionId = await thresholdCondition.generateId(
                agreementId,
                hashValues
            )

            await conditionStoreManager.createCondition(
                conditionId,
                thresholdCondition.address
            )
            await assert.isRejected(
                    thresholdCondition.methods['fulfill(bytes32,bytes32[],uint256)'](
                    agreementId,
                    inputConditions,
                    inputConditions.length -1,
                    {
                        from: createRole
                    }
                ),
                'Invalid UpdateRole'
            )
        })

        it('right value should fail to fulfill if conditions already fulfilled ', async () => {
            const {
                thresholdCondition,
                conditionStoreManager,
                inputConditions,
                owner,
                createRole
            } = await setupTest()

            let agreementId = constants.bytes32.three
            const someone = accounts[9]

            let hashValues = await thresholdCondition.hashValues(inputConditions, inputConditions.length)

            const conditionId = await thresholdCondition.generateId(
                agreementId,
                hashValues
            )

            await conditionStoreManager.createCondition(
                conditionId,
                thresholdCondition.address
            )

            await thresholdCondition.methods['fulfill(bytes32,bytes32[],uint256)'](
                agreementId,
                inputConditions,
                inputConditions.length,
                {
                    from: createRole
                }
            )

            await assert.isRejected(
                thresholdCondition.methods['fulfill(bytes32,bytes32[],uint256)'](
                    agreementId,
                    inputConditions,
                    inputConditions.length,
                    {
                        from: createRole
                    }
                ),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            const {
                thresholdCondition,
                conditionStoreManager,
                inputConditions,
                owner,
                createRole
            } = await setupTest()

            let agreementId = constants.bytes32.three
            const someone = accounts[9]

            let hashValues = await thresholdCondition.hashValues(inputConditions, inputConditions.length)

            const conditionId = await thresholdCondition.generateId(
                agreementId,
                hashValues
            )

            await conditionStoreManager.createCondition(
                conditionId,
                thresholdCondition.address
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await assert.isRejected(
                thresholdCondition.methods['fulfill(bytes32,bytes32[],uint256)'](
                    agreementId,
                    inputConditions,
                    inputConditions.length,
                    {
                        from: createRole
                    }
                ),
                constants.acl.error.invalidUpdateRole
            )
        })
    })
})
