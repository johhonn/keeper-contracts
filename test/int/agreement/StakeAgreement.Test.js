/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

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
const increaseTime = require('../../helpers/increaseTime.js')

contract('Stake Agreement integration test', (accounts) => {
    let signCondition,
        lockRewardCondition,
        escrowReward,
        templateStoreManager

    async function setupTest({
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

        templateStoreManager = await TemplateStoreManager.new({ from: deployer })
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

        lockRewardCondition = await LockRewardCondition.new({ from: deployer })
        await lockRewardCondition.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: deployer }
        )

        escrowReward = await EscrowReward.new({ from: deployer })
        await escrowReward.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: deployer }
        )

        signCondition = await SignCondition.new()
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
            owner
        }
    }

    async function approveTemplateAccount(owner, templateAccount) {
        await templateStoreManager.proposeTemplate(templateAccount)
        await templateStoreManager.approveTemplate(templateAccount, { from: owner })
    }

    async function prepareStakeAgreement({
        agreementId = constants.bytes32.one,
        staker = accounts[0],
        stakeAmount = 1000,
        stakePeriod = 5,
        // uses signature as release, could also be hash of secret
        sign = constants.condition.sign.bytes32,
        did = constants.did[0],
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        // generate IDs from attributes

        const conditionIdSign = await signCondition.generateId(agreementId, await signCondition.hashValues(sign.message, sign.publicKey))
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
        return {
            agreementId,
            agreement,
            stakeAmount,
            stakePeriod,
            sign,
            checksum,
            url
        }
    }

    describe('create and fulfill stake agreement', () => {
        it('stake agreement as an escrow with self-sign release', async () => {
            const { oceanToken, didRegistry, agreementStoreManager, owner } = await setupTest()

            const alice = accounts[0]
            // propose and approve account as agreement factory - not for production :)
            await approveTemplateAccount(owner, alice)

            // prepare: stake agreement
            const { agreementId, stakeAmount, stakePeriod, sign, checksum, url, agreement } = await prepareStakeAgreement()

            // fill up wallet
            await oceanToken.mint(alice, stakeAmount, { from: owner })

            // register DID
            await didRegistry.registerAttribute(agreement.did, checksum, url)

            // create agreement: as approved account - not for production ;)
            await agreementStoreManager.createAgreement(agreementId, ...Object.values(agreement))

            // stake: fulfill lock reward
            await oceanToken.approve(lockRewardCondition.address, stakeAmount, { from: alice })
            await lockRewardCondition.fulfill(agreementId, escrowReward.address, stakeAmount)
            assert.strictEqual(await getBalance(oceanToken, alice), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), stakeAmount)

            // unstake: fail to fulfill before stake period
            await assert.isRejected(
                signCondition.fulfill(agreementId, sign.message, sign.publicKey, sign.signature),
                constants.condition.epoch.error.isTimeLocked
            )

            // wait: for stake period
            await increaseTime(stakePeriod)

            // unstake: waited and fulfill after stake period
            await signCondition.fulfill(agreementId, sign.message, sign.publicKey, sign.signature)
            await escrowReward.fulfill(agreementId, stakeAmount, alice, alice, agreement.conditionIds[1], agreement.conditionIds[0])
            assert.strictEqual(await getBalance(oceanToken, alice), stakeAmount)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
        })
    })
})
