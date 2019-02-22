/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const EpochLibrary = artifacts.require('EpochLibrary')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition')

const constants = require('../../helpers/constants.js')
const testUtils = require('../../helpers/utils.js')

contract('AccessSecretStoreCondition constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        did = constants.did[0],
        checksum = testUtils.generateId(),
        value = constants.registry.url,
        owner = accounts[0],
        registerDID = false
    } = {}) {
        const didRegistryLibrary = await DIDRegistryLibrary.new()
        await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
        const didRegistry = await DIDRegistry.new()
        await didRegistry.initialize(owner)

        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new()

        const templateStoreManager = await TemplateStoreManager.new()
        await templateStoreManager.initialize(
            owner,
            { from: owner }
        )

        const agreementStoreLibrary = await AgreementStoreLibrary.new()
        await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
        const agreementStoreManager = await AgreementStoreManager.new()

        await agreementStoreManager.methods['initialize(address,address,address,address)'](
            owner,
            conditionStoreManager.address,
            templateStoreManager.address,
            didRegistry.address,
            { from: owner }
        )

        await conditionStoreManager.initialize(
            owner,
            { from: owner }
        )

        await conditionStoreManager.delegateCreateRole(
            agreementStoreManager.address,
            { from: owner }
        )

        const accessSecretStoreCondition = await AccessSecretStoreCondition.new()
        await accessSecretStoreCondition.initialize(
            owner,
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: owner }
        )

        if (registerDID) {
            await didRegistry.registerAttribute(did, checksum, value)
        }

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
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new()
            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new()

            const accessSecretStoreCondition = await AccessSecretStoreCondition.new()

            await accessSecretStoreCondition.initialize(
                accounts[0],
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
            } = await setupTest({ registerDID: true })

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
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
            } = await setupTest({ registerDID: true })

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            await assert.isRejected(
                accessSecretStoreCondition.fulfill(nonce, documentId, grantee, { from: accounts[1] }),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('right did owner should fail to fulfill if conditions already fulfilled', async () => {
            const {
                accessSecretStoreCondition,
                agreementStoreManager,
                templateStoreManager
            } = await setupTest({ registerDID: true })

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            await accessSecretStoreCondition.fulfill(nonce, documentId, grantee)

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
            } = await setupTest({ registerDID: true })

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]
            const timeLock = 10000210
            const timeOut = 234898098

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
                conditionIds: [conditionId],
                timeLocks: [timeLock],
                timeOuts: [timeOut]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
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
        it('successful create should check permissions', async () => {
            const {
                accessSecretStoreCondition,
                agreementStoreManager,
                templateStoreManager
            } = await setupTest({ registerDID: true })

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]
            const timeLock = 0
            const timeOut = 234898098

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
                conditionIds: [conditionId],
                timeLocks: [timeLock],
                timeOuts: [timeOut]
            }
            const agreementId = constants.bytes32.one

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(false)

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(false)

            await accessSecretStoreCondition.fulfill(nonce, documentId, grantee)

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(true)
        })
    })
})
