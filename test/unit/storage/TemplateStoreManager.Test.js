/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common.sol')
const TemplateStoreLibrary = artifacts.require('TemplateStoreLibrary.sol')
const TemplateStoreManager = artifacts.require('TemplateStoreManager.sol')
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
        return {
            common,
            templateStoreManager,
            templateId,
            conditionType,
            createRole
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

    describe('create template', () => {
        it('should create and be active', async () => {
            const { templateStoreManager } = await setupTest()

            const template = {
                conditionTypes: [constants.address.dummy]
            }
            const templateId = constants.bytes32.one

            await templateStoreManager.createTemplate(
                templateId,
                ...Object.values(template)
            )

            expect(await templateStoreManager.isTemplateActive(templateId))
                .to.equal(true)
            expect((await templateStoreManager.getTemplateListSize()).toNumber()).to.equal(1)
        })
    })

    describe('get template', () => {
        it('successful create should get unfulfilled condition', async () => {
            const { common, templateStoreManager } = await setupTest()

            const blockNumber = await common.getCurrentBlockNumber()

            const template = {
                conditionTypes: [constants.address.dummy]
            }
            const templateId = constants.bytes32.one

            await templateStoreManager.createTemplate(
                templateId,
                ...Object.values(template)
            )

            // TODO - containSubset
            const storedTemplate = await templateStoreManager.getTemplate(templateId)
            expect(storedTemplate.conditionTypes)
                .to.deep.equal(template.conditionTypes)
            expect(storedTemplate.state.toNumber())
                .to.equal(constants.template.state.active)
            expect(storedTemplate.lastUpdatedBy)
                .to.equal(accounts[0])
            expect(storedTemplate.blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })
    })

    describe('revoke', () => {
        it('successful create should revoke if owner', async () => {
            const { common, templateStoreManager } = await setupTest()

            const template = {
                conditionTypes: [constants.address.dummy]
            }
            const templateId = constants.bytes32.one

            await templateStoreManager.createTemplate(
                templateId,
                ...Object.values(template)
            )

            const blockNumber = await common.getCurrentBlockNumber()

            await templateStoreManager.revoke(templateId)

            const storedTemplate = await templateStoreManager.getTemplate(templateId)
            expect(storedTemplate.state.toNumber())
                .to.equal(constants.template.state.revoked)
            expect(storedTemplate.blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })

        it('successful create should not revoke if not owner', async () => {
            const { templateStoreManager } = await setupTest()

            const template = {
                conditionTypes: [constants.address.dummy]
            }
            const templateId = constants.bytes32.one

            await templateStoreManager.createTemplate(
                templateId,
                ...Object.values(template)
            )

            await assert.isRejected(
                templateStoreManager.revoke(templateId, { from: accounts[1] }),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('should not revoke if not active', async () => {
            const { templateStoreManager } = await setupTest()

            const templateId = constants.bytes32.one

            await assert.isRejected(
                templateStoreManager.revoke(templateId),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('should not revoke if already revoked', async () => {
            const { templateStoreManager } = await setupTest()

            const template = {
                conditionTypes: [constants.address.dummy]
            }
            const templateId = constants.bytes32.one

            await templateStoreManager.createTemplate(
                templateId,
                ...Object.values(template)
            )

            await templateStoreManager.revoke(templateId)

            await assert.isRejected(
                templateStoreManager.revoke(templateId),
                constants.template.error.templateNotActive
            )
        })
    })
})
