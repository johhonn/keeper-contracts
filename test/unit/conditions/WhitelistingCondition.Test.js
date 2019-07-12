/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const HashList = artifacts.require('HashList')
const EpochLibrary = artifacts.require('EpochLibrary')
const HashListLibrary = artifacts.require('HashListLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const WhitelistingCondition = artifacts.require('WhitelistingCondition')

const constants = require('../../helpers/constants.js')

contract('Whitelisting Condition', (accounts) => {
    let owner = accounts[1]
    let createRole = accounts[0]
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        owner = accounts[1]
    } = {}) {
        const epochLibrary = await EpochLibrary.new()
        const hashListLibrary = await HashListLibrary.new()

        await HashList.link('HashListLibrary', hashListLibrary.address)
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)


        const hashList = await HashList.new()
        await hashList.initialize(
            owner,
            {
                from: accounts[0]
            }
        )
        const conditionStoreManager = await ConditionStoreManager.new()
        await conditionStoreManager.initialize(
            owner,
            { from: accounts[0] }
        )

        await conditionStoreManager.delegateCreateRole(
            createRole,
            { from: owner }
        )

        const whitelistingCondition = await WhitelistingCondition.new()
        await whitelistingCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: accounts[0] }
        )

        return { whitelistingCondition, conditionStoreManager, hashList, conditionId, conditionType, createRole, owner }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new()
            const hashListLibrary = await HashListLibrary.new()

            await HashList.link('HashListLibrary', hashListLibrary.address)
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const hashList = await HashList.new()
            await hashList.initialize(
                owner,
                {
                    from: accounts[0]
                }
            )

            const conditionStoreManager = await ConditionStoreManager.new()
            await conditionStoreManager.initialize(
                owner,
                { from: accounts[0] }
            )

            await conditionStoreManager.delegateCreateRole(
                createRole,
                { from: owner }
            )

            const whitelistingCondition = await WhitelistingCondition.new()
            await whitelistingCondition.initialize(
                owner,
                conditionStoreManager.address,
                { from: accounts[0] }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist for bytes32 message', async () => {
            const { whitelistingCondition, hashList } = await setupTest()
            const someone = accounts[9]
            let agreementId = constants.bytes32.one

            const value = await hashList.hash(someone)

            await assert.isRejected(
                whitelistingCondition.fulfill(agreementId, hashList.address, value, { from: accounts[2] }),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist for bytes32 message', async () => {
            const { whitelistingCondition, conditionStoreManager } = await setupTest()
//
//            let agreementId = constants.bytes32.one
//            let {
//                message,
//                publicKey,
//                signature
//            } = constants.condition.sign.bytes32
//
//            let hashValues = await signCondition.hashValues(message, publicKey)
//            let conditionId = await signCondition.generateId(agreementId, hashValues)
//
//            await conditionStoreManager.createCondition(
//                conditionId,
//                signCondition.address
//            )
//
//            await signCondition.fulfill(agreementId, message, publicKey, signature)
//
//            let { state } = await conditionStoreManager.getCondition(conditionId)
//            assert.strictEqual(constants.condition.state.fulfilled, state.toNumber())
        })
    })

    describe('fail to fulfill existing condition', () => {
        it('wrong signature should fail to fulfill if conditions exist for bytes32 message', async () => {
            const { whitelistingCondition, conditionStoreManager } = await setupTest()
//
//            let agreementId = constants.bytes32.one
//            let {
//                message,
//                publicKey
//            } = constants.condition.sign.bytes32
//
//            let hashValues = await signCondition.hashValues(message, publicKey)
//            let conditionId = await signCondition.generateId(agreementId, hashValues)
//
//            await conditionStoreManager.createCondition(
//                conditionId,
//                signCondition.address
//            )
//
//            await assert.isRejected(
//                signCondition.fulfill(
//                    agreementId, message, publicKey,
//                    constants.bytes32.one
//                ),
//                constants.condition.sign.error.couldNotRecoverSignature
//            )
        })

        it('right signature should fail to fulfill if conditions already fulfilled for bytes32', async () => {
            const { whitelistingCondition, conditionStoreManager } = await setupTest()
//
//            let agreementId = constants.bytes32.one
//            let {
//                message,
//                publicKey,
//                signature
//            } = constants.condition.sign.bytes32
//
//            let hashValues = await signCondition.hashValues(message, publicKey)
//            let conditionId = await signCondition.generateId(agreementId, hashValues)
//
//            await conditionStoreManager.createCondition(
//                conditionId,
//                signCondition.address
//            )
//
//            // fulfill once
//            await signCondition.fulfill(agreementId, message, publicKey, signature)
//            // try to fulfill another time
//            await assert.isRejected(
//                signCondition.fulfill(agreementId, message, publicKey, signature),
//                constants.condition.state.error.invalidStateTransition
//            )
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            const { whitelistingCondition, conditionStoreManager, createRole, owner } = await setupTest()
//
//            let agreementId = constants.bytes32.one
//            let {
//                message,
//                publicKey,
//                signature
//            } = constants.condition.sign.bytes32
//
//            let hashValues = await signCondition.hashValues(message, publicKey)
//            let conditionId = await signCondition.generateId(agreementId, hashValues)
//
//            // create a condition of a type different than sign condition
//            await conditionStoreManager.createCondition(
//                conditionId,
//                signCondition.address
//            )
//
//            await conditionStoreManager.delegateUpdateRole(
//                conditionId,
//                createRole,
//                { from: owner }
//            )
//
//            // try to fulfill from sign condition
//            await assert.isRejected(
//                signCondition.fulfill(agreementId, message, publicKey, signature),
//                constants.acl.error.invalidUpdateRole
//            )
        })
    })
})
