/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const utils = require('./utils.js')

const web3 = utils.getWeb3()

contract('ServiceAgreement', (accounts) => {
    const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const templateId = '0x0000000000000000000000000000000000000000000000000000000000000001'
    const dummyAddress = '0x1111aaaaeeeeffffcccc22223333444455556666'
    let contract
    let consumer
    let contracts
    let fingerprints
    let valueHashes
    let timeoutValues
    let serviceAgreementId

    function createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer) {
        const conditionKeys = utils.generateConditionsKeys(templateId, contracts, fingerprints)
        const hash = utils.createSLAHash(web3, templateId, conditionKeys, valueHashes, timeoutValues, serviceAgreementId)
        return web3.eth.sign(hash, consumer)
    }

    beforeEach(async () => {
        contract = await ServiceAgreement.new({ from: accounts[0] })
        /* eslint-disable-next-line prefer-destructuring */
        consumer = accounts[1]
        contracts = [accounts[2]]
        fingerprints = ['0x2e0a37a5']
        valueHashes = [utils.valueHash(['bool'], [true])]
        timeoutValues = [0]
        serviceAgreementId = utils.generateId(web3)
    })

    describe('setupAgreementTemplate', () => {
        it('Should setup agreement without contracts', async () => {
            // act
            const result = await contract.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })

            // aassert
            utils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await contract.getTemplateStatus(templateId)
            assert.strictEqual(status, true)
        })

        it('Should accept same amount of contracts as fingerprints', async () => {
            // act-assert
            try {
                await contract.setupAgreementTemplate(templateId, [], ['0x1234'], [], emptyBytes32, [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'fingerprints and contracts length do not match')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should accept same amount of contracts as dependencies', async () => {
            // act-assert
            try {
                await contract.setupAgreementTemplate(templateId, ['0x1111aaaaeeeeffffcccc22223333444455556666'], ['0x1234'], [], emptyBytes32, [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'contracts and dependencies do not match')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should accept same or more amount of contracts as fulfillment indices', async () => {
            // act-assert
            try {
                await contract.setupAgreementTemplate(templateId, [dummyAddress], ['0x1234'], [1], emptyBytes32, [1, 2], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid fulfillment indices')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should accept same or more amount of fulfillment indices than fulfillment operators', async () => {
            // act-assert
            try {
                await contract.setupAgreementTemplate(templateId, [dummyAddress], ['0x1234'], [1], emptyBytes32, [1], 2, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid fulfillment operator')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should setup agreement with contracts', async () => {
            // act
            const result = await contract.setupAgreementTemplate(templateId, [dummyAddress], ['0x1234'], [1], emptyBytes32, [1], 1, { from: accounts[0] })

            // aassert
            utils.assertEmitted(result, 1, 'SetupCondition')
            utils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await contract.getTemplateStatus(templateId)
            assert.strictEqual(status, true)
        })

        it('Should setup unique agreement only', async () => {
            // arrange
            await contract.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })

            // act-aassert
            try {
                await contract.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Template ID already exists')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('executeAgreement', () => {
        it('Should execute exist agreement only', async () => {
            // act-aassert
            try {
                await contract.executeAgreement(templateId, '0x10', dummyAddress, [], [], emptyBytes32, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Template is revoked')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should execute agreement with valid timeout length only', async () => {
            // arrange
            await contract.setupAgreementTemplate(templateId, [dummyAddress], ['0x1234'], [1], emptyBytes32, [1], 1, { from: accounts[0] })

            // act-aassert
            try {
                await contract.executeAgreement(templateId, '0x10', dummyAddress, [], [], emptyBytes32, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid timeout values length')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should emit event ExecuteAgreement with false state when signature is not valid', async () => {
            // arrange
            await contract.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })

            // act
            const result = await contract.executeAgreement(templateId, '0x10', dummyAddress, [], [], emptyBytes32, emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ExecuteAgreement')
            assert.strictEqual(!!(result.logs.find(i => i.event === 'ExecuteAgreement').args.state), false)
        })

        it('Should execute condition when signature is valid', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })

            // act
            const result = await contract.executeAgreement(templateId, signature, consumer, [valueHashes[0]], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ExecuteCondition')
            utils.assertEmitted(result, 1, 'ExecuteAgreement')
        })

        it('Should revert when timeout can lead to race condition', async () => {
            // arrange
            timeoutValues = [1]
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })

            // act-assert
            try {
                await contract.executeAgreement(templateId, signature, consumer, [valueHashes[0]], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid timeout with a margin (~ 30 to 40 seconds = 2 blocks intervals) to avoid race conditions')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should execute condition when signature is valid and safe timeout', async () => {
            // arrange
            timeoutValues = [3]
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })

            // act
            const result = await contract.executeAgreement(templateId, signature, consumer, [valueHashes[0]], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ExecuteCondition')
            utils.assertEmitted(result, 1, 'ExecuteAgreement')
        })
    })

    describe('fulfillCondition', () => {
        it('Should not fulfill condition when controller handler is not valid', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })
            await contract.executeAgreement(templateId, signature, consumer, [valueHashes[0]], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })

            // act-assert
            try {
                await contract.fulfillCondition(serviceAgreementId, fingerprints[0], valueHashes[0], { from: accounts[1] })
            } catch (e) {
                assert.strictEqual(e.reason, 'unable to reconstruct the right condition hash')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill condition when controller handler is valid', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })
            await contract.executeAgreement(templateId, signature, consumer, [valueHashes[0]], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })

            // act
            const result = await contract.fulfillCondition(serviceAgreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })

            // assert
            utils.assertEmitted(result, 1, 'ConditionFulfilled')
        })

        it('Should not fulfill condition with unfulfilled dependency', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [1], templateId, [0], 0, { from: accounts[0] })
            await contract.executeAgreement(templateId, signature, consumer, [valueHashes[0]], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })

            // act-assert
            try {
                await contract.fulfillCondition(serviceAgreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'This condition has unfulfilled dependency')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill condition and lock dependencies when controller handler is valid', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [3], templateId, [0], 0, { from: accounts[0] })
            await contract.executeAgreement(templateId, signature, consumer, [valueHashes[0]], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })

            // act
            const result = await contract.fulfillCondition(serviceAgreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })

            // assert
            utils.assertEmitted(result, 1, 'ConditionFulfilled')
        })
    })

    describe('fulfillAgreement', () => {
        it('Should fulfill agreement with non pending conditions', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })
            await contract.executeAgreement(templateId, signature, consumer, [valueHashes[0]], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })
            await contract.fulfillCondition(serviceAgreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })

            // act
            const result = await contract.fulfillAgreement(serviceAgreementId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'AgreementFulfilled')
        })

        it('Should not fulfill agreement with pending conditions', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })
            await contract.executeAgreement(templateId, signature, consumer, [valueHashes[0]], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })

            // act-assert
            try {
                await contract.fulfillAgreement(serviceAgreementId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Indicating one of the fulfillment conditions is false')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('revokeAgreementTemplate', () => {
        it('Should revoke by template owner only', async () => {
            // arrange
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })

            // act-assert
            try {
                await contract.revokeAgreementTemplate(templateId, { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Not a template owner')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should revoke template', async () => {
            // arrange
            await contract.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })

            // act
            const result = await contract.revokeAgreementTemplate(templateId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'SLATemplateRevoked')
        })
    })
})
