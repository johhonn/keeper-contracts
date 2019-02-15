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
const LockRewardCondition = artifacts.require('LockRewardCondition')
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition')
const EscrowReward = artifacts.require('EscrowReward')
const EscrowAccessSecretStoreTemplate = artifacts.require('EscrowAccessSecretStoreTemplate')

const constants = require('../../helpers/constants.js')
const getBalance = require('../../helpers/getBalance.js')

contract('Escrow Access Secret Store integration test', (accounts) => {
    async function setupTest({
        agreementId = constants.bytes32.one,
        conditionIds = [constants.address.dummy],
        deployer = accounts[8],
        owner = accounts[9]
    } = {}) {
        const epochLibrary = await EpochLibrary.new({ from: deployer })

        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new({ from: deployer })

        const templateStoreManager = await TemplateStoreManager.new({ from: deployer })
        await templateStoreManager.initialize(
            owner,
            { from: deployer }
        )

        const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: deployer })
        await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
        const agreementStoreManager = await AgreementStoreManager.new({ from: deployer })
        await agreementStoreManager.initialize(
            owner,
            conditionStoreManager.address,
            templateStoreManager.address,
            { from: deployer }
        )

        await conditionStoreManager.initialize(
            owner,
            agreementStoreManager.address,
            { from: deployer }
        )

        const oceanToken = await OceanToken.new({ from: deployer })
        await oceanToken.initialize(owner, owner)

        const lockRewardCondition = await LockRewardCondition.new({ from: deployer })
        await lockRewardCondition.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: deployer }
        )

        const accessSecretStoreCondition = await AccessSecretStoreCondition.new({ from: deployer })

        await accessSecretStoreCondition.initialize(
            owner,
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: deployer }
        )

        const escrowReward = await EscrowReward.new({ from: deployer })
        await escrowReward.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: deployer }
        )

        const escrowAccessSecretStoreTemplate = await EscrowAccessSecretStoreTemplate.new({ from: deployer })
        await escrowAccessSecretStoreTemplate.initialize(
            owner,
            agreementStoreManager.address,
            accessSecretStoreCondition.address,
            lockRewardCondition.address,
            escrowReward.address,
            { from: deployer }
        )

        return {
            oceanToken,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            lockRewardCondition,
            accessSecretStoreCondition,
            escrowReward,
            escrowAccessSecretStoreTemplate,
            agreementId,
            conditionIds,
            owner
        }
    }

    describe('create and fulfill escrow agreement', () => {
        it('should create escrow agreement and fulfill', async () => {
            const {
                oceanToken,
                agreementStoreManager,
                templateStoreManager,
                conditionStoreManager,
                accessSecretStoreCondition,
                lockRewardCondition,
                escrowReward,
                escrowAccessSecretStoreTemplate,
                owner
            } = await setupTest()

            // propose and approve template
            const templateId = escrowAccessSecretStoreTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            // generate IDs from attributes
            const agreementId = constants.bytes32.one

            const sender = accounts[0]
            const receiver = accounts[1]
            const amount = 10
            const documentId = constants.did[0]
            const grantee = accounts[1]

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            const conditionIdLock = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            const hashValuesAccess = await accessSecretStoreCondition.hashValues(documentId, grantee)
            const conditionIdAccess = await accessSecretStoreCondition.generateId(agreementId, hashValuesAccess)

            const hashValuesEscrow = await escrowReward.hashValues(
                amount,
                receiver,
                sender,
                conditionIdLock,
                conditionIdAccess)
            const conditionIdEscrow = await escrowReward.generateId(agreementId, hashValuesEscrow)

            // construct agreement
            const agreement = {
                did: constants.did[0],
                didOwner: accounts[0],
                conditionIds: [
                    conditionIdAccess,
                    conditionIdLock,
                    conditionIdEscrow
                ],
                timeLocks: [0, 0, 0],
                timeOuts: [0, 0, 0],
                consumer: accounts[1]
            }

            await escrowAccessSecretStoreTemplate.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            // check state of agreement and conditions
            expect((await agreementStoreManager.getAgreement(agreementId)).did)
                .to.equal(constants.did[0])

            const conditionTypes = await escrowAccessSecretStoreTemplate.getConditionTypes()
            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
            })

            // fulfill lock reward
            await oceanToken.mint(sender, amount, { from: owner })

            assert.strictEqual(await getBalance(oceanToken, sender), amount)
            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), 0)

            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, amount)

            assert.strictEqual(await getBalance(oceanToken, sender), 0)
            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), amount)
            assert.strictEqual(await getBalance(oceanToken, receiver), 0)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdLock)).toNumber(),
                constants.condition.state.fulfilled)

            // fulfill access
            await accessSecretStoreCondition.fulfill(agreementId, documentId, grantee)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdAccess)).toNumber(),
                constants.condition.state.fulfilled)

            // get reward
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

            assert.strictEqual(await getBalance(oceanToken, sender), 0)
            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), amount)
        })

        it('should create escrow agreement and abort after timeout', async () => {
            const {
                oceanToken,
                templateStoreManager,
                conditionStoreManager,
                accessSecretStoreCondition,
                lockRewardCondition,
                escrowReward,
                escrowAccessSecretStoreTemplate,
                owner
            } = await setupTest()

            // propose and approve template
            const templateId = escrowAccessSecretStoreTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            // generate IDs from attributes
            const agreementId = constants.bytes32.one

            const sender = accounts[0]
            const receiver = accounts[1]
            const amount = 10
            const documentId = constants.did[0]
            const grantee = accounts[1]

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            const conditionIdLock = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            const hashValuesAccess = await accessSecretStoreCondition.hashValues(documentId, grantee)
            const conditionIdAccess = await accessSecretStoreCondition.generateId(agreementId, hashValuesAccess)

            const hashValuesEscrow = await escrowReward.hashValues(
                amount,
                receiver,
                sender,
                conditionIdLock,
                conditionIdAccess)
            const conditionIdEscrow = await escrowReward.generateId(agreementId, hashValuesEscrow)

            // create agreement with timeout on access
            const timeOutAccess = 1
            const agreement = {
                did: constants.did[0],
                didOwner: accounts[0],
                conditionIds: [
                    conditionIdAccess,
                    conditionIdLock,
                    conditionIdEscrow
                ],
                timeLocks: [0, 0, 0],
                timeOuts: [timeOutAccess, 0, 0],
                consumer: accounts[1]
            }

            await escrowAccessSecretStoreTemplate.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            await oceanToken.mint(sender, amount, { from: owner })

            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, amount)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdLock)).toNumber(),
                constants.condition.state.fulfilled)

            await accessSecretStoreCondition.fulfill(agreementId, documentId, grantee)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdAccess)).toNumber(),
                constants.condition.state.aborted)

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

            assert.strictEqual(await getBalance(oceanToken, sender), amount)
        })
    })

    describe('create and fulfill escrow agreement with access secret store and timeLock', () => {
        it('should create escrow agreement and fulfill', async () => {
            const {
                oceanToken,
                templateStoreManager,
                conditionStoreManager,
                accessSecretStoreCondition,
                lockRewardCondition,
                escrowReward,
                escrowAccessSecretStoreTemplate,
                owner
            } = await setupTest()

            // propose and approve template
            const templateId = escrowAccessSecretStoreTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            // generate IDs from attributes
            const agreementId = constants.bytes32.one

            const sender = accounts[0]
            const receiver = accounts[1]
            const amount = 10
            const documentId = constants.did[0]
            const grantee = accounts[1]

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            const conditionIdLock = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            const hashValuesAccess = await accessSecretStoreCondition.hashValues(documentId, grantee)
            const conditionIdAccess = await accessSecretStoreCondition.generateId(agreementId, hashValuesAccess)

            const hashValuesEscrow = await escrowReward.hashValues(
                amount,
                receiver,
                sender,
                conditionIdLock,
                conditionIdAccess)
            const conditionIdEscrow = await escrowReward.generateId(agreementId, hashValuesEscrow)

            // create agreement with time lock on access
            const timeLockAccess = 6
            const agreement = {
                did: constants.did[0],
                didOwner: accounts[0],
                conditionIds: [
                    conditionIdAccess,
                    conditionIdLock,
                    conditionIdEscrow
                ],
                timeLocks: [timeLockAccess, 0, 0],
                timeOuts: [0, 0, 0],
                consumer: accounts[1]
            }

            await escrowAccessSecretStoreTemplate.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            await oceanToken.mint(sender, amount, { from: owner })

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
