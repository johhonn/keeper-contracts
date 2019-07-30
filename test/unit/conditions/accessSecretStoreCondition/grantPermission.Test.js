/// * eslint-env mocha */
/// * eslint-disable no-console */
/// * global artifacts, contract, describe, it, expect */
// const chai = require('chai')
// const { assert } = chai
// const chaiAsPromised = require('chai-as-promised')
// chai.use(chaiAsPromised)
//
// const EpochLibrary = artifacts.require('EpochLibrary')
// const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
// const ConditionStoreManager = artifacts.require('ConditionStoreManager')
// const AgreementStoreManager = artifacts.require('AgreementStoreManager')
// const DIDRegistry = artifacts.require('DIDRegistry')
// const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
// const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition')
//
// const constants = require('../../../helpers/constants.js')
// const deployManagers = require('../../../helpers/deployManagers.js')
// const testUtils = require('../../../helpers/utils.js')
// const common = require('./common.js')
//
// contract('AccessSecretStoreCondition constructor', (accounts) => {
//    let didRegistry,
//        agreementStoreManager,
//        conditionStoreManager,
//        templateStoreManager,
//        accessSecretStoreCondition
//
//    describe('fulfill non existing condition', () => {
//        it('should not fulfill if condition does not exist', async () => {
//            await common.setupTest()
//
//            const agreementId = constants.bytes32.one
//            const documentId = constants.bytes32.one
//            const grantee = accounts[1]
//
//            await assert.isRejected(
//                accessSecretStoreCondition.fulfill(agreementId, documentId, grantee),
//                'Invalid DID owner/provider'
//            )
//        })
//    })
//
//    describe('fulfill existing condition', () => {
//        it('should fulfill if condition exist', async () => {
//            const { did } = await setupTest({ registerDID: true })
//
//            const agreementId = constants.bytes32.one
//            const documentId = did
//            const grantee = accounts[1]
//
//            const templateId = accounts[2]
//            await templateStoreManager.proposeTemplate(templateId)
//            await templateStoreManager.approveTemplate(templateId)
//
//            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
//            let conditionId = await accessSecretStoreCondition.generateId(agreementId, hashValues)
//
//            const agreement = {
//                did: constants.did[0],
//                conditionTypes: [accessSecretStoreCondition.address],
//                conditionIds: [conditionId],
//                timeLocks: [0],
//                timeOuts: [2]
//            }
//
//            await agreementStoreManager.createAgreement(
//                agreementId,
//                ...Object.values(agreement),
//                { from: templateId }
//            )
//
//            const result = await accessSecretStoreCondition.fulfill(agreementId, documentId, grantee)
//
//            assert.strictEqual(
//                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
//                constants.condition.state.fulfilled)
//
//            testUtils.assertEmitted(result, 1, 'Fulfilled')
//            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
//            expect(eventArgs._agreementId).to.equal(agreementId)
//            expect(eventArgs._conditionId).to.equal(conditionId)
//            expect(eventArgs._documentId).to.equal(documentId)
//            expect(eventArgs._grantee).to.equal(grantee)
//        })
//    })
//
//    describe('fail to fulfill existing condition', () => {
//        it('wrong did owner should fail to fulfill if conditions exist', async () => {
//            const { did } = await setupTest({ registerDID: true })
//
//            const agreementId = constants.bytes32.one
//            const documentId = did
//            const grantee = accounts[1]
//
//            const templateId = accounts[2]
//            await templateStoreManager.proposeTemplate(templateId)
//            await templateStoreManager.approveTemplate(templateId)
//
//            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
//            let conditionId = await accessSecretStoreCondition.generateId(agreementId, hashValues)
//
//            const agreement = {
//                did: constants.did[0],
//                conditionTypes: [accessSecretStoreCondition.address],
//                conditionIds: [conditionId],
//                timeLocks: [0],
//                timeOuts: [2]
//            }
//
//            await agreementStoreManager.createAgreement(
//                agreementId,
//                ...Object.values(agreement),
//                { from: templateId }
//            )
//
//            await assert.isRejected(
//                accessSecretStoreCondition.fulfill(agreementId, documentId, grantee, { from: accounts[1] }),
//                'Invalid DID owner/provider'
//            )
//        })
//
//        it('right did owner should fail to fulfill if conditions already fulfilled', async () => {
//            const { did } = await setupTest({ registerDID: true })
//
//            const agreementId = constants.bytes32.one
//            const documentId = did
//            const grantee = accounts[1]
//
//            const templateId = accounts[2]
//            await templateStoreManager.proposeTemplate(templateId)
//            await templateStoreManager.approveTemplate(templateId)
//
//            let hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
//            let conditionId = await accessSecretStoreCondition.generateId(agreementId, hashValues)
//
//            const agreement = {
//                did: constants.did[0],
//                conditionTypes: [accessSecretStoreCondition.address],
//                conditionIds: [conditionId],
//                timeLocks: [0],
//                timeOuts: [2]
//            }
//
//            await agreementStoreManager.createAgreement(
//                agreementId,
//                ...Object.values(agreement),
//                { from: templateId }
//            )
//
//            await accessSecretStoreCondition.fulfill(agreementId, documentId, grantee)
//
//            await assert.isRejected(
//                accessSecretStoreCondition.fulfill(agreementId, documentId, grantee),
//                constants.condition.state.error.invalidStateTransition
//            )
//        })
//    })
// })
