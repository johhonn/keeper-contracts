/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const TemplateStoreLibrary = artifacts.require('TemplateStoreLibrary.sol')
const TemplateStoreManager = artifacts.require('TemplateStoreManager.sol')
const constants = require('../../helpers/constants.js')

contract('TemplateStoreManager', (accounts) => {
    async function setupTest({
        templateId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0]
    } = {}) {
        const templateStoreLibrary = await TemplateStoreLibrary.new({ from: createRole })
        await TemplateStoreManager.link('TemplateStoreLibrary', templateStoreLibrary.address)
        const templateStoreManager = await TemplateStoreManager.new(
            { from: createRole }
        )
        return { templateStoreManager, templateId, conditionType, createRole }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            // act-assert
            const templateStoreLibrary = await TemplateStoreLibrary.new({ from: accounts[0] })
            await TemplateStoreManager.link('TemplateStoreLibrary', templateStoreLibrary.address)
            await TemplateStoreManager.new(
                { from: accounts[0] }
            )
        })
    })

    describe('create template', () => {
        it('should create and exist', async () => {
            const { templateStoreManager } = await setupTest()

            const template = {
                conditionTypes: [constants.address.dummy]
            }
            const templateId = constants.bytes32.one

            await templateStoreManager.createTemplate(
                templateId,
                ...Object.values(template)
            )

            expect(await templateStoreManager.exists(templateId)).to.equal(true)
        })
    })

    describe('get template', () => {
        it('successful create should get unfulfilled condition', async () => {
            const { templateStoreManager } = await setupTest()

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
            expect(storedTemplate.conditionTypes).to.deep.equal(template.conditionTypes)
        })
    })

    describe('exists', () => {
        it('successful create should exist', async () => {
        })

        it('no create should not exist', async () => {
        })
    })
})
