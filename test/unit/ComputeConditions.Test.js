/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ComputeConditions = artifacts.require('ComputeConditions.sol')
const Agreement = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../utils.js')

const web3 = utils.getWeb3()

contract('ComputeConditions constructor', (accounts) => {
    it('Should not deploy when agreement is empty', async () => {
        // act-assert
        try {
            await ComputeConditions.new(0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'invalid address')
            return
        }
        assert.fail('Expected revert not received')
    })
})

contract('ComputeConditions', (accounts) => {
    let agreement
    let contract
    let consumer
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let agreementId

    function getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, agreementId) {
        const conditionKeys = utils.generateConditionsKeys(utils.templateId, contracts, fingerprints)
        return utils.createSLAHash(web3, utils.templateId, conditionKeys, valueHashes, timeoutValues, agreementId)
    }

    function createSignature(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer) {
        const hash = getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, agreementId)
        return web3.eth.sign(hash, consumer)
    }

    async function initAgreement() {
        const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
        await agreement.setupTemplate(
            utils.templateId,
            contracts,
            fingerprints,
            dependenciesBits,
            [0], 0, { from: accounts[0] })
        await agreement.executeAgreement(utils.templateId, signature, consumer, [valueHashes], timeoutValues, agreementId, utils.templateId, { from: accounts[0] })
    }

    beforeEach(async () => {
        agreement = await Agreement.new({ from: accounts[0] })
        contract = await ComputeConditions.new(agreement.address, { from: accounts[0] })
        /* eslint-disable-next-line prefer-destructuring */
        consumer = accounts[1]
        contracts = [contract.address]
        fingerprints = [utils.getSelector(web3, ComputeConditions, 'fulfillUpload')]
        dependenciesBits = [0]
        valueHashes = utils.valueHash(['bool'], [true])
        timeoutValues = [0]
        agreementId = utils.generateId(web3)
    })

    describe('submitHashSignature', () => {
        it('Should not submit when sender is not consumer', async () => {
            // act-assert
            try {
                await contract.submitHashSignature(agreementId, utils.emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid data consumer address!')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should submit', async () => {
            // arrange
            await initAgreement()

            // act
            const result = await contract.submitHashSignature(agreementId, utils.emptyBytes32, { from: consumer })

            // assert
            utils.assertEmitted(result, 1, 'HashSignatureSubmitted')
        })

        it('Should re-submit when call submit twice', async () => {
            // arrange
            await initAgreement()
            await contract.submitHashSignature(agreementId, utils.emptyBytes32, { from: consumer })

            // act
            const result = await contract.submitHashSignature(agreementId, utils.emptyBytes32, { from: consumer })

            // assert
            utils.assertEmitted(result, 1, 'HashSignatureSubmitted')
            utils.assertEmitted(result, 1, 'ProofOfUploadInvalid')
        })
    })

    describe('submitAlgorithmHash', () => {
        it('Should not submit when sender is not publisher', async () => {
            // act-assert
            try {
                await contract.submitAlgorithmHash(agreementId, utils.emptyBytes32, { from: consumer })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid publisher address')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should submit', async () => {
            // arrange
            await initAgreement()

            // act
            const result = await contract.submitAlgorithmHash(agreementId, utils.emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'HashSubmitted')
        })

        it('Should re-submit when call submit twice', async () => {
            // arrange
            await initAgreement()
            await contract.submitAlgorithmHash(agreementId, utils.emptyBytes32, { from: accounts[0] })

            // act
            const result = await contract.submitAlgorithmHash(agreementId, utils.emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'HashSubmitted')
            utils.assertEmitted(result, 1, 'ProofOfUploadInvalid')
        })
    })

    describe('fulfillUpload', () => {
        it('Should not fulfill upload when sender is not publisher or consumer', async () => {
            // act-assert
            try {
                await contract.fulfillUpload(agreementId, utils.emptyBytes32, { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Access denied')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill upload when hash is absent', async () => { // IMO the scenario looks strange, I expect another behavior
            // arrange
            await initAgreement()

            // act
            const result = await contract.fulfillUpload(agreementId, utils.emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadValid')
        })

        it('Should not fulfill upload when hash exists, signature is not valid', async () => {
            // arrange
            await initAgreement()
            await contract.submitHashSignature(agreementId, utils.emptyBytes32, { from: consumer })

            // act
            const result = await contract.fulfillUpload(agreementId, utils.emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadInvalid')
        })

        it('Should not fulfill upload when unfulfilled dependencies exist', async () => {
            // arrange
            dependenciesBits = [1]
            await initAgreement()
            await contract.submitHashSignature(agreementId, utils.emptyBytes32, { from: consumer })

            // act
            const result = await contract.fulfillUpload(agreementId, utils.emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadInvalid')
        })

        it('Should fulfill upload when hash is valid', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
            await agreement.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints,
                [0], [0], 0, { from: accounts[0] })
            await agreement.executeAgreement(utils.templateId, signature, consumer, [valueHashes], timeoutValues, agreementId, utils.templateId, { from: accounts[0] })
            const hash = getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, agreementId)
            await contract.submitAlgorithmHash(agreementId, hash, { from: accounts[0] })

            // act
            const result = await contract.submitHashSignature(agreementId, signature, { from: consumer })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadValid')
        })

        it('Should not when proof is valid', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
            await agreement.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints,
                [0], [0], 0, { from: accounts[0] })
            await agreement.executeAgreement(utils.templateId, signature, consumer, [valueHashes], timeoutValues, agreementId, utils.templateId, { from: accounts[0] })
            const hash = getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, agreementId)
            await contract.submitAlgorithmHash(agreementId, hash, { from: accounts[0] })
            await contract.submitHashSignature(agreementId, signature, { from: consumer })

            // act-assert
            try {
                await contract.fulfillUpload(agreementId, utils.emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'avoid replay attack')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
