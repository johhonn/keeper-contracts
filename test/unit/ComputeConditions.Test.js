/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ComputeConditions = artifacts.require('ComputeConditions.sol')
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
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
    const templateId = '0x0000000000000000000000000000000000000000000000000000000000000002'
    const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
    let agreement
    let contract
    let consumer
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let serviceAgreementId

    function getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId) {
        const conditionKeys = utils.generateConditionsKeys(templateId, contracts, fingerprints)
        return utils.createSLAHash(web3, templateId, conditionKeys, valueHashes, timeoutValues, serviceAgreementId)
    }

    function createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer) {
        const hash = getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId)
        return web3.eth.sign(hash, consumer)
    }

    async function initAgreement() {
        const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
        await agreement.setupAgreementTemplate(templateId, contracts, fingerprints, dependenciesBits, templateId, [0], 0, { from: accounts[0] })
        await agreement.executeAgreement(templateId, signature, consumer, [valueHashes], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })
    }

    beforeEach(async () => {
        agreement = await ServiceAgreement.new({ from: accounts[0] })
        contract = await ComputeConditions.new(agreement.address, { from: accounts[0] })
        /* eslint-disable-next-line prefer-destructuring */
        consumer = accounts[1]
        contracts = [contract.address]
        fingerprints = [utils.getSelector(web3, ComputeConditions, 'fulfillUpload')]
        dependenciesBits = [0]
        valueHashes = utils.valueHash(['bool'], [true])
        timeoutValues = [0]
        serviceAgreementId = utils.generateId(web3)
    })

    describe('submitHashSignature', () => {
        it('Should not submit when sender is not consumer', async () => {
            // act-assert
            try {
                await contract.submitHashSignature(serviceAgreementId, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid data scientist address!')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should submit', async () => {
            // arrange
            await initAgreement()

            // act
            const result = await contract.submitHashSignature(serviceAgreementId, emptyBytes32, { from: consumer })

            // assert
            utils.assertEmitted(result, 1, 'HashSignatureSubmitted')
        })

        it('Should re-submit when call submit twice', async () => {
            // arrange
            await initAgreement()
            await contract.submitHashSignature(serviceAgreementId, emptyBytes32, { from: consumer })

            // act
            const result = await contract.submitHashSignature(serviceAgreementId, emptyBytes32, { from: consumer })

            // assert
            utils.assertEmitted(result, 1, 'HashSignatureSubmitted')
            utils.assertEmitted(result, 1, 'ProofOfUploadInvalid')
        })
    })

    describe('submitAlgorithmHash', () => {
        it('Should not submit when sender is not publisher', async () => {
            // act-assert
            try {
                await contract.submitAlgorithmHash(serviceAgreementId, emptyBytes32, { from: consumer })
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
            const result = await contract.submitAlgorithmHash(serviceAgreementId, emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'HashSubmitted')
        })

        it('Should re-submit when call submit twice', async () => {
            // arrange
            await initAgreement()
            await contract.submitAlgorithmHash(serviceAgreementId, emptyBytes32, { from: accounts[0] })

            // act
            const result = await contract.submitAlgorithmHash(serviceAgreementId, emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'HashSubmitted')
            utils.assertEmitted(result, 1, 'ProofOfUploadInvalid')
        })
    })

    describe('fulfillUpload', () => {
        it('Should not fulfill upload when sender is not publisher or consumer', async () => {
            // act-assert
            try {
                await contract.fulfillUpload(serviceAgreementId, emptyBytes32, { from: accounts[2] })
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
            const result = await contract.fulfillUpload(serviceAgreementId, emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadValid')
        })

        it('Should not fulfill upload when hash exists, signature is not valid', async () => {
            // arrange
            await initAgreement()
            await contract.submitHashSignature(serviceAgreementId, emptyBytes32, { from: consumer })

            // act
            const result = await contract.fulfillUpload(serviceAgreementId, emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadInvalid')
        })

        it('Should not fulfill upload when unfulfilled dependencies exist', async () => {
            // arrange
            dependenciesBits = [1]
            await initAgreement()
            await contract.submitHashSignature(serviceAgreementId, emptyBytes32, { from: consumer })

            // act
            const result = await contract.fulfillUpload(serviceAgreementId, emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadInvalid')
        })

        it('Should fulfill upload when hash is valid', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await agreement.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })
            await agreement.executeAgreement(templateId, signature, consumer, [valueHashes], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })
            const hash = getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId)
            await contract.submitAlgorithmHash(serviceAgreementId, hash, { from: accounts[0] })

            // act
            const result = await contract.submitHashSignature(serviceAgreementId, signature, { from: consumer })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadValid')
        })

        it('Should not when proof is valid', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await agreement.setupAgreementTemplate(templateId, contracts, fingerprints, [0], templateId, [0], 0, { from: accounts[0] })
            await agreement.executeAgreement(templateId, signature, consumer, [valueHashes], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })
            const hash = getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId)
            await contract.submitAlgorithmHash(serviceAgreementId, hash, { from: accounts[0] })
            await contract.submitHashSignature(serviceAgreementId, signature, { from: consumer })

            // act-assert
            try {
                await contract.fulfillUpload(serviceAgreementId, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'avoid replay attack')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
