/* eslint-env mocha */
/* global artifacts, web3, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const constants = require('../helpers/constants.js')

const {
    confirmUpgrade
} = require('@oceanprotocol/dori')

const {
    deploy,
    upgrade
} = require('./Upgrader')

const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const TemplateStoreLibrary = artifacts.require('TemplateStoreLibrary')
const ValidConditionContract = artifacts.require('ComputeExecutionCondition')
const EpochLibrary = artifacts.require('EpochLibrary')
const ConditionStoreLibrary = artifacts.require('ConditionStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')

const AgreementStoreManagerChangeFunctionSignature =
    artifacts.require('AgreementStoreManagerChangeFunctionSignature')
const AgreementStoreManagerChangeInStorage =
    artifacts.require('AgreementStoreManagerChangeInStorage')
const AgreementStoreManagerChangeInStorageAndLogic =
    artifacts.require('AgreementStoreManagerChangeInStorageAndLogic')
const AgreementStoreManagerExtraFunctionality =
    artifacts.require('AgreementStoreManagerExtraFunctionality')
const AgreementStoreManagerWithBug = artifacts.require('AgreementStoreManagerWithBug')

contract('AgreementStoreManager', (accounts) => {
    let agreementStoreManagerAddress

    const verbose = false
    const approver = accounts[3]

    async function setupTest({
        agreementId = constants.bytes32.one,
        conditionIds = [constants.address.dummy],
        did = constants.did[0],
        conditionTypes = [constants.address.dummy],
        timeLocks = [0],
        timeOuts = [2],
        templateId = constants.bytes32.one,
        owner = accounts[0]
    } = {}) {
        const agreementStoreManager = await AgreementStoreManager.at(agreementStoreManagerAddress)

        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreLibrary.link('EpochLibrary', epochLibrary.address)
        const conditionStoreLibrary = await ConditionStoreLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        await ConditionStoreManager.link('ConditionStoreLibrary', conditionStoreLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new()
        await conditionStoreManager.initialize(
            owner,
            { from: owner }
        )

        const templateStoreLibrary = await TemplateStoreLibrary.new()
        await TemplateStoreManager.link('TemplateStoreLibrary', templateStoreLibrary.address)
        const templateStoreManager = await TemplateStoreManager.new()
        await templateStoreManager.initialize(owner)

        const validConditionContract = await ValidConditionContract.new()

        await validConditionContract.methods['initialize(address,address,address)'](
            accounts[0],
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: accounts[0] }
        )

        const consumerAddress = accounts[1]
        const hashValues = await validConditionContract.hashValues(constants.bytes32.one, consumerAddress)
        const conditionId = await validConditionContract.generateId(agreementId, hashValues)
        conditionIds = [conditionId]
        await templateStoreManager.registerTemplateActorType(
            'consumer',
            {
                from: owner
            }
        )
        const consumerActorTypeId = await templateStoreManager.getTemplateActorTypeId('consumer')

        conditionTypes = [
            validConditionContract.address
        ]
        const actorTypeIds = [
            consumerActorTypeId
        ]

        await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
            templateId,
            conditionTypes,
            actorTypeIds,
            'SampleTemplate'
        )

        await templateStoreManager.approveTemplate(templateId, { from: owner })

        return {
            did,
            agreementId,
            conditionIds,
            conditionTypes,
            timeLocks,
            timeOuts,
            actorTypeIds,
            templateId,
            templateStoreManager
        }
    }

    describe('Test upgradability for AgreementStoreManager', () => {
        beforeEach('Load wallet each time', async function() {
            const addressBook = await deploy({
                web3,
                artifacts,
                contracts: [
                    'DIDRegistry',
                    'ConditionStoreManager',
                    'TemplateStoreManager',
                    'AgreementStoreManager'
                ],
                verbose
            })

            agreementStoreManagerAddress = addressBook.AgreementStoreManager
            assert(agreementStoreManagerAddress)
        })

        it('Should be possible to fix/add a bug', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['AgreementStoreManagerWithBug:AgreementStoreManager'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.AgreementStoreManager,
                approver,
                verbose
            )
            const AgreementStoreManagerWithBugInstance =
                await AgreementStoreManagerWithBug.at(agreementStoreManagerAddress)

            assert.strictEqual(
                (await AgreementStoreManagerWithBugInstance.getAgreementListSize()).toNumber(),
                0,
                'agreement list size should return zero (according to bug)'
            )
        })

        it('Should be possible to change function signature', async () => {
            const {
                did,
                agreementId,
                conditionIds,
                conditionTypes,
                timeLocks,
                timeOuts,
                templateId,
                templateStoreManager
            } = await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['AgreementStoreManagerChangeFunctionSignature:AgreementStoreManager'],
                verbose
            })

            // act & assert
            await confirmUpgrade(
                web3,
                taskBook.AgreementStoreManager,
                approver,
                verbose
            )

            const AgreementStoreManagerChangeFunctionSignatureInstance =
                await AgreementStoreManagerChangeFunctionSignature.at(agreementStoreManagerAddress)

            await assert.isRejected(
                AgreementStoreManagerChangeFunctionSignatureInstance.createAgreement(
                    agreementId,
                    did,
                    templateId,
                    conditionIds,
                    timeLocks,
                    timeOuts,
                    [accounts[1]],
                    { from: accounts[8] }
                ),
                'Invalid sender address, should fail in function signature check'
            )
        })

        it('Should be possible to append storage variable(s) ', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['AgreementStoreManagerChangeInStorage:AgreementStoreManager'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.AgreementStoreManager,
                approver,
                verbose
            )

            const AgreementStoreManagerChangeInStorageInstance =
                await AgreementStoreManagerChangeInStorage.at(agreementStoreManagerAddress)

            // act & assert
            assert.strictEqual(
                (await AgreementStoreManagerChangeInStorageInstance.AgreementCount()).toNumber(),
                0,
                'Invalid change in storage'
            )
        })

        it('Should be possible to append storage variables and change logic', async () => {
            const {
                did,
                agreementId,
                conditionIds,
                conditionTypes,
                timeLocks,
                timeOuts,
                templateId
            } = await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['AgreementStoreManagerChangeInStorageAndLogic:AgreementStoreManager'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.AgreementStoreManager,
                approver,
                verbose
            )

            const AgreementStoreManagerChangeInStorageAndLogicInstance =
                await AgreementStoreManagerChangeInStorageAndLogic.at(agreementStoreManagerAddress)

            // act & assert
            await assert.isRejected(
                AgreementStoreManagerChangeInStorageAndLogicInstance.createAgreement(
                    agreementId,
                    did,
                    templateId,
                    conditionIds,
                    timeLocks,
                    timeOuts,
                    [accounts[8]],
                    { from: accounts[7] }
                ),
                'Invalid sender address, should fail in function signature check'
            )

            assert.strictEqual(
                (await AgreementStoreManagerChangeInStorageAndLogicInstance.AgreementCount()).toNumber(),
                0,
                'Invalid change in storage'
            )
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['AgreementStoreManagerExtraFunctionality:AgreementStoreManager'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.AgreementStoreManager,
                approver,
                verbose
            )

            const AgreementStoreExtraFunctionalityInstance =
                await AgreementStoreManagerExtraFunctionality.at(agreementStoreManagerAddress)

            // act & assert
            assert.strictEqual(
                await AgreementStoreExtraFunctionalityInstance.dummyFunction(),
                true,
                'Invalid extra functionality upgrade'
            )
        })
    })
})
