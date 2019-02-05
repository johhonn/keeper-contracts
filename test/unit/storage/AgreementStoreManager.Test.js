/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary.sol')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const AgreementStoreManager = artifacts.require('AgreementStoreManager.sol')
const constants = require('../../helpers/constants.js')

contract('AgreementStoreManager', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        setupConditionStoreManager = true,
    } = {}) {
        const epochLibrary = await EpochLibrary.new({ from: createRole })
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new({ from: createRole })

        if (setupConditionStoreManager) {
            await conditionStoreManager.setup(createRole)
        }

        const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: createRole })
        await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
        const agreementStoreManager = await AgreementStoreManager.new(
            conditionStoreManager.address,
            { from: createRole }
        )

        return { agreementStoreManager, conditionStoreManager, conditionId, conditionType, createRole }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            // act-assert
            const epochLibrary = await EpochLibrary.new({ from: accounts[0] })
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })

            const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: accounts[0] })
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            await AgreementStoreManager.new(
                conditionStoreManager.address,
                { from: accounts[0] }
            )
        })
    })

    describe('create agreement', () => {
        it('anyone should create', async () => {
            const { agreementStoreManager } = await setupTest()
            await agreementStoreManager.createAgreement(
                constants.bytes32.one,
                constants.did,
                constants.bytes32.one,
                [constants.bytes32.one]
            )

            assert.strictEqual(
                (await agreementStoreManager.getAgreementListSize()).toNumber(),
                1
            )
        })
    })

    describe('get agreement', () => {
        it('successful create should get unfulfilled condition', async () => {
            // const { conditionStoreManager, conditionId, conditionType } = await setupTest()
            //
            // // returns true on create
            // await conditionStoreManager.createCondition(conditionId, conditionType)
            //
            // let {
            //     typeRef,
            //     state,
            //     timeLock,
            //     timeOut
            // } = await conditionStoreManager.getCondition(conditionId)
            // assert.strictEqual(typeRef, conditionType)
            // assert.strictEqual(state.toNumber(), constants.condition.state.unfulfilled)
            // assert.strictEqual(timeLock.toNumber(), 0)
            // assert.strictEqual(timeOut.toNumber(), 0)
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
})
