/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const AgreementTest = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../../../../helpers/utils.js')
const { signAgreement } = require('../../../../helpers/signAgreement.js')
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

    describe('fulfillAgreement', () => {
        it('Should fulfill agreement without pending conditions', async () => {
            // arrange
            await initializeAgreementWithValues()
            await contract.fulfillCondition(agreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })

            // act
            const result = await contract.fulfillAgreement(agreementId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'AgreementFulfilled')
            const isFulfilled = await contract.isAgreementFulfilled(agreementId, { from: accounts[0] })
            assert.strictEqual(isFulfilled, true)
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
})
