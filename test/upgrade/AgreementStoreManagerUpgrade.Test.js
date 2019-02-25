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

const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const AgreementStoreChangeFunctionSignature = artifacts.require('AgreementStoreChangeFunctionSignature')
const AgreementStoreChangeInStorage = artifacts.require('AgreementStoreChangeInStorage')
const AgreementStoreChangeInStorageAndLogic = artifacts.require('AgreementStoreChangeInStorageAndLogic')
const AgreementStoreExtraFunctionality = artifacts.require('AgreementStoreExtraFunctionality')
const AgreementStoreWithBug = artifacts.require('AgreementStoreWithBug')

contract('AgreementStoreManager', (accounts) => {
    let adminWallet,
        addresses,
        agreementStoreManager

    beforeEach('Load wallet each time', async function() {
        await createWallet(true)
        adminWallet = await loadWallet('upgrader') // zos admin MultiSig
        addresses = await deploy('deploy', ['DIDRegistry', 'ConditionStoreManager', 'TemplateStoreManager', 'AgreementStoreManager'])
    })

    async function setupTest({
        contracts = null,
        agreementId = constants.bytes32.one,
        conditionIds = [constants.address.dummy],
        did = constants.did[0],
        conditionTypes = [accounts[3]],
        createRole = accounts[0],
        deployer = accounts[8],
        timeLocks = [0],
        timeOuts = [2]
    } = {}) {
        agreementStoreManager = await AgreementStoreManager.at(contracts.agreementStoreManagerAddress)
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
        it('Should be possible to fix/add a bug', async () => {
            await setupTest({ contracts: addresses })
            const upgradeTxId = await upgrade(
                'AgreementStoreManager',
                'AgreementStoreWithBug',
                addresses.agreementStoreManagerAddress,
                adminWallet,
                accounts[0]
            )

            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedAgreementStoreManager = await AgreementStoreWithBug.at(addresses.agreementStoreManagerAddress)

            assert.strictEqual(
                (await upgradedAgreementStoreManager.getAgreementListSize()).toNumber(),
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

            } = await setupTest({ contracts: addresses })
            const upgradeTxId = await upgrade(
                'AgreementStoreManager',
                'AgreementStoreChangeFunctionSignature',
                addresses.agreementStoreManagerAddress,
                adminWallet,
                accounts[0]
            )

            // act & assert
            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedAgreementStoreManager = await AgreementStoreChangeFunctionSignature.at(addresses.agreementStoreManagerAddress)

            await assert.isRejected(
                upgradedAgreementStoreManager.createAgreement(
                    agreementId,
                    did,
                    conditionTypes,
                    conditionIds,
                    timeLocks,
                    timeOuts,
                    accounts[8],
                    {
                        from: accounts[7]
                    }
                ),
                'Invalid sender address, should fail in function signature check'
            )
        })

        it('Should be possible to append storage variable(s) ', async () => {
            await setupTest({ contracts: addresses })
            const upgradeTxId = await upgrade(
                'AgreementStoreManager',
                'AgreementStoreChangeInStorage',
                addresses.agreementStoreManagerAddress,
                adminWallet,
                accounts[0]
            )

            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedAgreementStoreManager = await AgreementStoreChangeInStorage.at(addresses.agreementStoreManagerAddress)

            // act & assert
            assert.strictEqual(
                (await upgradedAgreementStoreManager.AgreementCount()).toNumber(),
                0,
                'Invalid change in storage'
            )
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let {
                did,
                agreementId,
                conditionIds,
                conditionTypes,
                timeLocks,
                timeOuts
            } = await setupTest({ contracts: addresses })

            const upgradeTxId = await upgrade(
                'AgreementStoreManager',
                'AgreementStoreChangeInStorageAndLogic',
                addresses.agreementStoreManagerAddress,
                adminWallet,
                accounts[0]
            )

            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedAgreementStoreManager = await AgreementStoreChangeInStorageAndLogic.at(addresses.agreementStoreManagerAddress)

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
                    {
                        from: accounts[7]
                    }
                ),
                'Invalid sender address, should fail in function signature check'
            )

            assert.strictEqual(
                (await upgradedAgreementStoreManager.AgreementCount()).toNumber(),
                0,
                'Invalid change in storage'
            )
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            await setupTest({ contracts: addresses })
            const upgradeTxId = await upgrade(
                'AgreementStoreManager',
                'AgreementStoreExtraFunctionality',
                addresses.agreementStoreManagerAddress,
                adminWallet,
                accounts[0]
            )

            await adminWallet.confirmTransaction(upgradeTxId, { from: accounts[1] })
            const upgradedAgreementStoreManager = await AgreementStoreExtraFunctionality.at(addresses.agreementStoreManagerAddress)

            // act & assert
            assert.strictEqual(
                await upgradedAgreementStoreManager.dummyFunction(),
                true,
                'Invalid extra functionality upgrade'
            )
        })
    })
})
