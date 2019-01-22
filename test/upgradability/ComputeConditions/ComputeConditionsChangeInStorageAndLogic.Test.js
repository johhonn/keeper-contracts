/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it, before, beforeEach */

const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const ComputeConditions = artifacts.require('ComputeConditions.sol')
const ComputeConditionsChangeInStorageAndLogic = artifacts.require('ComputeConditionsChangeInStorageAndLogic')

const { initializeAgreement } = require('../../helpers/initializeAgreement.js')

contract('ComputeConditions', (accounts) => {
    // template setup
    // for more info about the Compute use case dependencyBits: https://github.com/oceanprotocol/dev-ocean/pull/85
    const fulfillmentIndices = [0] // Root Conditions
    const fulfilmentOperator = 1 // OR
    const dependenciesBits = [0]
    const timeoutValues = [0]
    const templateId = testUtils.generateId()
    const agreementId = testUtils.generateId()
    const algorithm = 'THIS IS FAKE CODE foo=Hello World!'

    let zos
    let computeConditionsAddress
    let serviceExecutionAgreement
    let computeConditions
    let valueHashes
    let fingerprints
    let contracts
    let algorithmHash
    let datascientist

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('ComputeConditions')
        await zos.restoreState(accounts[9])
        /* eslint-disable-next-line */
        datascientist = accounts[2]
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('ComputeConditions')
        await zos.initialize(accounts[0], true)
        computeConditionsAddress = zos.getProxyAddress('ComputeConditions')

        serviceExecutionAgreement = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))
        computeConditions = await ComputeConditions.at(zos.getProxyAddress('ComputeConditions'))

        // conditions
        contracts = [
            computeConditions.address
        ]

        fingerprints = [
            testUtils.getSelector(web3, computeConditions, 'fulfillUpload')
        ]

        valueHashes = [
            testUtils.valueHash(['bool'], [true])
        ]

        // create new on-premise compute template
        await serviceExecutionAgreement.setupTemplate(
            templateId,
            contracts,
            fingerprints,
            dependenciesBits,
            fulfillmentIndices,
            fulfilmentOperator)

        // create new agreement instance
        await initializeAgreement(
            serviceExecutionAgreement,
            accounts[0],
            datascientist,
            contracts,
            agreementId,
            fingerprints,
            valueHashes,
            timeoutValues,
            dependenciesBits
        )
    })

    describe('Test upgradability for ComputeConditions', () => {
        it('Should be possible to append storage variables and change logic', async () => {
            await zos.upgradeToNewContract('ComputeConditionsChangeInStorageAndLogic')

            let p = await ComputeConditionsChangeInStorageAndLogic.at(computeConditionsAddress)

            algorithmHash = web3.utils.soliditySha3({ type: 'string', value: algorithm }).toString('hex')
            const signature = await web3.eth.sign(algorithmHash, datascientist)

            // should work after approval
            await zos.approveLatestTransaction()
            const submitAlgorithmSignature = await p.submitHashSignature(
                agreementId,
                signature,
                { from: datascientist })

            const isSignatureSubmitted = testUtils.getEventArgsFromTx(submitAlgorithmSignature, 'HashSignatureSubmitted')
            assert.strictEqual(isSignatureSubmitted.state, true, 'Error: Unable to submit signature')

            let n = await p.called(datascientist)
            assert.equal(n.toNumber() > 0, true, 'time of registry not created')
        })
    })
})
