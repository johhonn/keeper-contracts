/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, beforeEach */

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const testUtils = require('../../../../helpers/utils.js')
const { initializeAgreement } = require('../../../../helpers/initializeAgreement.js')

contract('ServiceExecutionAgreement', (accounts) => {
    let sea
    /* eslint-disable-next-line prefer-destructuring */
    const consumer = accounts[1]
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let agreementId

    beforeEach(async () => {
        sea = await ServiceExecutionAgreement.new({ from: accounts[0] })
        contracts = [accounts[2]]
        fingerprints = ['0x2e0a37a5']
        dependenciesBits = [0]
        valueHashes = [testUtils.valueHash(['bool'], [true])]
        timeoutValues = [0]
        agreementId = testUtils.generateId()
    })

    async function initializeAgreementWithValues() {
        return initializeAgreement(
            sea,
            accounts[0],
            consumer,
            contracts,
            agreementId,
            fingerprints,
            valueHashes,
            timeoutValues,
            dependenciesBits)
    }

    describe('getConditionStatus', () => {
        it('Should not return condition status for non exists condition', async () => {
            // arrange
            dependenciesBits = [3]
            await initializeAgreementWithValues()

            // act-assert
            try {
                await sea.getConditionStatus(agreementId, testUtils.emptyBytes32, { from: accounts[0] })
            } catch (e) {
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should return condition status', async () => {
            // arrange
            dependenciesBits = [3]
            await initializeAgreementWithValues()
            const conditionKey = await sea.generateConditionKeyForId(agreementId, contracts[0], fingerprints[0], { from: accounts[0] })

            // act
            const result = await sea.getConditionStatus(agreementId, conditionKey, { from: accounts[0] })

            // assert
            assert.strictEqual(result.toNumber(), 0)
        })
    })
})
