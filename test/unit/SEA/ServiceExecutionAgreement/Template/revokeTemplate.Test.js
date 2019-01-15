/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, beforeEach */

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const testUtils = require('../../../../helpers/utils.js')
const { initializeAgreement } = require('../../../../helpers/initializeAgreement')

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
        valueHashes = [testUtils.valueHash(['bool'], [true])]
        timeoutValues = [0]
        agreementId = testUtils.generateId()
    })

    describe('revokeTemplate', () => {
        it('Should not revoke by non template owner', async () => {
            // arrange
            await contract.setupTemplate(
                testUtils.templateId,
                [testUtils.dummyAddress],
                fingerprints,
                [0], [0], 0, { from: accounts[0] })

            // act-assert
            try {
                await contract.revokeTemplate(testUtils.templateId, { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Not a template owner')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not revoke template when state of agreement is false', async () => {
            // arrange

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
                await contract.revokeTemplate(testUtils.templateId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Owner can not revoke template!')
                assert.strictEqual(await contract.isTemplateRevoked(testUtils.templateId), false, 'Template did not revoked')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should revoke template', async () => {
            // arrange
            await contract.setupTemplate(
                testUtils.templateId,
                [testUtils.dummyAddress],
                fingerprints,
                [0], [0], 0, { from: accounts[0] })

            // act
            const result = await contract.revokeTemplate(testUtils.templateId, { from: accounts[0] })

            // assert
            testUtils.assertEmitted(result, 1, 'TemplateRevoked')
            const status = await contract.getTemplateStatus(testUtils.templateId)
            assert.strictEqual(status, false)
            assert.strictEqual(await contract.isTemplateRevoked(testUtils.templateId), true, 'Template did not revoked')
        })
    })
})
