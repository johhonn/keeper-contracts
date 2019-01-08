/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../../../../helpers/utils.js')
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
        contract = await ServiceExecutionAgreement.new({ from: accounts[0] })
        contracts = [utils.dummyAddress]
        fingerprints = [utils.emptyBytes32]
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
})
