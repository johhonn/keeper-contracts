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
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition')
const EscrowReward = artifacts.require('EscrowReward')
const EscrowAccessSecretStoreTemplate = artifacts.require('EscrowAccessSecretStoreTemplate')

const constants = require('../../helpers/constants.js')
const getBalance = require('../../helpers/getBalance.js')
const increaseTime = require('../../helpers/increaseTime.js')

contract('Escrow Access Secret Store integration test', (accounts) => {
    let lockRewardCondition,
        escrowReward,
        accessSecretStoreCondition,
        escrowAccessSecretStoreTemplate,
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

        accessSecretStoreCondition = await AccessSecretStoreCondition.new({ from: deployer })

        await accessSecretStoreCondition.initialize(
            owner,
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: deployer }
        )

        escrowReward = await EscrowReward.new({ from: deployer })
        await escrowReward.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: deployer }
        )

        escrowAccessSecretStoreTemplate = await EscrowAccessSecretStoreTemplate.new({ from: deployer })
        await escrowAccessSecretStoreTemplate.methods['initialize(address,address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            didRegistry.address,
            accessSecretStoreCondition.address,
            lockRewardCondition.address,
            escrowReward.address,
            { from: deployer }
        )

        // propose and approve template
        const templateId = escrowAccessSecretStoreTemplate.address
        await templateStoreManager.proposeTemplate(templateId)
        await templateStoreManager.approveTemplate(templateId, { from: owner })

        return {
            oceanToken,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateId,
            owner
        }
    }

    async function prepareEscrowAgreement({
        agreementId = constants.bytes32.one,
        sender = accounts[0],
        receiver = accounts[1],
        escrowAmount = 10,
        timeLockAccess = 0,
        timeOutAccess = 0,
        did = constants.did[0],
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        // generate IDs from attributes
        const conditionIdAccess = await accessSecretStoreCondition.generateId(agreementId, await accessSecretStoreCondition.hashValues(did, receiver))
        const conditionIdLock = await lockRewardCondition.generateId(agreementId, await lockRewardCondition.hashValues(escrowReward.address, escrowAmount))
        const conditionIdEscrow = await escrowReward.generateId(agreementId, await escrowReward.hashValues(escrowAmount, receiver, sender, conditionIdLock, conditionIdAccess))

        // construct agreement
        const agreement = {
            did: did,
            conditionIds: [
                conditionIdAccess,
                conditionIdLock,
                conditionIdEscrow
            ],
            timeLocks: [timeLockAccess, 0, 0],
            timeOuts: [timeOutAccess, 0, 0],
            consumer: receiver
        }
        return {
            agreementId,
            agreement,
            sender,
            receiver,
            escrowAmount,
            timeLockAccess,
            timeOutAccess,
            checksum,
            url
        }
    }

    describe('create and fulfill escrow agreement', () => {
        it('should create escrow agreement and fulfill', async () => {
            const { oceanToken, didRegistry, agreementStoreManager, conditionStoreManager, owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, agreement, sender, receiver, escrowAmount, checksum, url } = await prepareEscrowAgreement()

            // register DID
            await didRegistry.registerAttribute(agreement.did, checksum, url)

            // create agreement
            await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // check state of agreement and conditions
            expect((await agreementStoreManager.getAgreement(agreementId)).did)
                .to.equal(constants.did[0])

            const conditionTypes = await escrowAccessSecretStoreTemplate.getConditionTypes()
            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
            })

            // fill up wallet
            await oceanToken.mint(sender, escrowAmount, { from: owner })

            assert.strictEqual(await getBalance(oceanToken, sender), escrowAmount)
            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), 0)

            // fulfill lock reward
            await oceanToken.approve(lockRewardCondition.address, escrowAmount, { from: sender })
            await lockRewardCondition.fulfill(agreementId, escrowReward.address, escrowAmount)

            assert.strictEqual(await getBalance(oceanToken, sender), 0)
            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), escrowAmount)
            assert.strictEqual(await getBalance(oceanToken, receiver), 0)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            // fulfill access
            await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)

            // get reward
            await escrowReward.fulfill(agreementId, escrowAmount, receiver, sender, agreement.conditionIds[1], agreement.conditionIds[0])

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.fulfilled
            )

            assert.strictEqual(await getBalance(oceanToken, sender), 0)
            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), escrowAmount)
        })

        it('should create escrow agreement and abort after timeout', async () => {
            const { oceanToken, didRegistry, conditionStoreManager, owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, agreement, sender, receiver, escrowAmount, timeOutAccess, checksum, url } = await prepareEscrowAgreement({ timeOutAccess: 10 })

            // register DID
            await didRegistry.registerAttribute(agreement.did, checksum, url)

            // create agreement
            await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // fill up wallet
            await oceanToken.mint(sender, escrowAmount, { from: owner })

            // fulfill lock reward
            await oceanToken.approve(lockRewardCondition.address, escrowAmount, { from: sender })
            await lockRewardCondition.fulfill(agreementId, escrowReward.address, escrowAmount)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            // wait: for time out
            await increaseTime(timeOutAccess)

            // abort: fulfill access after timeout
            await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.aborted)

            // refund
            await escrowReward.fulfill(agreementId, escrowAmount, receiver, sender, agreement.conditionIds[1], agreement.conditionIds[0])
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.fulfilled
            )
            assert.strictEqual(await getBalance(oceanToken, receiver), 0)
            assert.strictEqual(await getBalance(oceanToken, sender), escrowAmount)
        })
    })

    describe('create and fulfill escrow agreement with access secret store and timeLock', () => {
        it('should create escrow agreement and fulfill', async () => {
            const { oceanToken, didRegistry, conditionStoreManager, owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, agreement, sender, receiver, escrowAmount, timeLockAccess, checksum, url } = await prepareEscrowAgreement({ timeLockAccess: 10 })

            // register DID
            await didRegistry.registerAttribute(agreement.did, checksum, url)
            // fill up wallet
            await oceanToken.mint(sender, escrowAmount, { from: owner })

            // create agreement
            await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // fulfill lock reward
            await oceanToken.approve(lockRewardCondition.address, escrowAmount, { from: sender })
            await lockRewardCondition.fulfill(agreementId, escrowReward.address, escrowAmount)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)
            expect(await accessSecretStoreCondition.checkPermissions(receiver, agreement.did)).to.equal(false)

            // fail: fulfill access before time lock
            await assert.isRejected(
                accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver),
                constants.condition.epoch.error.isTimeLocked
            )
            expect(await accessSecretStoreCondition.checkPermissions(receiver, agreement.did)).to.equal(false)

            // wait: for time lock
            await increaseTime(timeLockAccess)

            // execute: fulfill access after time lock
            await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)
            expect(await accessSecretStoreCondition.checkPermissions(receiver, agreement.did)).to.equal(true)

            // execute payment
            await escrowReward.fulfill(agreementId, escrowAmount, receiver, sender, agreement.conditionIds[1], agreement.conditionIds[0])
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.fulfilled
            )
            assert.strictEqual(await getBalance(oceanToken, sender), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), escrowAmount)
        })
    })
})
