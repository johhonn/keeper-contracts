/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../../utils.js')

const web3 = utils.getWeb3()

contract('ServiceExecutionAgreement', (accounts) => {
    let contract
    let consumer
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let serviceAgreementId

    beforeEach(async () => {
        contract = await ServiceExecutionAgreement.new({ from: accounts[0] })
        /* eslint-disable-next-line prefer-destructuring */
        consumer = accounts[1]
        contracts = [accounts[2]]
        fingerprints = ['0x2e0a37a5']
        dependenciesBits = [0]
        valueHashes = [utils.valueHash(['bool'], [true])]
        timeoutValues = [0]
        serviceAgreementId = utils.generateId(web3)
    })

    describe('setupAgreementTemplate', () => {
        it('Should setup agreement without contracts', async () => {
            // act
            const result = await contract.setupTemplate(
                utils.templateId,
                [], [], [], [], 0, { from: accounts[0] }
            )
            // assert
            utils.assertEmitted(result, 1, 'TemplateSetup')
            const status = await contract.getTemplateStatus(utils.templateId)
            assert.strictEqual(status, true)
        })

        it('Should not accept different amount of contracts and fingerprints', async () => {
            // act-assert
            try {
                await contract.setupTemplate(
                    utils.templateId,
                    [],
                    ['0x1234'],
                    [], [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'fingerprints and contracts length do not match')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not accept different amount of contracts and dependencies', async () => {
            // act-assert
            try {
                await contract.setupTemplate(
                    utils.templateId,
                    [utils.dummyAddress],
                    ['0x1234'],
                    [], [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'contracts and dependencies do not match')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not accept less amount of contracts than fulfillment indices', async () => {
            // act-assert
            try {
                await contract.setupTemplate(
                    utils.templateId,
                    [utils.dummyAddress],
                    ['0x1234'],
                    [1], [1, 2], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid fulfillment indices')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not accept less amount of fulfillment indices than fulfillment operators', async () => {
            // act-assert
            try {
                await contract.setupTemplate(
                    utils.templateId,
                    [utils.dummyAddress],
                    ['0x1234'],
                    [1], [1], 2, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid fulfillment operator')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should setup agreement with contracts', async () => {
            // act
            const result = await contract.setupTemplate(
                utils.templateId,
                [utils.dummyAddress],
                ['0x1234'],
                [1], [1], 1, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ConditionSetup')
            utils.assertEmitted(result, 1, 'TemplateSetup')
            const status = await contract.getTemplateStatus(utils.templateId)
            assert.strictEqual(status, true)
        })

        it('Should setup unique agreement only', async () => {
            // arrange
            await contract.setupTemplate(
                utils.templateId,
                [], [], [], [], 0, { from: accounts[0] })

            // act-assert
            try {
                await contract.setupTemplate(
                    utils.templateId,
                    [], [], [], [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Template ID already exists')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('should generate correct condition keys', async () => {
            const conditionKey = await contract.generateConditionKey(
                '0x044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d',
                '0x9C7cf913DFb7346B267857D5f60fA6983e5eC1A9',
                '0x668453f0'
            )
            assert.strictEqual(
                await conditionKey,
                '0x14d19d3bab42c7847d73f351b9d9b251a364c50d1d1df4135293fb34ee26022e'
            )
        })

        it('Should return template owner', async () => {
            // arrange
            await contract.setupTemplate(utils.templateId, contracts, fingerprints, [0], [0], 0, { from: accounts[0] })

            // act
            const result = await contract.getTemplateOwner(utils.templateId, { from: accounts[0] })

            // assert
            assert.strictEqual(result, accounts[0])
        })
    })
})
