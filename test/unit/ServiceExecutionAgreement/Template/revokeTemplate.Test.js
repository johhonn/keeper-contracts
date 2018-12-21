/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../../../helpers/utils.js')
const { initializeAgreement } = require('../../../helpers/initializeAgreement')
const web3 = utils.getWeb3()

contract('ServiceExecutionAgreement', (accounts) => {
    let contract,
        consumer,
        contracts,
        fingerprints,
        dependenciesBits,
        valueHashes,
        timeoutValues,
        agreementId

    beforeEach(async () => {
        contract = await ServiceExecutionAgreement.new({ from: accounts[0] })
        fingerprints = ['0x2e0a37a5']
        /* eslint-disable-next-line prefer-destructuring */
        consumer = accounts[1]
        contracts = [accounts[2]]
        fingerprints = ['0x2e0a37a5']
        dependenciesBits = [0]
        valueHashes = [utils.valueHash(['bool'], [true])]
        timeoutValues = [0]
        agreementId = utils.generateId()
    })

    describe('revokeTemplate', () => {
        it('Should not revoke by non template owner', async () => {
            // arrange
            await contract.setupTemplate(
                utils.templateId,
                [utils.dummyAddress],
                fingerprints,
                [0], [0], 0, { from: accounts[0] })

            // act-assert
            try {
                await contract.revokeTemplate(utils.templateId, { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Not a template owner')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not revoke template when state of agreement is false', async () => {
            // arrange

            console.log(initializeAgreement)
            await initializeAgreement(
                contract,
                accounts[0],
                consumer,
                contracts,
                agreementId,
                fingerprints,
                valueHashes,
                timeoutValues,
                dependenciesBits)

            // act-assert
            try {
                await contract.revokeTemplate(utils.templateId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Owner can not revoke template!')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should revoke template', async () => {
            // arrange
            await contract.setupTemplate(
                utils.templateId,
                [utils.dummyAddress],
                fingerprints,
                [0], [0], 0, { from: accounts[0] })

            // act
            const result = await contract.revokeTemplate(utils.templateId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'TemplateRevoked')
            const status = await contract.getTemplateStatus(utils.templateId)
            assert.strictEqual(status, false)
        })
    })
})
