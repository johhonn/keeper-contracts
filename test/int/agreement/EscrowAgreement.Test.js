/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary.sol')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const TemplateStoreManager = artifacts.require('TemplateStoreManager.sol')
const AgreementStoreManager = artifacts.require('AgreementStoreManager.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const HashLockCondition = artifacts.require('HashLockCondition.sol')
const SignCondition = artifacts.require('SignCondition.sol')
const LockRewardCondition = artifacts.require('LockRewardCondition.sol')
const EscrowReward = artifacts.require('EscrowReward.sol')

const constants = require('../../helpers/constants.js')
const getBalance = require('../../helpers/getBalance.js')

contract('AgreementStoreManager', (accounts) => {
    async function setupTest({
        agreementId = constants.bytes32.one,
        conditionIds = [constants.address.dummy],
        createRole = accounts[0],
        setupConditionStoreManager = true,
    } = {}) {
        const epochLibrary = await EpochLibrary.new({ from: createRole })

        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new({ from: createRole })

        const templateStoreManager = await TemplateStoreManager.new({ from: createRole })

        const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: createRole })
        await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
        const agreementStoreManager = await AgreementStoreManager.new(
            conditionStoreManager.address,
            templateStoreManager.address,
            { from: createRole }
        )
        if (setupConditionStoreManager) {
            await conditionStoreManager.setup(agreementStoreManager.address)
        }

        const oceanToken = await OceanToken.new({ from: createRole })
        await oceanToken.initialize(createRole)

        const hashLockCondition = await HashLockCondition.new(
            conditionStoreManager.address,
            { from: createRole }
        )

        const signCondition = await SignCondition.new(
            conditionStoreManager.address,
            { from: createRole }
        )

        const lockRewardCondition = await LockRewardCondition.new(
            conditionStoreManager.address,
            oceanToken.address,
            { from: createRole }
        )

        const escrowReward = await EscrowReward.new(
            conditionStoreManager.address,
            oceanToken.address,
            { from: createRole })

        return {
            oceanToken,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            hashLockCondition,
            signCondition,
            lockRewardCondition,
            escrowReward,
            agreementId,
            conditionIds,
            createRole
        }
    }

    describe('create and fulfill escrow agreement', () => {
        it('should create escrow agreement and fulfill', async () => {
            const {
                oceanToken,
                agreementStoreManager,
                templateStoreManager,
                conditionStoreManager,
                signCondition,
                lockRewardCondition,
                escrowReward
            } = await setupTest()

            // deploy template
            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [
                    lockRewardCondition.address,
                    signCondition.address,
                    escrowReward.address
                ]
            )

            const escrowTemplate = await templateStoreManager.getTemplate(templateId)

            const agreementId = constants.bytes32.one

            let sender = accounts[0]
            let receiver = accounts[1]
            let amount = 10

            let {
                message,
                publicKey,
                signature
            } = constants.condition.sign.bytes32

            let hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            let conditionIdLock = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            let hashValuesSign = await signCondition.hashValues(message, publicKey)
            let conditionIdSign = await signCondition.generateId(agreementId, hashValuesSign)

            let hashValuesEscrow = await escrowReward.hashValues(
                amount,
                receiver,
                sender,
                conditionIdLock,
                conditionIdSign)
            let conditionIdEscrow = await escrowReward.generateId(agreementId, hashValuesEscrow)

            const agreement = {
                did: constants.did[0],
                templateId: templateId,
                conditionIds: [
                    conditionIdLock,
                    conditionIdSign,
                    conditionIdEscrow
                ],
                timeLocks: [0, 0, 0],
                timeOuts: [0, 0, 0]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            expect(await agreementStoreManager.exists(agreementId)).to.equal(true)

            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(escrowTemplate.conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
            })

            await oceanToken.mint(sender, amount)

            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, amount)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdLock)).toNumber(),
                constants.condition.state.fulfilled)

            await signCondition.fulfill(agreementId, message, publicKey, signature)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdSign)).toNumber(),
                constants.condition.state.fulfilled)

            await escrowReward.fulfill(
                agreementId,
                amount,
                receiver,
                sender,
                conditionIdLock,
                conditionIdSign)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdEscrow)).toNumber(),
                constants.condition.state.fulfilled
            )

            assert.strictEqual(await getBalance(oceanToken, receiver), amount)
        })

        it('should create escrow agreement and abort after timeout', async () => {
            const {
                oceanToken,
                agreementStoreManager,
                templateStoreManager,
                conditionStoreManager,
                signCondition,
                lockRewardCondition,
                escrowReward
            } = await setupTest()

            // deploy template
            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [
                    lockRewardCondition.address,
                    signCondition.address,
                    escrowReward.address
                ]
            )

            const agreementId = constants.bytes32.one

            let sender = accounts[0]
            let receiver = accounts[1]
            let amount = 10

            let {
                message,
                publicKey,
                signature
            } = constants.condition.sign.bytes32

            let hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            let conditionIdLock = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            let hashValuesSign = await signCondition.hashValues(message, publicKey)
            let conditionIdSign = await signCondition.generateId(agreementId, hashValuesSign)

            let hashValuesEscrow = await escrowReward.hashValues(
                amount,
                receiver,
                sender,
                conditionIdLock,
                conditionIdSign)
            let conditionIdEscrow = await escrowReward.generateId(agreementId, hashValuesEscrow)

            const agreement = {
                did: constants.did[0],
                templateId: templateId,
                conditionIds: [
                    conditionIdLock,
                    conditionIdSign,
                    conditionIdEscrow
                ],
                timeLocks: [0, 0, 0],
                timeOuts: [0, 1, 0]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            await oceanToken.mint(sender, amount)

            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, amount)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdLock)).toNumber(),
                constants.condition.state.fulfilled)

            await signCondition.fulfill(agreementId, message, publicKey, signature)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdSign)).toNumber(),
                constants.condition.state.aborted)

            await escrowReward.fulfill(
                agreementId,
                amount,
                receiver,
                sender,
                conditionIdLock,
                conditionIdSign)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdEscrow)).toNumber(),
                constants.condition.state.fulfilled
            )

            assert.strictEqual(await getBalance(oceanToken, sender), amount)
        })
    })
})
