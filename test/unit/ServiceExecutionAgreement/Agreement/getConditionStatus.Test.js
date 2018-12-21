/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const AgreementTest = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../../../helpers/utils.js')
const { initializeAgreement } = require('../../../helpers/initializeAgreement.js')

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
})
