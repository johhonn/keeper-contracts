/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const OceanToken = artifacts.require('OceanToken')
const HashLockCondition = artifacts.require('HashLockCondition')
const SignCondition = artifacts.require('SignCondition')
const LockRewardCondition = artifacts.require('LockRewardCondition')
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition')
const EscrowReward = artifacts.require('EscrowReward')

const constants = require('../../helpers/constants.js')
const getBalance = require('../../helpers/getBalance.js')

contract('Escrow Agreement integration test', (accounts) => {
    async function setupTest({
        agreementId = constants.bytes32.one,
        conditionIds = [constants.address.dummy],
        createRole = accounts[0],
        setupConditionStoreManager = true
    } = {}) {
        const epochLibrary = await EpochLibrary.new()

        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new()

        const templateStoreManager = await TemplateStoreManager.new()

        const agreementStoreLibrary = await AgreementStoreLibrary.new()
        await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
        const agreementStoreManager = await AgreementStoreManager.new()
        await agreementStoreManager.initialize(
            conditionStoreManager.address,
            templateStoreManager.address,
            { from: createRole }
        )

        if (setupConditionStoreManager) {
            await conditionStoreManager.initialize(
                agreementStoreManager.address,
                { from: accounts[0] }
            )
        }

        const oceanToken = await OceanToken.new()
        await oceanToken.initialize(createRole, createRole)

        const hashLockCondition = await HashLockCondition.new()
        await hashLockCondition.initialize(
            conditionStoreManager.address,
            { from: createRole }
        )

        const signCondition = await SignCondition.new()
        await signCondition.initialize(
            conditionStoreManager.address,
            { from: createRole }
        )

        const lockRewardCondition = await LockRewardCondition.new()
        await lockRewardCondition.initialize(
            conditionStoreManager.address,
            oceanToken.address,
            { from: createRole }
        )

        const accessSecretStoreCondition = await AccessSecretStoreCondition.new()

        await accessSecretStoreCondition.initialize(
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: createRole }
        )

        const escrowReward = await EscrowReward.new()
        await escrowReward.initialize(
            conditionStoreManager.address,
            oceanToken.address,
            { from: createRole }
        )

        return {
            oceanToken,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            hashLockCondition,
            signCondition,
            lockRewardCondition,
            accessSecretStoreCondition,
            escrowReward,
            agreementId,
            conditionIds,
            createRole
        }
    }

    describe('create and fulfill escrow agreement with sign', () => {
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
                didOwner: accounts[0],
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

            expect((await agreementStoreManager.getAgreement(agreementId)).did)
                .to.equal(constants.did[0])

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
                didOwner: accounts[0],
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

    describe('create and fulfill escrow agreement with access secret store and timeLock', () => {
        it('should create escrow agreement and fulfill', async () => {
            const {
                oceanToken,
                agreementStoreManager,
                templateStoreManager,
                conditionStoreManager,
                accessSecretStoreCondition,
                lockRewardCondition,
                escrowReward
            } = await setupTest()

            // deploy template
            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [
                    lockRewardCondition.address,
                    accessSecretStoreCondition.address,
                    escrowReward.address
                ]
            )
            await templateStoreManager.getTemplate(templateId)

            const agreementId = constants.bytes32.one

            const sender = accounts[0]
            const receiver = accounts[1]
            const amount = 10

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            const conditionIdLock = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            const documentId = constants.did[0]
            const grantee = accounts[1]

            const hashValuesAccess = await accessSecretStoreCondition.hashValues(documentId, grantee)
            const conditionIdAccess = await accessSecretStoreCondition.generateId(agreementId, hashValuesAccess)

            const hashValuesEscrow = await escrowReward.hashValues(
                amount,
                receiver,
                sender,
                conditionIdLock,
                conditionIdAccess)
            const conditionIdEscrow = await escrowReward.generateId(agreementId, hashValuesEscrow)

            const agreement = {
                did: constants.did[0],
                didOwner: accounts[0],
                templateId: templateId,
                conditionIds: [
                    conditionIdLock,
                    conditionIdAccess,
                    conditionIdEscrow
                ],
                timeLocks: [0, 6, 0],
                timeOuts: [0, 0, 0]
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

            await assert.isRejected(
                accessSecretStoreCondition.fulfill(agreementId, documentId, grantee),
                constants.condition.epoch.error.isTimeLocked
            )

            await assert.isRejected(
                accessSecretStoreCondition.fulfill(agreementId, documentId, grantee,
                    { from: accounts[1] }),
                constants.acl.error.invalidUpdateRole
            )

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(false)

            await accessSecretStoreCondition.fulfill(agreementId, documentId, grantee)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdAccess)).toNumber(),
                constants.condition.state.fulfilled)

            await escrowReward.fulfill(
                agreementId,
                amount,
                receiver,
                sender,
                conditionIdLock,
                conditionIdAccess)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdEscrow)).toNumber(),
                constants.condition.state.fulfilled
            )

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(true)

            assert.strictEqual(await getBalance(oceanToken, receiver), amount)
        })
    })
})
