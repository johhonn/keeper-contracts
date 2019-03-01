/* eslint-env mocha */
/* global artifacts, web3, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const constants = require('../helpers/constants.js')

const {
    upgradeContracts,
    deployContracts,
    confirmUpgrade
} = require('../../scripts/deploy/deploymentHandler')

const AgreementStoreManager = artifacts.require('AgreementStoreManager')

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
    let addressBook,
        agreementStoreManager

    const verbose = true
    const approver = accounts[2]

    beforeEach('Load wallet each time', async function() {
        addressBook = await deployContracts(
            web3,
            artifacts,
            [
                'DIDRegistry',
                'ConditionStoreManager',
                'TemplateStoreManager',
                'AgreementStoreManager'
            ],
            verbose
        )
    })

    async function setupTest({
        agreementId = constants.bytes32.one,
        conditionIds = [constants.address.dummy],
        did = constants.did[0],
        conditionTypes = [constants.address.dummy],
        timeLocks = [0],
        timeOuts = [2]
    } = {}) {
        agreementStoreManager = await AgreementStoreManager.at(addressBook['AgreementStoreManager'])
        return {
            agreementStoreManager,
            did,
            agreementId,
            conditionIds,
            conditionTypes,
            timeLocks,
            timeOuts
        }
    }

    describe('Test upgradability for AgreementStoreManager', () => {
        xit('Should be possible to fix/add a bug', async () => {
            await setupTest()

            const taskBook = await upgradeContracts(
                web3,
                ['AgreementStoreManagerWithBug:AgreementStoreManager'],
                verbose
            )

            await confirmUpgrade(
                web3,
                taskBook['AgreementStoreManager'],
                approver,
                verbose
            )
            const AgreementStoreManagerWithBugInstance =
                await AgreementStoreManagerWithBug.at(addressBook['AgreementStoreManager'])

            assert.strictEqual(
                (await AgreementStoreManagerWithBugInstance.getAgreementListSize()).toNumber(),
                0,
                'agreement list size should return zero (according to bug)'
            )
        })

        it('Should be possible to change function signature', async () => {
            let {
                did,
                agreementId,
                conditionIds,
                conditionTypes,
                timeLocks,
                timeOuts
            } = await setupTest()

            const taskBook = await upgradeContracts(
                web3,
                ['AgreementStoreManagerChangeFunctionSignature:AgreementStoreManager'],
                verbose
            )

            // act & assert
            await confirmUpgrade(
                web3,
                taskBook['AgreementStoreManager'],
                approver,
                verbose
            )

            const AgreementStoreManagerChangeFunctionSignatureInstance =
                await AgreementStoreManagerChangeFunctionSignature.at(addressBook['AgreementStoreManager'])

            await assert.isRejected(
                AgreementStoreManagerChangeFunctionSignatureInstance.createAgreement(
                    agreementId,
                    did,
                    conditionTypes,
                    conditionIds,
                    timeLocks,
                    timeOuts,
                    accounts[7],
                    { from: accounts[8] }
                ),
                'Invalid sender address, should fail in function signature check'
            )
        })

        xit('Should be possible to append storage variable(s) ', async () => {
            await setupTest()

            const taskBook = await upgradeContracts(
                web3,
                ['AgreementStoreManagerChangeInStorage:AgreementStoreManager'],
                verbose
            )

            await confirmUpgrade(
                web3,
                taskBook['AgreementStoreManager'],
                approver,
                verbose
            )

            const upgradedAgreementStoreManager =
                await AgreementStoreManagerChangeInStorage.at(addressBook['AgreementStoreManager'])

            // act & assert
            assert.strictEqual(
                (await upgradedAgreementStoreManager.AgreementCount()).toNumber(),
                0,
                'Invalid change in storage'
            )
        })

        xit('Should be possible to append storage variables and change logic', async () => {
            let {
                did,
                agreementId,
                conditionIds,
                conditionTypes,
                timeLocks,
                timeOuts
            } = await setupTest()

            const taskBook = await upgradeContracts(
                web3,
                ['AgreementStoreManagerChangeInStorageAndLogic:AgreementStoreManager'],
                verbose
            )

            await confirmUpgrade(
                web3,
                taskBook['AgreementStoreManager'],
                approver
            )

            const upgradedAgreementStoreManager =
                await AgreementStoreManagerChangeInStorageAndLogic.at(addressBook['AgreementStoreManager'])

            // act & assert
            await assert.isRejected(
                upgradedAgreementStoreManager.createAgreement(
                    agreementId,
                    did,
                    conditionTypes,
                    conditionIds,
                    timeLocks,
                    timeOuts,
                    accounts[8],
                    { from: accounts[7] }
                ),
                'Invalid sender address, should fail in function signature check'
            )

            assert.strictEqual(
                (await upgradedAgreementStoreManager.AgreementCount()).toNumber(),
                0,
                'Invalid change in storage'
            )
        })

        xit('Should be able to call new method added after upgrade is approved', async () => {
            await setupTest()

            const taskBook = await upgradeContracts(
                web3,
                ['AgreementStoreExtraFunctionality:AgreementStoreManager'],
                verbose
            )

            await confirmUpgrade(
                web3,
                taskBook['AgreementStoreManager'],
                approver,
                verbose
            )

            const AgreementStoreExtraFunctionalityInstance =
                await AgreementStoreManagerExtraFunctionality.at(addressBook['AgreementStoreManager'])

            // act & assert
            assert.strictEqual(
                await AgreementStoreExtraFunctionalityInstance.dummyFunction(),
                true,
                'Invalid extra functionality upgrade'
            )
        })
    })
})
