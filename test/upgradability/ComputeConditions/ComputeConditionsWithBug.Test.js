/* eslint-env mocha */
/* global artifacts, contract, describe, it, before, beforeEach */

const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const OceanToken = artifacts.require('OceanToken.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const AccessConditions = artifacts.require('AccessConditions.sol')
const ComputeConditions = artifacts.require('ComputeConditions.sol')
const ComputeConditionsWithBug = artifacts.require('ComputeConditionsWithBug')

const { initializeAgreement } = require('../../helpers/initializeAgreement.js')

const web3 = testUtils.getWeb3()

contract('ComputeConditions', (accounts) => {
    // template setup
    // for more info about the Compute use case dependencyBits: https://github.com/oceanprotocol/dev-ocean/pull/85
    const fulfillmentIndices = [3, 4] // Root Conditions
    const fulfilmentOperator = 1 // OR
    const dependenciesBits = [0, 1, 4, 16, 3]
    const price = 5 // 5 OCN tokens
    const timeoutValues = [0, 0, 0, 0, 100]
    const did = testUtils.generateId()
    const templateId = testUtils.generateId()
    const agreementId = testUtils.generateId()
    const algorithm = 'THIS IS FAKE CODE foo=Hello World!'

    let zos
    let computeConditionsAddress
    let token
    let serviceExecutionAgreement
    let paymentConditions
    let accessConditions
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
        zos.addDependency('PaymentConditions')
        zos.addDependency('AccessConditions')
        await zos.initialize(accounts[0], true)
        computeConditionsAddress = zos.getProxyAddress('ComputeConditions')

        token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
        serviceExecutionAgreement = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))
        paymentConditions = await PaymentConditions.at(zos.getProxyAddress('PaymentConditions'))
        accessConditions = await AccessConditions.at(zos.getProxyAddress('AccessConditions'))
        computeConditions = await ComputeConditions.at(zos.getProxyAddress('ComputeConditions'))

        // conditions
        contracts = [
            paymentConditions.address,
            computeConditions.address,
            accessConditions.address,
            paymentConditions.address,
            paymentConditions.address
        ]

        fingerprints = [
            testUtils.getSelector(web3, paymentConditions, 'lockPayment'),
            testUtils.getSelector(web3, computeConditions, 'fulfillUpload'),
            testUtils.getSelector(web3, accessConditions, 'grantAccess'),
            testUtils.getSelector(web3, paymentConditions, 'releasePayment'),
            testUtils.getSelector(web3, paymentConditions, 'refundPayment')
        ]

        valueHashes = [
            testUtils.valueHash(['bytes32', 'uint256'], [did, price]),
            testUtils.valueHash(['bool'], [true]),
            testUtils.valueHash(['bytes32', 'bytes32'], [did, did]),
            testUtils.valueHash(['bytes32', 'uint256'], [did, price]),
            testUtils.valueHash(['bytes32', 'uint256'], [did, price])
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

        await token.mint(datascientist, 1000)
        await token.approve(paymentConditions.address, 200, { from: datascientist })
    })

    describe('Test upgradability for ComputeConditions', () => {
        it('Should be possible to fix/add a bug', async () => {
            let p = await ComputeConditionsWithBug.at(computeConditionsAddress)
            await zos.upgradeToNewContract('ComputeConditionsWithBug')

            algorithmHash = web3.utils.soliditySha3({ type: 'string', value: algorithm }).toString('hex')
            const algorithmHashSignature = await web3.eth.sign(algorithmHash, datascientist)

            // await assert
            await testUtils.assertRevert(p.submitHashSignature(agreementId, algorithmHashSignature))

            // approve contract changes
            await zos.approveLatestTransaction()

            // await success
            await p.submitHashSignature(agreementId, algorithmHashSignature)
        })
    })
})
