/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common.sol')
const EpochLibrary = artifacts.require('EpochLibrary.sol')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const TemplateStoreManager = artifacts.require('TemplateStoreManager.sol')
const AgreementStoreManager = artifacts.require('AgreementStoreManager.sol')
const constants = require('../../helpers/constants.js')

contract('AgreementStoreManager', (accounts) => {
    async function setupTest({
        agreementId = constants.bytes32.one,
        conditionIds = [constants.address.dummy],
        createRole = accounts[0],
        owner = accounts[1]
    } = {}) {
        const common = await Common.new({ from: owner })
        const epochLibrary = await EpochLibrary.new({ from: owner })
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new({ from: owner })
        const templateStoreManager = await TemplateStoreManager.new({ from: owner })
        const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: owner })
        await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
        const agreementStoreManager = await AgreementStoreManager.new({ from: owner })

        await agreementStoreManager.initialize(
            conditionStoreManager.address,
            templateStoreManager.address,
            owner,
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
            const epochLibrary = await EpochLibrary.new({ from: accounts[0] })
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new({ from: accounts[0] })
            const templateStoreManager = await TemplateStoreManager.new({ from: accounts[0] })
            const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: accounts[0] })
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new({ from: accounts[0] })

            await agreementStoreManager.initialize(
                conditionStoreManager.address,
                templateStoreManager.address,
                accounts[0],
                { from: accounts[0] }
            )
        })

        it('contract should not initialize with zero owner', async () => {
            const createRole = accounts[0]
            const owner = constants.address.zero

            const epochLibrary = await EpochLibrary.new({ from: createRole })
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new({ from: createRole })
            const templateStoreManager = await TemplateStoreManager.new({ from: createRole })
            const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: createRole })
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new({ from: createRole })

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.initialize(
                    conditionStoreManager.address,
                    templateStoreManager.address,
                    owner,
                    { from: createRole }
                ),
                constants.address.error.invalidAddress0x0
            )
        })

        it('contract should not initialize with zero conditionStoreManager address', async () => {
            const createRole = accounts[0]
            const owner = constants.address.zero

            const templateStoreManager = await TemplateStoreManager.new({ from: createRole })
            const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: createRole })
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new({ from: createRole })

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

            const epochLibrary = await EpochLibrary.new({ from: createRole })
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new({ from: createRole })
            const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: createRole })
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new({ from: createRole })

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.initialize(
                    conditionStoreManager.address,
                    owner,
                    createRole,
                    { from: createRole }
                ),
                constants.address.error.invalidAddress0x0
            )
        })

        it('contract should not initialize without arguments', async () => {
            const owner = accounts[0]

            const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: owner })
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new({ from: owner })

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.initialize(),
                constants.initialize.error.invalidNumberParamsGot0Expected3
            )
        })

        it('contract should not initialize with one argument', async () => {
            const owner = accounts[0]

            const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: owner })
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new({ from: owner })

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.initialize(owner),
                constants.initialize.error.invalidNumberParamsGot1Expected3
            )
        })
    })

    describe('create agreement', () => {
        it('create agreement should have existing agreement and conditions created', async () => {
            const { agreementStoreManager, templateStoreManager, conditionStoreManager } = await setupTest()

            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [
                    constants.address.dummy,
                    accounts[0]
                ]
            )
            const storedTemplate = await templateStoreManager.getTemplate(templateId)

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                templateId: templateId,
                conditionIds: [constants.bytes32.zero, constants.bytes32.one],
                timeLocks: [0, 1],
                timeOuts: [2, 3]
            }
            const agreementId = constants.bytes32.one

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(storedTemplate.conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
                expect(storedCondition.timeLock.toNumber()).to.equal(agreement.timeLocks[i])
                expect(storedCondition.timeOut.toNumber()).to.equal(agreement.timeOuts[i])
            })

            expect((await agreementStoreManager.getAgreementListSize()).toNumber()).to.equal(1)
        })

        it('should not create agreement with existing conditions', async () => {
            const { agreementStoreManager, templateStoreManager } = await setupTest()

            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [constants.address.dummy]
            )

            const conditionIds = [constants.bytes32.zero]

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                templateId: templateId,
                conditionIds: conditionIds,
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.zero

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            const otherAgreement = {
                did: constants.did[1],
                didOwner: accounts[1],
                templateId: templateId,
                conditionIds: conditionIds,
                timeLocks: [3],
                timeOuts: [100]
            }
            const otherAgreementId = constants.bytes32.one

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    otherAgreementId,
                    ...Object.values(otherAgreement)
                ),
                constants.condition.id.error.idAlreadyExists
            )
        })

        it('should not create agreement with non existing template', async () => {
            const { agreementStoreManager } = await setupTest()

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                templateId: constants.bytes32.one,
                conditionIds: [constants.bytes32.zero],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.zero

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(agreement)
                ),
                constants.template.error.templateNotActive
            )
        })

        it('should not create agreement with existing ID', async () => {
            const { agreementStoreManager, templateStoreManager } = await setupTest()

            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [constants.address.dummy]
            )

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                templateId: templateId,
                conditionIds: [constants.bytes32.zero],
                timeLocks: [0],
                timeOuts: [2]
            }
            const agreementId = constants.bytes32.zero

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )
            const otherAgreement = {
                did: constants.did[1],
                didOwner: accounts[1],
                templateId: templateId,
                conditionIds: [constants.bytes32.one],
                timeLocks: [2],
                timeOuts: [3]
            }
            const otherAgreementId = constants.bytes32.zero

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    otherAgreementId,
                    ...Object.values(otherAgreement)
                ),
                constants.condition.id.error.idAlreadyExists
            )
        })
    })

    describe('get agreement', () => {
        it('successful create should get agreement', async () => {
            const { common, agreementStoreManager, templateStoreManager } = await setupTest()

            const templateId = constants.bytes32.one
            await templateStoreManager.createTemplate(
                templateId,
                [constants.address.dummy, accounts[0]]
            )

            const agreement = {
                did: constants.did[0],
                didOwner: constants.address.dummy,
                templateId: templateId,
                conditionIds: [constants.bytes32.one, constants.bytes32.zero],
                timeLocks: [0, 1],
                timeOuts: [2, 3]
            }
            const agreementId = constants.bytes32.one
            const blockNumber = await common.getCurrentBlockNumber()

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            // TODO - containSubset
            const storedAgreement = await agreementStoreManager.getAgreement(agreementId)
            expect(storedAgreement.did)
                .to.equal(agreement.did)
            expect(storedAgreement.didOwner)
                .to.equal(agreement.didOwner)
            expect(storedAgreement.templateId)
                .to.equal(agreement.templateId)
            expect(storedAgreement.conditionIds)
                .to.deep.equal(agreement.conditionIds)
            expect(storedAgreement.lastUpdatedBy)
                .to.equal(accounts[0])
            expect(storedAgreement.blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })
    })
})
