/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary.sol')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const TemplateStoreManager = artifacts.require('TemplateStoreManager.sol')
const AgreementStoreManager = artifacts.require('AgreementStoreManager.sol')
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition.sol')
const constants = require('../../helpers/constants.js')

contract('AccessSecretStoreCondition constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        owner = accounts[0]
    } = {}) {
        const epochLibrary = await EpochLibrary.new({ from: owner })
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

        const conditionStoreManager = await ConditionStoreManager.new({ from: owner })
        const templateStoreManager = await TemplateStoreManager.new({ from: owner })

        const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: owner })
        await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
        const agreementStoreManager = await AgreementStoreManager.new()

        await agreementStoreManager.initialize(
            conditionStoreManager.address,
            templateStoreManager.address,
            { from: owner }
        )

        await conditionStoreManager.initialize(
            owner,
            agreementStoreManager.address,
            { from: owner }
        )

        const accessSecretStoreCondition = await AccessSecretStoreCondition.new({ from: owner })
        await accessSecretStoreCondition.initialize(
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: owner }
        )

        return {
            accessSecretStoreCondition,
            conditionStoreManager,
            agreementStoreManager,
            templateStoreManager,
            conditionId,
            conditionType,
            owner
        }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new({ from: accounts[0] })
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            const templateStoreManager = await TemplateStoreManager.new({ from: accounts[0] })
            const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: accounts[0] })
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new(
                conditionStoreManager.address,
                templateStoreManager.address,
                { from: accounts[0] }
            )

            const accessSecretStoreCondition = await AccessSecretStoreCondition.new({ from: accounts[0] })

            await accessSecretStoreCondition.initialize(
                conditionStoreManager.address,
                agreementStoreManager.address,
                { from: accounts[0] }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if condition does not exist', async () => {
            const { accessSecretStoreCondition } = await setupTest()

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]

            await assert.isRejected(
                accessSecretStoreCondition.fulfill(nonce, documentId, grantee),
                constants.acl.error.invalidUpdateRole
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if condition exist', async () => {
            const {
                accessSecretStoreCondition,
                agreementStoreManager,
                templateStoreManager,
                conditionStoreManager
            } = await setupTest()

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]

            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [accessSecretStoreCondition.address]
            )

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            const agreement = {
                did: constants.did[0],
                didOwner: accounts[0],
                templateId: templateId,
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            await accessSecretStoreCondition.fulfill(nonce, documentId, grantee)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)
        })
    })

    describe('fail to fulfill existing condition', () => {
        it('wrong did owner should fail to fulfill if conditions exist', async () => {
            const {
                accessSecretStoreCondition,
                agreementStoreManager,
                templateStoreManager
            } = await setupTest()

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]

            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [accessSecretStoreCondition.address]
            )

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            const agreement = {
                did: constants.did[0],
                didOwner: accounts[1],
                templateId: templateId,
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            await assert.isRejected(
                accessSecretStoreCondition.fulfill(nonce, documentId, grantee),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('right didOwner should fail to fulfill if conditions already fulfilled', async () => {
            const {
                accessSecretStoreCondition,
                agreementStoreManager,
                templateStoreManager
            } = await setupTest()

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]

            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [accessSecretStoreCondition.address]
            )

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            const agreement = {
                did: constants.did[0],
                didOwner: accounts[0],
                templateId: templateId,
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            accessSecretStoreCondition.fulfill(nonce, documentId, grantee)

            await assert.isRejected(
                accessSecretStoreCondition.fulfill(nonce, documentId, grantee),
                constants.condition.state.error.invalidStateTransition
            )
        })
    })

    describe('get access secret store condition', () => {
        it('successful create should get condition and permissions', async () => {
            const {
                accessSecretStoreCondition,
                agreementStoreManager,
                templateStoreManager,
                conditionStoreManager
            } = await setupTest()

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]
            const timeLock = 10000210
            const timeOut = 234898098

            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [accessSecretStoreCondition.address]
            )

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            const agreement = {
                did: constants.did[0],
                didOwner: accounts[0],
                templateId: templateId,
                conditionIds: [conditionId],
                timeLocks: [timeLock],
                timeOuts: [timeOut]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            const storedCondition = await conditionStoreManager.getCondition(conditionId)
            // TODO - containSubset
            expect(storedCondition.typeRef)
                .to.equal(accessSecretStoreCondition.address)
            expect(storedCondition.timeLock.toNumber())
                .to.equal(timeLock)
            expect(storedCondition.timeOut.toNumber())
                .to.equal(timeOut)
        })
    })
    describe('check permissions', () => {
        it('successful create should get condition and permissions', async () => {
            const {
                accessSecretStoreCondition,
                agreementStoreManager,
                templateStoreManager
            } = await setupTest()

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]
            const timeLock = 0
            const timeOut = 234898098

            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [accessSecretStoreCondition.address]
            )

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            const agreement = {
                did: constants.did[0],
                didOwner: accounts[0],
                templateId: templateId,
                conditionIds: [conditionId],
                timeLocks: [timeLock],
                timeOuts: [timeOut]
            }
            const agreementId = constants.bytes32.one

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(false)

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(false)

            await accessSecretStoreCondition.fulfill(nonce, documentId, grantee)

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(true)
        })
    })
})
