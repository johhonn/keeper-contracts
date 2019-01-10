/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ComputeConditions = artifacts.require('ComputeConditions.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')

const utils = require('../../../helpers/utils.js')
const { hashAgreement } = require('../../../helpers/hashAgreement.js')
const { signAgreement } = require('../../../helpers/signAgreement.js')
const { initializeAgreement } = require('../../../helpers/initializeAgreement.js')

const web3 = utils.getWeb3()

contract('ComputeConditions', (accounts) => {
    let sea
    let computeConditions
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
        computeConditions = await ComputeConditions.new(sea.address, { from: accounts[0] })
        contracts = [computeConditions.address]
        fingerprints = [utils.getSelector(web3, ComputeConditions, 'fulfillUpload')]
        dependenciesBits = [0]
        valueHashes = [utils.valueHash(['bool'], [true])]
        timeoutValues = [0]
        agreementId = utils.generateId()
    })

    function getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, agreementId) {
        const conditionKeys = utils.generateConditionsKeys(utils.templateId, contracts, fingerprints)
        return hashAgreement(
            utils.templateId,
            conditionKeys,
            valueHashes,
            timeoutValues,
            agreementId
        )
    }

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

    describe('fulfillUpload', () => {
        it('Should not fulfill upload when sender is not publisher or consumer', async () => {
            // act-assert
            try {
                await computeConditions.fulfillUpload(agreementId, utils.emptyBytes32, { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Access denied')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill upload when hash is absent', async () => { // IMO the scenario looks strange, I expect another behavior
            // arrange
            await initializeAgreementWithValues()

            // act
            const result = await computeConditions.fulfillUpload(agreementId, utils.emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadValid')
        })

        it('Should not fulfill upload when hash exists, signature is not valid', async () => {
            // arrange
            await initializeAgreementWithValues()
            await computeConditions.submitHashSignature(agreementId, utils.emptyBytes32, { from: consumer })

            // act
            const result = await computeConditions.fulfillUpload(agreementId, utils.emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadInvalid')
        })

        it('Should not fulfill upload when unfulfilled dependencies exist', async () => {
            // arrange
            dependenciesBits = [1]
            await initializeAgreementWithValues()
            await computeConditions.submitHashSignature(agreementId, utils.emptyBytes32, { from: consumer })

            // act
            try{
                await computeConditions.fulfillUpload(agreementId, utils.emptyBytes32, { from: accounts[0] })
            }
            catch (e) {
                assert.strictEqual(e.reason, 'condition has unfulfilled dependencies')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill upload when hash is valid', async () => {
            // arrange
            const signature = await signAgreement(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
            await sea.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints,
                [0], [0], 0, { from: accounts[0] })
            await sea.initializeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, agreementId, utils.templateId, { from: accounts[0] })
            const hash = getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, agreementId)
            await computeConditions.submitAlgorithmHash(agreementId, hash, { from: accounts[0] })

            // act
            const result = await computeConditions.submitHashSignature(agreementId, signature, { from: consumer })

            // assert
            utils.assertEmitted(result, 1, 'ProofOfUploadValid')
        })

        it('Should not fulfill upload when proof is valid', async () => {
            // arrange
            const signature = await signAgreement(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
            await sea.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints,
                [0], [0], 0, { from: accounts[0] })
            await sea.initializeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, agreementId, utils.templateId, { from: accounts[0] })
            const hash = getMessageHash(contracts, fingerprints, valueHashes, timeoutValues, agreementId)
            await computeConditions.submitAlgorithmHash(agreementId, hash, { from: accounts[0] })
            await computeConditions.submitHashSignature(agreementId, signature, { from: consumer })

            // act-assert
            try {
                await computeConditions.fulfillUpload(agreementId, utils.emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'avoid replay attack')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
