/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const TemplateStoreLibrary = artifacts.require('TemplateStoreLibrary')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const HashLockCondition = artifacts.require('HashLockCondition')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const EpochLibrary = artifacts.require('EpochLibrary')

const constants = require('../../helpers/constants.js')

contract('TemplateStoreManager', (accounts) => {
    async function setupTest({
        templateId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0]
    } = {}) {
        const common = await Common.new()
        const templateStoreLibrary = await TemplateStoreLibrary.new()
        await TemplateStoreManager.link('TemplateStoreLibrary', templateStoreLibrary.address)
        const templateStoreManager = await TemplateStoreManager.new()
        await templateStoreManager.initialize(createRole)

        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        const owner = createRole
        const conditionStoreManager = await ConditionStoreManager.new()
        await conditionStoreManager.initialize(
            owner,
            { from: owner }
        )

        await conditionStoreManager.delegateCreateRole(
            createRole,
            { from: owner }
        )
        const hashLockCondition = await HashLockCondition.new()
        await hashLockCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: owner }
        )

        await templateStoreManager.registerTemplateActorType(
            'consumer',
            {
            from: owner
            }
        )
        const consumerActorTypeId = await templateStoreManager.getTemplateActorTypeId('consumer')

        // any random ID
        templateId = constants.bytes32.one

        conditionTypes = [
            hashLockCondition.address
        ]
        actorTypeIds = [
            consumerActorTypeId
        ]
        return {
            common,
            templateStoreManager,
            templateId,
            conditionType,
            createRole,
            conditionTypes,
            actorTypeIds,
            owner
        }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            // act-assert
            const templateStoreLibrary = await TemplateStoreLibrary.new()
            await TemplateStoreManager.link('TemplateStoreLibrary', templateStoreLibrary.address)
            await TemplateStoreManager.new()
        })
    })

    describe('propose template', () => {
        it('should propose and be proposed', async () => {
            const { templateStoreManager, conditionTypes, templateId, actorTypes, owner } = await setupTest()

            await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                templateId,
                conditionTypes,
                actorTypeIds,
                'SampleTemplate',
                {
                    from: owner
                }
            )

            expect((await templateStoreManager.getTemplate(templateId)).state.toNumber())
                .to.equal(constants.template.state.proposed)
            expect((await templateStoreManager.getTemplateListSize()).toNumber()).to.equal(1)
        })

        it('should not propose if exists', async () => {
            const { templateStoreManager, templateId, conditionTypes, actorTypeIds, owner } = await setupTest()

            await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                templateId,
                conditionTypes,
                actorTypeIds,
                'SampleTemplate',
                {
                    from: owner
                }
            )

            await assert.isRejected(
                templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                    templateId,
                    conditionTypes,
                    actorTypeIds,
                    'SampleTemplate',
                    {
                        from: owner
                    }
                ),
                constants.error.idAlreadyExists
            )
        })
    })

    describe('approve template', () => {
        it('should approve after propose', async () => {
            const { templateStoreManager, templateId, conditionTypes, actorTypeIds, owner } = await setupTest()

            await assert.isRejected(
                templateStoreManager.approveTemplate(templateId),
                constants.template.error.templateNotProposed
            )

            await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                templateId,
                conditionTypes,
                actorTypeIds,
                'SampleTemplate',
                {
                    from: owner
                }
            )
            await templateStoreManager.approveTemplate(templateId, { from: owner })
            expect((await templateStoreManager.getTemplate(templateId)).state.toNumber())
                .to.equal(constants.template.state.approved)
            expect((await templateStoreManager.getTemplateListSize()).toNumber()).to.equal(1)
        })

        it('should not approve if not createRole', async () => {
            const { templateStoreManager, templateId, actorTypeIds, conditionTypes, owner } = await setupTest()

            await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                templateId,
                conditionTypes,
                actorTypeIds,
                'SampleTemplate',
                {
                    from: owner
                }
            )

            await assert.isRejected(
                templateStoreManager.approveTemplate(templateId, { from: accounts[1] }),
                constants.error.revert
            )
        })
    })

    describe('get template', () => {
        it('successful create should get unfulfilled condition', async () => {
            const { common, templateStoreManager, templateId, conditionTypes, actorTypeIds, owner } = await setupTest()
            const blockNumber = await common.getCurrentBlockNumber()

            await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                templateId,
                conditionTypes,
                actorTypeIds,
                'SampleTemplate',
                {
                    from: owner
                }
            )

            // TODO - containSubset
            const storedTemplate = await templateStoreManager.getTemplate(templateId)
            expect(storedTemplate.state.toNumber())
                .to.equal(constants.template.state.proposed)
            expect(storedTemplate.lastUpdatedBy)
                .to.equal(accounts[0])
            expect(storedTemplate.blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })
    })

    describe('revoke template', () => {
        it('successful create should revoke if owner and approved', async () => {
            const { common, templateStoreManager, templateId, conditionTypes, actorTypeIds, owner } = await setupTest()

            await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                templateId,
                conditionTypes,
                actorTypeIds,
                'SampleTemplate'
            )

            await templateStoreManager.approveTemplate(templateId, { from: owner })

            const blockNumber = await common.getCurrentBlockNumber()

            await templateStoreManager.revokeTemplate(templateId, { from: owner })

            const storedTemplate = await templateStoreManager.getTemplate(templateId)
            expect(storedTemplate.state.toNumber())
                .to.equal(constants.template.state.revoked)
            expect(storedTemplate.blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })

        it('successful approve should not revoke if not owner', async () => {
            const { templateStoreManager, templateId, actorTypeIds, conditionTypes, owner } = await setupTest()

            await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                templateId,
                conditionTypes,
                actorTypeIds,
                'SampleTemplate',
                {
                    from: owner
                }
            )

            await templateStoreManager.approveTemplate(templateId, { from: owner })

            await assert.isRejected(
                templateStoreManager.revokeTemplate(templateId, { from: accounts[1] }),
                'Invalid contract owner or template owner'
            )
        })

        it('should not revoke if uninitialized', async () => {
            const { templateStoreManager, templateId, owner } = await setupTest()

            await assert.isRejected(
                templateStoreManager.revokeTemplate(templateId, { from: owner }),
                constants.template.error.templateNotApproved
            )
        })

        it('should not revoke if proposed', async () => {
            const { templateStoreManager, templateId, actorTypeIds, conditionTypes, owner } = await setupTest()

            await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                templateId,
                conditionTypes,
                actorTypeIds,
                'SampleTemplate',
                {
                    from: owner
                }
            )

            await assert.isRejected(
                templateStoreManager.revokeTemplate(templateId, { from: owner }),
                constants.template.error.templateNotApproved
            )
        })

        it('should not revoke if already revoked', async () => {
            const { templateStoreManager, actorTypeIds, conditionTypes, templateId, owner } = await setupTest()

            await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                templateId,
                conditionTypes,
                actorTypeIds,
                'SampleTemplate',
                {
                    from: owner
                }
            )

            await templateStoreManager.approveTemplate(templateId, { from: owner })
            await templateStoreManager.revokeTemplate(templateId, { from: owner })

            await assert.isRejected(
                templateStoreManager.revokeTemplate(templateId, { from: owner }),
                constants.template.error.templateNotApproved
            )
        })
    })
})
