/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const OceanToken = artifacts.require('OceanToken')
const LockRewardCondition = artifacts.require('LockRewardCondition')
const EscrowReward = artifacts.require('EscrowReward')

const constants = require('../../../helpers/constants.js')
const getBalance = require('../../../helpers/getBalance.js')
const testUtils = require('../../../helpers/utils.js')

contract('EscrowReward constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        owner = accounts[1]
    } = {}) {
        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

        const conditionStoreManager = await ConditionStoreManager.new()
        await conditionStoreManager.initialize(
            owner,
            createRole,
            { from: owner }
        )

        const oceanToken = await OceanToken.new()
        await oceanToken.initialize(owner, owner)

        const lockRewardCondition = await LockRewardCondition.new()
        await lockRewardCondition.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: owner }
        )

        const escrowReward = await EscrowReward.new()
        await escrowReward.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: createRole }
        )

        return {
            escrowReward,
            lockRewardCondition,
            oceanToken,
            conditionStoreManager,
            conditionId,
            conditionType,
            createRole,
            owner
        }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const conditionStoreManager = await ConditionStoreManager.new()
            const oceanToken = await OceanToken.new()

            const escrowReward = await EscrowReward.new()
            await escrowReward.initialize(
                accounts[0],
                conditionStoreManager.address,
                oceanToken.address,
                { from: accounts[0] }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist', async () => {
            await setupTest()
            const { escrowReward } = await setupTest()

            let nonce = constants.bytes32.one
            let lockConditionId = accounts[2]
            let releaseConditionId = accounts[3]
            let sender = accounts[0]
            let receiver = accounts[1]
            let amount = 10

            await assert.isRejected(
                escrowReward.fulfill(
                    nonce,
                    amount,
                    receiver,
                    sender,
                    lockConditionId,
                    releaseConditionId),
                constants.condition.reward.escrowReward.error.lockConditionIdDoesNotMatch
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist for account address', async () => {
            const {
                escrowReward,
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

            let nonce = constants.bytes32.one
            let sender = accounts[0]
            let receiver = accounts[1]
            let amount = 10

            let hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            let conditionLockId = await lockRewardCondition.generateId(nonce, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            let lockConditionId = conditionLockId
            let releaseConditionId = conditionLockId

            let hashValues = await escrowReward.hashValues(
                amount,
                receiver,
                sender,
                lockConditionId,
                releaseConditionId)
            let conditionId = await escrowReward.generateId(nonce, hashValues)

            await conditionStoreManager.createCondition(
                constants.bytes32.one,
                escrowReward.address)

            await conditionStoreManager.createCondition(
                conditionId,
                escrowReward.address)

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(nonce, escrowReward.address, amount)

            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), amount)

            const result = await escrowReward.fulfill(
                nonce,
                amount,
                receiver,
                sender,
                lockConditionId,
                releaseConditionId)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(nonce)
            expect(eventArgs._conditionId).to.equal(conditionId)
            expect(eventArgs._receiver).to.equal(receiver)
            expect(eventArgs._amount.toNumber()).to.equal(amount)

            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), amount)

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(escrowReward.address, amount, { from: sender })
            await oceanToken.transfer(escrowReward.address, amount, { from: sender })

            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), amount)
            await assert.isRejected(
                escrowReward.fulfill(nonce, amount, receiver, sender, lockConditionId, releaseConditionId),
                constants.condition.state.error.invalidStateTransition
            )
        })
    })

    describe('only fulfill conditions once', () => {
        it('do not allow rewards to be fulfilled twice', async () => {
            const {
                escrowReward,
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

            const nonce1 = constants.bytes32.one
            const sender = accounts[0]
            const attacker = accounts[2]
            const amount = 10

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            const conditionLockId = await lockRewardCondition.generateId(nonce1, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            await conditionStoreManager.createCondition(
                constants.bytes32.one,
                escrowReward.address)

            /* simulate a real environment by giving the EscrowReward contract a bunch of tokens: */
            await oceanToken.mint(escrowReward.address, 100, { from: owner })

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            /* fulfill the lock condition */

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(nonce1, escrowReward.address, amount)

            const escrowRewardBalance = 110

            /* attacker creates escrowRewardBalance/amount bogus conditions to claim the locked reward: */

            for (let i = 0; i < escrowRewardBalance / amount; ++i) {
                let nonce = (3 + i).toString(16)
                while (nonce.length < 32 * 2) {
                    nonce = '0' + nonce
                }
                const attackNonce = '0x' + nonce
                const attackerHashValues = await escrowReward.hashValues(
                    amount,
                    attacker,
                    attacker,
                    lockConditionId,
                    releaseConditionId)
                const attackerConditionId = await escrowReward.generateId(attackNonce, attackerHashValues)

                await conditionStoreManager.createCondition(
                    attackerConditionId,
                    escrowReward.address)

                /* attacker tries to claim the escrow before the legitimate users: */
                await assert.isRejected(
                    escrowReward.fulfill(
                        attackNonce,
                        amount,
                        attacker,
                        attacker,
                        lockConditionId,
                        releaseConditionId),
                    constants.condition.reward.escrowReward.error.lockConditionIdDoesNotMatch
                )
            }

            /* make sure the EscrowReward contract didn't get drained */
            assert.notStrictEqual(
                (await oceanToken.balanceOf(escrowReward.address)).toNumber(),
                0
            )
        })
    })
})
