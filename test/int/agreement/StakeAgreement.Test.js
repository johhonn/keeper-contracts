/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const OceanToken = artifacts.require('OceanToken')
const LockRewardCondition = artifacts.require('LockRewardCondition')
const SignCondition = artifacts.require('SignCondition')
const EscrowReward = artifacts.require('EscrowReward')

const constants = require('../../helpers/constants.js')
const getBalance = require('../../helpers/getBalance.js')

contract('Escrow Access Secret Store integration test', (accounts) => {
    async function setupTest({
        agreementId = constants.bytes32.one,
        conditionIds = [constants.address.dummy],
        deployer = accounts[8],
        owner = accounts[9]
    } = {}) {
        const didRegistryLibrary = await DIDRegistryLibrary.new()
        await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
        const didRegistry = await DIDRegistry.new()
        await didRegistry.initialize(owner)

        const epochLibrary = await EpochLibrary.new({ from: deployer })
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new({ from: deployer })

        const templateStoreManager = await TemplateStoreManager.new({ from: deployer })
        await templateStoreManager.initialize(
            owner,
            { from: deployer }
        )

        const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: deployer })
        await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
        const agreementStoreManager = await AgreementStoreManager.new({ from: deployer })
        await agreementStoreManager.methods['initialize(address,address,address,address)'](
            owner,
            conditionStoreManager.address,
            templateStoreManager.address,
            didRegistry.address,
            { from: deployer }
        )

        await conditionStoreManager.initialize(
            owner,
            agreementStoreManager.address,
            { from: deployer }
        )

        const oceanToken = await OceanToken.new({ from: deployer })
        await oceanToken.initialize(owner, owner)

        const lockRewardCondition = await LockRewardCondition.new({ from: deployer })
        await lockRewardCondition.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: deployer }
        )

        const escrowReward = await EscrowReward.new({ from: deployer })
        await escrowReward.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: deployer }
        )

        const signCondition = await SignCondition.new()
        await signCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: accounts[0] }
        )

        return {
            oceanToken,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            lockRewardCondition,
            signCondition,
            escrowReward,
            agreementId,
            conditionIds,
            owner
        }
    }

    describe('create and fulfill escrow agreement', () => {
        it('should create escrow agreement and fulfill', async () => {
            const {
                oceanToken,
                didRegistry,
                agreementStoreManager,
                templateStoreManager,
                signCondition,
                lockRewardCondition,
                escrowReward,
                owner
            } = await setupTest()

            // propose and approve account as agreement factory - not for production :)
            const templateId = accounts[0]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            const staker = accounts[0]
            const stakeAmount = 1000
            const stakePeriod = 5
            const did = constants.did[0]
            const { url } = constants.registry
            const checksum = constants.bytes32.one
            // use signature as release, could also be hash of secret
            const { message, publicKey, signature } = constants.condition.sign.bytes32

            // generate IDs from attributes
            const agreementId = constants.bytes32.one
            const conditionIdSign = await signCondition.generateId(agreementId, await signCondition.hashValues(message, publicKey))
            const conditionIdLock = await lockRewardCondition.generateId(agreementId, await lockRewardCondition.hashValues(escrowReward.address, stakeAmount))
            const conditionIdEscrow = await escrowReward.generateId(agreementId, await escrowReward.hashValues(stakeAmount, staker, staker, conditionIdLock, conditionIdSign))

            // construct agreement
            const agreement = {
                did: did,
                conditionTypes: [
                    signCondition.address,
                    lockRewardCondition.address,
                    escrowReward.address
                ],
                conditionIds: [
                    conditionIdSign,
                    conditionIdLock,
                    conditionIdEscrow
                ],
                timeLocks: [stakePeriod, 0, 0],
                timeOuts: [0, 0, 0]
            }

            // register DID
            await didRegistry.registerAttribute(did, checksum, url)
            // create agreement as approved account - not for production ;)
            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            // fulfill lock reward
            await oceanToken.mint(staker, stakeAmount, { from: owner })
            await oceanToken.approve(lockRewardCondition.address, stakeAmount, { from: staker })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, stakeAmount)

            assert.strictEqual(await getBalance(oceanToken, staker), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), stakeAmount)

            // fulfill before stake period
            await assert.isRejected(
                signCondition.fulfill(agreementId, message, publicKey, signature),
                constants.condition.epoch.error.isTimeLocked
            )

            await signCondition.fulfill(agreementId, message, publicKey, signature)

            // get reward
            await escrowReward.fulfill(
                agreementId,
                stakeAmount,
                staker,
                staker,
                conditionIdLock,
                conditionIdSign)

            assert.strictEqual(await getBalance(oceanToken, staker), stakeAmount)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
        })
    })
})
