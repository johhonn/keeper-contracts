/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const deployManagers = require('../../helpers/deployManagers.js')
const EpochLibrary = artifacts.require('EpochLibrary')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const DIDRegistry = artifacts.require('DIDRegistry')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const ServiceExecutorCondition = artifacts.require('ServiceExecutorCondition')
const constants = require('../../helpers/constants.js')
const testUtils = require('../../helpers/utils.js')

contract('ServiceExecutorCondition constructor', (accounts) => {
    let didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager

    async function setupTest({
        accounts = [],
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        did = constants.did[0],
        checksum = testUtils.generateId(),
        value = constants.registry.url,
        deployer = accounts[8],
        owner = accounts[0],
        registerDID = false,
        DIDProvider = accounts[9]
    } = {}) {
        ({
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager
        } = await deployManagers(
            deployer,
            owner
        ))

        const serviceExecutorCondition = await ServiceExecutorCondition.new()

        await serviceExecutorCondition.methods['initialize(address,address,address)'](
            accounts[0],
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: accounts[0] }
        )

        if (registerDID) {
            await didRegistry.registerAttribute(did, checksum, [DIDProvider], value)
        }

        return {
            did,
            conditionId,
            conditionType,
            owner,
            DIDProvider,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            serviceExecutorCondition
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
            const didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            const didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(accounts[0])
            const serviceExecutorCondition = await ServiceExecutorCondition.new()

            await serviceExecutorCondition.methods['initialize(address,address,address)'](
                accounts[0],
                conditionStoreManager.address,
                agreementStoreManager.address,
                { from: accounts[0] }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if condition does not exist', async () => {
            const {
                serviceExecutorCondition
            } = await setupTest({ accounts: accounts })

            const agreementId = constants.bytes32.one
            const did = constants.bytes32.one
            const serviceConsumer = accounts[1]

            await assert.isRejected(
                serviceExecutorCondition.fulfill(agreementId, did, serviceConsumer),
                'Invalid DID owner/provider'
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if condition exist', async () => {
            const {
                did,
                agreementStoreManager,
                conditionStoreManager,
                templateStoreManager,
                serviceExecutorCondition

            } = await setupTest({ accounts: accounts, registerDID: true })

            const agreementId = constants.bytes32.one
            const serviceConsumer = accounts[1]

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await serviceExecutorCondition.hashValues(did, serviceConsumer)
            const conditionId = await serviceExecutorCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [serviceExecutorCondition.address],
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            const result = await serviceExecutorCondition.fulfill(agreementId, did, serviceConsumer)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._conditionId).to.equal(conditionId)
            expect(eventArgs._did).to.equal(did)
            expect(eventArgs._serviceConsumer).to.equal(serviceConsumer)
        })
    })

    describe('fail to fulfill existing condition', () => {
        it('wrong did owner should fail to fulfill if conditions exist', async () => {
            const {
                did,
                agreementStoreManager,
                templateStoreManager,
                serviceExecutorCondition

            } = await setupTest({ accounts: accounts, registerDID: true })

            const agreementId = constants.bytes32.one
            const serviceConsumer = accounts[1]

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await serviceExecutorCondition.hashValues(did, serviceConsumer)
            const conditionId = await serviceExecutorCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [serviceExecutorCondition.address],
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            await assert.isRejected(
                serviceExecutorCondition.fulfill(agreementId, did, serviceConsumer, { from: accounts[1] }),
                'Invalid DID owner/provider'
            )
        })

        it('right did owner should fail to fulfill if conditions already fulfilled', async () => {
            const {
                did,
                agreementStoreManager,
                templateStoreManager,
                serviceExecutorCondition

            } = await setupTest({ accounts: accounts, registerDID: true })

            const agreementId = constants.bytes32.one
            const serviceConsumer = accounts[1]

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await serviceExecutorCondition.hashValues(did, serviceConsumer)
            const conditionId = await serviceExecutorCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [serviceExecutorCondition.address],
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            await serviceExecutorCondition.fulfill(agreementId, did, serviceConsumer)

            await assert.isRejected(
                serviceExecutorCondition.fulfill(agreementId, did, serviceConsumer),
                constants.condition.state.error.invalidStateTransition
            )
        })
    })
    describe('wasServiceTriggered', () => {
        it('should return true if service was triggered', async () => {
            const {
                did,
                agreementStoreManager,
                templateStoreManager,
                serviceExecutorCondition

            } = await setupTest({ accounts: accounts, registerDID: true })

            const agreementId = constants.bytes32.one
            const serviceConsumer = accounts[1]
            const timeLock = 0
            const timeOut = 234898098

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await serviceExecutorCondition.hashValues(did, serviceConsumer)
            const conditionId = await serviceExecutorCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [serviceExecutorCondition.address],
                conditionIds: [conditionId],
                timeLocks: [timeLock],
                timeOuts: [timeOut]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            await serviceExecutorCondition.fulfill(agreementId, did, serviceConsumer)

            assert.strictEqual(
                await serviceExecutorCondition.wasServiceTriggered(
                    did,
                    serviceConsumer
                ),
                true
            )
        })
        it('successful return false if service was not triggered', async () => {
            const {
                did,
                serviceExecutorCondition

            } = await setupTest({ accounts: accounts, registerDID: true })

            const serviceConsumer = accounts[1]

            expect(await serviceExecutorCondition.wasServiceTriggered(did, serviceConsumer))
                .to.equal(false)
        })
    })
})
