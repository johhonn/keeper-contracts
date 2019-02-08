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
const TemplateStoreManager = artifacts.require('TemplateStoreManager.sol')
const AgreementStoreManager = artifacts.require('AgreementStoreManager.sol')
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition.sol')
const constants = require('../../helpers/constants.js')

contract('AccessSecretStoreCondition constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        setupConditionStoreManager = true
    } = {}) {
        const epochLibrary = await EpochLibrary.new({ from: accounts[0] })
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

        const conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
        const templateStoreManager = await TemplateStoreManager.new({ from: createRole })
        const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: createRole })
        await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
        const agreementStoreManager = await AgreementStoreManager.new(
            conditionStoreManager.address,
            templateStoreManager.address,
            { from: createRole }
        )

        if (setupConditionStoreManager) {
            await conditionStoreManager.setup(a)
        }

        const accessSecretStoreCondition = await AccessSecretStoreCondition.new(
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: accounts[0] })

        return {
            accessSecretStoreCondition,
            conditionStoreManager,
            agreementStoreManager,
            templateStoreManager,
            conditionId,
            conditionType,
            createRole
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

            await AccessSecretStoreCondition.new(
                conditionStoreManager.address,
                agreementStoreManager.address,
                { from: accounts[0] }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if condition does not exist', async () => {
            const { accessSecretStoreCondition } = await setupTest({ setupConditionStoreManager: false })

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
            const { accessSecretStoreCondition, agreementStoreManager, templateStoreManager, conditionStoreManager } = await setupTest()

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]

            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [accessSecretStoreCondition.address]
            )

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                templateId: templateId,
                conditionIds: [nonce],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            await accessSecretStoreCondition.fulfill(nonce, documentId, grantee)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)
        })
    })

    describe('fail to fulfill existing condition', () => {
        it('wrong accessSecretStoreature should fail to fulfill if conditions exist for bytes32 message', async () => {
            const { accessSecretStoreCondition, conditionStoreManager } = await setupTest()

            const nonce = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]

            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                accessSecretStoreCondition.address)

            await accessSecretStoreCondition.fulfill(nonce, documentId, grantee)


            await assert.isRejected(
                accessSecretStoreCondition.fulfill(
                    nonce, message, publicKey,
                    constants.bytes32.one
                ),
                constants.condition.accessSecretStore.error.couldNotRecoverAccessSecretStoreature
            )
        })

        it('right accessSecretStoreature should fail to fulfill if conditions already fulfilled for bytes32', async () => {
            const { accessSecretStoreCondition, conditionStoreManager } = await setupTest()

            let nonce = constants.bytes32.one
            let {
                message,
                publicKey,
                accessSecretStoreature
            } = constants.condition.accessSecretStore.bytes32

            let hashValues = await accessSecretStoreCondition.hashValues(message, publicKey)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                accessSecretStoreCondition.address)

            // fulfill once
            await accessSecretStoreCondition.fulfill(nonce, message, publicKey, accessSecretStoreature)
            // try to fulfill another time
            await assert.isRejected(
                accessSecretStoreCondition.fulfill(nonce, message, publicKey, accessSecretStoreature),
                constants.condition.state.error.conditionNeedsToBeUnfulfilled
            )
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            const { accessSecretStoreCondition, conditionStoreManager } = await setupTest()

            let nonce = constants.bytes32.one
            let {
                message,
                publicKey,
                accessSecretStoreature
            } = constants.condition.accessSecretStore.bytes32

            let hashValues = await accessSecretStoreCondition.hashValues(message, publicKey)
            let conditionId = await accessSecretStoreCondition.generateId(nonce, hashValues)

            // create a condition of a type different than accessSecretStore condition
            await conditionStoreManager.createCondition(
                conditionId,
                accounts[0])

            // try to fulfill from accessSecretStore condition
            await assert.isRejected(
                accessSecretStoreCondition.fulfill(nonce, message, publicKey, accessSecretStoreature),
                constants.acl.error.invalidUpdateRole
            )
        })
    })
})
