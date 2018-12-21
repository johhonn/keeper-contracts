/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const AgreementTest = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../../helpers/utils.js')
const { signAgreement } = require('../../helpers/signAgreement.js')
const { initializeAgreement } = require('../../helpers/initializeAgreement.js')

const web3 = utils.getWeb3()

contract('ServiceExecutionAgreement', (accounts) => {
    let contract
    let consumer
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let agreementId

    beforeEach(async () => {
        contract = await AgreementTest.new({ from: accounts[0] })
        /* eslint-disable-next-line prefer-destructuring */
        consumer = accounts[1]
        contracts = [accounts[2]]
        fingerprints = ['0x2e0a37a5']
        dependenciesBits = [0]
        valueHashes = [utils.valueHash(['bool'], [true])]
        timeoutValues = [0]
        agreementId = utils.generateId()
    })

    async function initializeAgreementWithValues() {
        return initializeAgreement(
            contract,
            accounts[0],
            consumer,
            contracts,
            agreementId,
            fingerprints,
            valueHashes,
            timeoutValues,
            dependenciesBits)
    }

    describe('initialize', () => {
        it('Should initialize existing template only', async () => {
            // act-aassert
            try {
                await contract.initializeAgreement(
                    utils.templateId,
                    '0x10',
                    utils.dummyAddress,
                    [], [],
                    utils.emptyBytes32,
                    utils.emptyBytes32,
                    { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Template is revoked')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not initialize agreement with invalid timeout length', async () => {
            // arrange
            await contract.setupTemplate(
                utils.templateId,
                [utils.dummyAddress],
                ['0x1234'],
                [1], [1], 1, { from: accounts[0] })

            // act-assert
            try {
                await contract.initializeAgreement(
                    utils.templateId,
                    '0x10',
                    utils.dummyAddress,
                    [], [],
                    utils.emptyBytes32,
                    utils.emptyBytes32,
                    { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid timeout values length')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not initialize agreement (revert) when signature is not valid', async () => {
            // arrange
            await contract.setupTemplate(utils.templateId, [], [], [], [], 0, { from: accounts[0] })

            // act-assert
            try {
                await contract.initializeAgreement(
                    utils.templateId,
                    '0x10',
                    utils.dummyAddress,
                    [], [],
                    utils.emptyBytes32,
                    utils.emptyBytes32,
                    { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid consumer signature of service agreement')
                return
            }
            assert.fail('Expected revert not received on invalid signature')
        })

        it('Should generate correct SA hash', async () => {
            const hash = await contract.hashAgreement(
                '0x044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d',
                [
                    '0x313d20f9cda19e1f5702af79e5ebfa7cb434918722f9b334000ea71cdaac1614',
                    '0x38163b4835d3b0c780fcdf6a872e3e86f84393a0bda8e8b642df39a8d05c4c1a',
                    '0x477f516713f4b0de54d0e0f4429f593c63f2dd2ca4789633e02a446c7978f3cb',
                    '0x385d3af26f7c057688a4988fb784c392a97ce472a4feb4435968fed04809e8dc'
                ],
                [
                    '0xe22c53920ef13735afb38bcca139c61c2cb03fd7173f7ca2f3742debcc04d1d7',
                    '0x703a1ab20a35c530599b46b5e1e699eaa2b6439b686d22d70a353d759dd1ed87',
                    '0xe22c53920ef13735afb38bcca139c61c2cb03fd7173f7ca2f3742debcc04d1d7',
                    '0xe22c53920ef13735afb38bcca139c61c2cb03fd7173f7ca2f3742debcc04d1d7'
                ],
                [0, 0, 0, 600],
                '0x29cea46c71dd4d08817b3dffe4d9e4125fa68d33cf6c4196a724deab77e5b68c',
                { from: accounts[0] }
            )
            assert.strictEqual(
                hash,
                '0x52bebd767d0e6f0add6ab80ea87c5293499aa7845bae3ac13a4b162a1bde9087'
            )
        })

        it('Should generate correct prefix SA hash', async () => {
            const prefixedHash = await contract.prefixHash(
                '0x52bebd767d0e6f0add6ab80ea87c5293499aa7845bae3ac13a4b162a1bde9087',
                { from: accounts[0] }
            )
            assert.strictEqual(
                prefixedHash,
                '0x225cded94ed000b85624acb3090384c7676fe920939ba66d994b7fd54459b85a'
            )
        })

        it('Should recover addresses correctly', async () => {
            // act
            const result = await contract.recoverAddress(
                '0x225cded94ed000b85624acb3090384c7676fe920939ba66d994b7fd54459b85a',
                '0x89e0243d7bd929e499b18640565a532bebe490cbe7cfec432462e47e702852284e6cc334870e8be586388af53b524ca6773de977270940a0239f06524fcd25891b',
                { from: accounts[0] })

            // assert
            assert.strictEqual(
                result,
                '0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e'
            )
        })

        it('Should initialize condition when signature is valid', async () => {
            // arrange
            const signature = await signAgreement(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
            await contract.setupTemplate(
                utils.templateId, contracts, fingerprints, [0], [0], 0, { from: accounts[0] })

            // act
            const result = await contract.initializeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, agreementId, utils.templateId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ConditionInitialized')
            utils.assertEmitted(result, 1, 'AgreementInitialized')
        })

        it('Should revert when timeout can lead to race condition', async () => {
            // arrange
            timeoutValues = [1]
            const signature = await signAgreement(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
            await contract.setupTemplate(utils.templateId, contracts, fingerprints, [0], [0], 0, { from: accounts[0] })

            // act-assert
            try {
                await contract.initializeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, agreementId, utils.templateId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid timeout with a margin (~ 30 to 40 seconds = 2 blocks intervals) to avoid race conditions')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should initialize condition when signature is valid and safe timeout', async () => {
            // arrange
            timeoutValues = [3]
            const signature = await signAgreement(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
            await contract.setupTemplate(utils.templateId, contracts, fingerprints, [0], [0], 0, { from: accounts[0] })

            // act
            const result = await contract.initializeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, agreementId, utils.templateId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ConditionInitialized')
            utils.assertEmitted(result, 1, 'AgreementInitialized')
        })
    })

    describe('fulfillCondition', () => {
        it('Should not fulfill condition when controller handler is not valid', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act-assert
            try {
                await contract.fulfillCondition(agreementId, fingerprints[0], valueHashes[0], { from: accounts[1] })
            } catch (e) {
                assert.strictEqual(e.reason, 'unable to reconstruct the right condition hash')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill condition when controller handler is valid', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act
            const result = await contract.fulfillCondition(agreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })

            // assert
            utils.assertEmitted(result, 1, 'ConditionFulfilled')
        })

        it('Should not fulfill condition with unfulfilled dependency', async () => {
            // arrange
            dependenciesBits = [1]
            await initializeAgreementWithValues()

            // act-assert
            try {
                await contract.fulfillCondition(agreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'This condition has unfulfilled dependency')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill condition and lock dependencies when controller handler is valid', async () => {
            // arrange
            dependenciesBits = [3]
            await initializeAgreementWithValues()

            // act
            const result = await contract.fulfillCondition(agreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })

            // assert
            utils.assertEmitted(result, 1, 'ConditionFulfilled')
        })
    })

    describe('fulfillAgreement', () => {
        it('Should fulfill agreement without pending conditions', async () => {
            // arrange
            await initializeAgreementWithValues()
            await contract.fulfillCondition(agreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })

            // act
            const result = await contract.fulfillAgreement(agreementId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'AgreementFulfilled')
            const isTerminated = await contract.isAgreementTerminated(agreementId, { from: accounts[0] })
            assert.strictEqual(isTerminated, true)
            const agreementAvailable = await contract.isAgreementAvailable(agreementId, { from: accounts[0] })
            assert.strictEqual(agreementAvailable, true)
        })

        it('Should not fulfill agreement with pending conditions', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act-assert
            try {
                await contract.fulfillAgreement(agreementId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Indicating one of the fulfillment conditions is false')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not fulfill agreement with pending conditions when single operator', async () => {
            // arrange
            const signature = await signAgreement(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
            await contract.setupTemplate(utils.templateId, contracts, fingerprints, [0], [0], 1, { from: accounts[0] })
            await contract.initializeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, agreementId, utils.templateId, { from: accounts[0] })

            // act-assert
            try {
                await contract.fulfillAgreement(agreementId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Indicating all fulfillment conditions are false')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not fulfill agreement with pending conditions when multiple operators', async () => {
            // arrange
            contracts = [accounts[2], accounts[2]]
            fingerprints = ['0x2e0a37a5', '0x2e0a37a6']
            valueHashes = [utils.valueHash(['bool'], [true]), utils.valueHash(['bool'], [true])]
            timeoutValues = [0, 0]
            const signature = await signAgreement(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
            await contract.setupTemplate(utils.templateId, contracts, fingerprints, [0, 0], [0, 1], 2, { from: accounts[0] })
            await contract.initializeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, agreementId, utils.templateId, { from: accounts[0] })

            // act-assert
            try {
                await contract.fulfillAgreement(agreementId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Indicating N of M fulfillment conditions are false')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('getConditionStatus', () => {
        it('Should not return condition status for non exists condition', async () => {
            // arrange
            dependenciesBits = [3]
            await initializeAgreementWithValues()

            // act-assert
            try {
                await contract.getConditionStatus(agreementId, utils.emptyBytes32, { from: accounts[0] })
            } catch (e) {
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should return condition status', async () => {
            // arrange
            dependenciesBits = [3]
            await initializeAgreementWithValues()
            const conditionKey = await contract.generateConditionKeyForId(agreementId, contracts[0], fingerprints[0], { from: accounts[0] })

            // act
            const result = await contract.getConditionStatus(agreementId, conditionKey, { from: accounts[0] })

            // assert
            assert.strictEqual(result.toNumber(), 0)
        })
    })

    describe('conditionTimedOut', () => {
        it('Should return true when condition timeout matches', async () => {
            // arrange
            dependenciesBits = [3]
            await initializeAgreementWithValues()
            const conditionKey = await contract.generateConditionKeyForId(agreementId, contracts[0], fingerprints[0], { from: accounts[0] })

            // act
            const result = await contract.conditionTimedOut(agreementId, conditionKey, { from: accounts[0] })

            // assert
            assert.strictEqual(result, true)
        })

        it('Should return false when condition timeout does not match', async () => {
            // arrange
            timeoutValues = [100]
            dependenciesBits = [3]
            await initializeAgreementWithValues()
            const conditionKey = await contract.generateConditionKeyForId(agreementId, contracts[0], fingerprints[0], { from: accounts[0] })

            // act
            const result = await contract.conditionTimedOut(agreementId, conditionKey, { from: accounts[0] })

            // assert
            assert.strictEqual(result, false)
        })
    })

    describe('views', () => {
        it('Should return current block', async () => {
            // act
            const result = await contract.getCurrentBlockNumber({ from: accounts[0] })

            // assert
            assert.isOk(result > 0)
        })
    })
})
