/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it, before, beforeEach */

const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const PaymentConditionsChangeFunctionSignature = artifacts.require('PaymentConditionsChangeFunctionSignature')

const { initializeAgreement } = require('../../helpers/initializeAgreement.js')

contract('PaymentConditions', (accounts) => {
    let zos
    let paymentConditionsAddress
    let serviceExecutionAgreement
    let consumer
    let contracts
    let fingerprints
    let agreementId
    let dependenciesBits
    let valueHashes
    let timeoutValues

    const price = 1

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('PaymentConditions')
        await zos.restoreState(accounts[9])
        /* eslint-disable-next-line */
        consumer = accounts[2]
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('PaymentConditions')
        await zos.initialize(accounts[0], true)
        paymentConditionsAddress = zos.getProxyAddress('PaymentConditions')
        serviceExecutionAgreement = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))
        contracts = [paymentConditionsAddress]
        fingerprints = [testUtils.getSelector(web3, PaymentConditions, 'lockPayment')]
        dependenciesBits = [0]
        valueHashes = [testUtils.valueHash(['bytes32', 'uint256'], [testUtils.assetId, price])]
        timeoutValues = [0]
        agreementId = testUtils.generateId()

        await initializeAgreement(
            serviceExecutionAgreement,
            accounts[0],
            consumer,
            contracts,
            agreementId,
            fingerprints,
            valueHashes,
            timeoutValues,
            dependenciesBits
        )
    })

    describe('Test upgradability for PaymentConditions', () => {
        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('PaymentConditionsChangeFunctionSignature')

            let p = await PaymentConditionsChangeFunctionSignature.at(paymentConditionsAddress)

            // expect revert
            await testUtils.assertRevert(p.lockPayment(
                agreementId,
                testUtils.assetId,
                { from: consumer }))

            // upgrade contract
            await zos.approveLatestTransaction()

            // upgrade and test again
            try {
                await p.methods['lockPayment(bytes32,bytes32)'](agreementId, testUtils.assetId, { from: consumer })
                assert.fail('Expected revert not received')
            } catch (error) {
                assert.equal(error.reason, 'Invalid condition key', 'invalid revert reason')
            }
        })
    })
})
