/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const SignCondition = artifacts.require('SignCondition')

const constants = require('../../helpers/constants.js')

contract('SignCondition constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        setupConditionStoreManager = true
    } = {}) {
        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

        const conditionStoreManager = await ConditionStoreManager.new()

        if (setupConditionStoreManager) {
            await conditionStoreManager.initialize(
                createRole,
                { from: accounts[0] }
            )
        }
        const signCondition = await SignCondition.new()
        await signCondition.initialize(conditionStoreManager.address, { from: accounts[0] })

        return { signCondition, conditionStoreManager, conditionId, conditionType, createRole }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const conditionStoreManager = await ConditionStoreManager.new()
            const signCondition = await SignCondition.new()
            await signCondition.initialize(conditionStoreManager.address, { from: accounts[0] })
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist for bytes32 message', async () => {
            const { signCondition } = await setupTest({ setupConditionStoreManager: false })

            let nonce = constants.bytes32.one
            let {
                message,
                publicKey,
                signature
            } = constants.condition.sign.bytes32

            await assert.isRejected(
                signCondition.fulfill(nonce, message, publicKey, signature, { from: accounts[2] }),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist for bytes32 message', async () => {
            const { signCondition, conditionStoreManager } = await setupTest()

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
        it('wrong signature should fail to fulfill if conditions exist for bytes32 message', async () => {
            const { signCondition, conditionStoreManager } = await setupTest()

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

            await assert.isRejected(
                signCondition.fulfill(
                    nonce, message, publicKey,
                    constants.bytes32.one
                ),
                constants.condition.sign.error.couldNotRecoverSignature
            )
        })

        it('right signature should fail to fulfill if conditions already fulfilled for bytes32', async () => {
            const { signCondition, conditionStoreManager } = await setupTest()

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
            await assert.isRejected(
                signCondition.fulfill(nonce, message, publicKey, signature),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            const { signCondition, conditionStoreManager } = await setupTest()

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
            await assert.isRejected(
                signCondition.fulfill(nonce, message, publicKey, signature),
                constants.acl.error.invalidUpdateRole
            )
        })
    })
})
