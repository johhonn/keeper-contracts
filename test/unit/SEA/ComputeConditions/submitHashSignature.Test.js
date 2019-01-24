/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('../../../helpers/ZeppelinHelper.js')
const ComputeConditions = artifacts.require('ComputeConditions.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const testUtils = require('../../../helpers/utils.js')
const { initializeAgreement } = require('../../../helpers/initializeAgreement.js')

const web3 = testUtils.getWeb3()

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
    let zos

    before(async () => {
        zos = new ZeppelinHelper('ComputeConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach(async () => {
        await zos.initialize(accounts[0], false)
        sea = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))
        computeConditions = await ComputeConditions.at(zos.getProxyAddress('ComputeConditions'))
        contracts = [computeConditions.address]
        fingerprints = [testUtils.getSelector(web3, ComputeConditions, 'fulfillUpload')]
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

    describe('submitHashSignature', () => {
        it('Should not submit when sender is not consumer', async () => {
            // act-assert
            try {
                await computeConditions.submitHashSignature(agreementId, testUtils.emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid data consumer address!')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should submit', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act
            const result = await computeConditions.submitHashSignature(agreementId, testUtils.emptyBytes32, { from: consumer })

            // assert
            testUtils.assertEmitted(result, 1, 'HashSignatureSubmitted')
        })

        it('Should re-submit when call submit twice', async () => {
            // arrange
            await initializeAgreementWithValues()
            await computeConditions.submitHashSignature(agreementId, testUtils.emptyBytes32, { from: consumer })

            // act-assert
            try {
                await computeConditions.submitHashSignature(agreementId, testUtils.emptyBytes32, { from: consumer })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid signature or hash size')
                return
            }
            assert.fail('Expected revert not received on invalid submission of the signature')
        })
    })
})
