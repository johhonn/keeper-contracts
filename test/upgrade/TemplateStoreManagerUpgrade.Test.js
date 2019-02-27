/* eslint-env mocha */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const deploy = require('../helpers/zos/deploy')
const upgrade = require('../helpers/zos/upgrade')
const loadWallet = require('../helpers/wallet/loadWallet')
const createWallet = require('../helpers/wallet/createWallet')
const constants = require('../helpers/constants.js')

const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const TemplateStoreChangeFunctionSignature = artifacts.require('TemplateStoreChangeFunctionSignature')
const TemplateStoreChangeInStorage = artifacts.require('TemplateStoreChangeInStorage')
const TemplateStoreChangeInStorageAndLogic = artifacts.require('TemplateStoreChangeInStorageAndLogic')
const TemplateStoreExtraFunctionality = artifacts.require('TemplateStoreExtraFunctionality')
const TemplateStoreWithBug = artifacts.require('TemplateStoreWithBug')

contract('TemplateStoreManager', (accounts) => {
    let adminWallet,
        addresses,
        templateStoreManager

    beforeEach('Load wallet each time', async function() {
        await createWallet(true)
        adminWallet = await loadWallet('upgrader') // zos admin MultiSig
        addresses = await deploy('deploy', ['TemplateStoreManager'])
    })

    async function setupTest({
        contracts = null,
        templateId = constants.bytes32.one,
        conditionType = accounts[0]
    } = {}) {
        templateStoreManager = await TemplateStoreManager.at(contracts.templateStoreManagerAddress)
        return {
            templateStoreManager,
            templateId,
            conditionType
        }
    }

    describe('Test upgradability for TemplateStoreManager', () => {
        it('Should be possible to fix/add a bug', async () => {
            await setupTest({ contracts: addresses })
            const upgradeTxId = await upgrade(
                'TemplateStoreManager',
                'TemplateStoreWithBug',
                addresses.templateStoreManagerAddress,
                adminWallet,
                accounts[0]
            )

            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedTemplateStoreManager = await TemplateStoreWithBug.at(addresses.templateStoreManagerAddress)

            // act & assert
            assert.strictEqual(
                (await upgradedTemplateStoreManager.getTemplateListSize()).toNumber(),
                0,
                'template list size should return zero (according to bug)'
            )
        })

        it('Should be possible to change function signature', async () => {
            let { conditionType } = await setupTest({ contracts: addresses })
            const upgradeTxId = await upgrade(
                'TemplateStoreManager',
                'TemplateStoreChangeFunctionSignature',
                addresses.templateStoreManagerAddress,
                adminWallet,
                accounts[0]
            )

            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedTemplateStoreManager = await TemplateStoreChangeFunctionSignature.at(addresses.templateStoreManagerAddress)

            // act & assert
            await assert.isRejected(
                upgradedTemplateStoreManager.proposeTemplate(conditionType, constants.address.dummy),
                'Invalid sender address'
            )
        })

        it('Should be possible to append storage variable(s) ', async () => {
            await setupTest({ contracts: addresses })
            const upgradeTxId = await upgrade(
                'TemplateStoreManager',
                'TemplateStoreChangeInStorage',
                addresses.templateStoreManagerAddress,
                adminWallet,
                accounts[0]
            )

            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedTemplateStoreManager = await TemplateStoreChangeInStorage.at(addresses.templateStoreManagerAddress)

            // act & assert
            assert.strictEqual(
                (await upgradedTemplateStoreManager.templateCount()).toNumber(),
                0,
                'Invalid change in storage'
            )
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let { conditionType } = await setupTest({ contracts: addresses })
            const upgradeTxId = await upgrade(
                'TemplateStoreManager',
                'TemplateStoreChangeInStorageAndLogic',
                addresses.templateStoreManagerAddress,
                adminWallet,
                accounts[0]
            )

            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedTemplateStoreManager = await TemplateStoreChangeInStorageAndLogic.at(addresses.templateStoreManagerAddress)

            // act & assert
            await assert.isRejected(
                upgradedTemplateStoreManager.proposeTemplate(conditionType, constants.address.dummy),
                'Invalid sender address'
            )
            assert.strictEqual(
                (await upgradedTemplateStoreManager.templateCount()).toNumber(),
                0,
                'Invalid change in storage'
            )
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            await setupTest({ contracts: addresses })
            const upgradeTxId = await upgrade(
                'TemplateStoreManager',
                'TemplateStoreExtraFunctionality',
                addresses.templateStoreManagerAddress,
                adminWallet,
                accounts[0]
            )

            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedTemplateStoreManager = await TemplateStoreExtraFunctionality.at(addresses.templateStoreManagerAddress)

            // act & assert
            assert.strictEqual(
                await upgradedTemplateStoreManager.dummyFunction(),
                true,
                'Invalid extra functionality upgrade'
            )
        })
    })
})
