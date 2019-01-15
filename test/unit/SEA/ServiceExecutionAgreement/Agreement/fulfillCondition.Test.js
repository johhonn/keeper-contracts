/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const AgreementTest = artifacts.require('ServiceExecutionAgreement.sol')
const testUtils = require('../../../../helpers/utils.js')
const { initializeAgreement } = require('../../../../helpers/initializeAgreement.js')

contract('ServiceExecutionAgreement', (accounts) => {
    let contract
    /* eslint-disable-next-line prefer-destructuring */
    const consumer = accounts[1]
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let agreementId

    beforeEach(async () => {
        contract = await AgreementTest.new({ from: accounts[0] })
        contracts = [accounts[2]]
        fingerprints = ['0x2e0a37a5']
        dependenciesBits = [0]
        valueHashes = [testUtils.valueHash(['bool'], [true])]
        timeoutValues = [0]
        agreementId = testUtils.generateId()
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

    describe('fulfillCondition', () => {
        it('Should not fulfill condition when controller handler is not valid', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act-assert
            try {
                await contract.fulfillCondition(
                    agreementId,
                    fingerprints[0],
                    valueHashes[0],
                    { from: accounts[1] })
            } catch (e) {
                assert.strictEqual(
                    e.reason,
                    'unable to reconstruct the right condition hash')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill condition when controller handler is valid', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act
            const result = await contract.fulfillCondition(
                agreementId,
                fingerprints[0],
                valueHashes[0],
                { from: accounts[2] })

            // assert
            testUtils.assertEmitted(result, 1, 'ConditionFulfilled')
        })

        it('Should not fulfill condition with unfulfilled dependency', async () => {
            // arrange
            dependenciesBits = [1]
            await initializeAgreementWithValues()

            // act-assert
            try {
                await contract.fulfillCondition(
                    agreementId,
                    fingerprints[0],
                    valueHashes[0],
                    { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(
                    e.reason,
                    'This condition has unfulfilled dependency')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill condition and lock dependencies when controller handler is valid', async () => {
            // arrange
            dependenciesBits = [3]
            await initializeAgreementWithValues()

            // act
            const result = await contract.fulfillCondition(
                agreementId,
                fingerprints[0],
                valueHashes[0],
                { from: accounts[2] })

            // assert
            testUtils.assertEmitted(result, 1, 'ConditionFulfilled')
        })
    })
})
