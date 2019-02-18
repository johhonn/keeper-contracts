/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const EpochLibrary = artifacts.require('EpochLibrary')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')

const constants = require('../../helpers/constants.js')

contract('AgreementStoreManager', (accounts) => {
    async function setupTest({
        agreementId = constants.bytes32.one,
        conditionIds = [constants.address.dummy],
        createRole = accounts[0],
        owner = accounts[1]
    } = {}) {
        const common = await Common.new()
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

        await agreementStoreManager.initialize(
            owner,
            conditionStoreManager.address,
            templateStoreManager.address,
            { from: owner }
        )

        await conditionStoreManager.initialize(
            owner,
            agreementStoreManager.address,
            { from: owner }
        )

        return {
            common,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            agreementId,
            conditionIds,
            createRole,
            owner
        }
    }

    describe('deploy and setup', () => {
        it('contract should deploy and initialize', async () => {
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            await AgreementStoreManager.new()
        })

        it('contract should not initialize with zero owner', async () => {
            const createRole = accounts[0]
            const owner = constants.address.zero

            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new()
            const templateStoreManager = await TemplateStoreManager.new()
            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new()

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.initialize(
                    owner,
                    conditionStoreManager.address,
                    templateStoreManager.address,
                    { from: createRole }
                ),
                constants.address.error.invalidAddress0x0
            )
        })

        it('contract should not initialize with zero conditionStoreManager address', async () => {
            const createRole = accounts[0]
            const owner = constants.address.zero

            const templateStoreManager = await TemplateStoreManager.new()
            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new()

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.initialize(
                    owner,
                    templateStoreManager.address,
                    createRole,
                    { from: createRole }
                ),
                constants.address.error.invalidAddress0x0
            )
        })

        it('contract should not initialize with zero templateStoreManager address', async () => {
            const createRole = accounts[0]
            const owner = constants.address.zero

            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new()
            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new()

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.initialize(
                    owner,
                    conditionStoreManager.address,
                    createRole,
                    { from: createRole }
                ),
                constants.address.error.invalidAddress0x0
            )
        })

        it('contract should not initialize without arguments', async () => {
            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new()

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.initialize(),
                constants.initialize.error.invalidNumberParamsGot0Expected3
            )
        })
    })

    describe('create agreement', () => {
        it('create agreement should have existing agreement and conditions created', async () => {
            const {
                agreementStoreManager,
                templateStoreManager,
                conditionStoreManager,
                owner
            } = await setupTest()

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                conditionTypes: [accounts[2], accounts[3]],
                conditionIds: [constants.bytes32.zero, constants.bytes32.one],
                timeLocks: [0, 1],
                timeOuts: [2, 3]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(agreement.conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
                expect(storedCondition.timeLock.toNumber()).to.equal(agreement.timeLocks[i])
                expect(storedCondition.timeOut.toNumber()).to.equal(agreement.timeOuts[i])
            })

            expect((await agreementStoreManager.getAgreementListSize()).toNumber()).to.equal(1)
        })

        it('should not create agreement with existing conditions', async () => {
            const { agreementStoreManager, templateStoreManager, owner } = await setupTest()

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            const conditionTypes = [accounts[2], accounts[3]]
            const conditionIds = [constants.bytes32.zero, constants.bytes32.one]
            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                conditionTypes,
                conditionIds,
                timeLocks: [0, 1],
                timeOuts: [2, 3]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            const otherAgreement = {
                did: constants.did[1],
                didOwner: accounts[1],
                conditionTypes,
                conditionIds,
                timeLocks: [3, 4],
                timeOuts: [100, 110]
            }
            const otherAgreementId = constants.bytes32.one

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    otherAgreementId,
                    ...Object.values(otherAgreement),
                    { from: templateId }
                ),
                constants.error.idAlreadyExists
            )
        })

        it('should not create agreement with uninitialized template', async () => {
            const { agreementStoreManager } = await setupTest()

            const templateId = accounts[2]

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                conditionTypes: [accounts[3]],
                conditionIds: [constants.bytes32.zero],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.zero

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(agreement),
                    { from: templateId }
                ),
                constants.template.error.templateNotApproved
            )
        })

        it('should not create agreement with proposed template', async () => {
            const { agreementStoreManager, templateStoreManager } = await setupTest()

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                conditionTypes: [accounts[3]],
                conditionIds: [constants.bytes32.zero],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.zero

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(agreement),
                    { from: templateId }
                ),
                constants.template.error.templateNotApproved
            )
        })

        it('should not create agreement with revoked template', async () => {
            const { agreementStoreManager, templateStoreManager, owner } = await setupTest()

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })
            await templateStoreManager.revokeTemplate(templateId, { from: owner })

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                conditionTypes: [accounts[3]],
                conditionIds: [constants.bytes32.zero],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.zero

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(agreement),
                    { from: templateId }
                ),
                constants.template.error.templateNotApproved
            )
        })

        it('should not create agreement with existing ID', async () => {
            const { agreementStoreManager, templateStoreManager, owner } = await setupTest()

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                conditionTypes: [accounts[3]],
                conditionIds: [constants.bytes32.zero],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.zero

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            const otherAgreement = {
                did: constants.did[1],
                didOwner: accounts[1],
                conditionTypes: [accounts[3]],
                conditionIds: [constants.bytes32.one],
                timeLocks: [2],
                timeOuts: [3]
            }

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(otherAgreement),
                    { from: templateId }
                ),
                constants.error.idAlreadyExists
            )
        })
    })

    describe('get agreement', () => {
        it('successful create should get agreement', async () => {
            const { common, agreementStoreManager, templateStoreManager, owner } = await setupTest()

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                conditionTypes: [accounts[3], accounts[4]],
                conditionIds: [constants.bytes32.one, constants.bytes32.zero],
                timeLocks: [0, 1],
                timeOuts: [2, 3]
            }

            const blockNumber = await common.getCurrentBlockNumber()
            const agreementId = constants.bytes32.zero

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            // TODO - containSubset
            const storedAgreement = await agreementStoreManager.getAgreement(agreementId)
            expect(storedAgreement.did)
                .to.equal(agreement.did)
            expect(storedAgreement.didOwner)
                .to.equal(agreement.didOwner)
            expect(storedAgreement.templateId)
                .to.equal(templateId)
            expect(storedAgreement.conditionIds)
                .to.deep.equal(agreement.conditionIds)
            expect(storedAgreement.lastUpdatedBy)
                .to.equal(templateId)
            expect(storedAgreement.blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })
    })
})
