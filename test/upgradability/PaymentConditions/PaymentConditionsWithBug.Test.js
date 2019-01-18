/* eslint-env mocha */
/* global web3, artifacts, contract, describe, it, before, beforeEach */

const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement')
const OceanToken = artifacts.require('OceanToken.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const PaymentConditionsWithBug = artifacts.require('PaymentConditionsWithBug')

const { initializeAgreement } = require('../../helpers/initializeAgreement.js')

contract('PaymentConditions', (accounts) => {
    let zos
    let paymentConditionsAddress
    let serviceExecutionAgreement
    let token
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

        token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
        // give funds to consumer
        await token.mint(consumer, 100)
        // approve condition to spend them
        await token.approve(paymentConditionsAddress, price, { from: consumer })
    })

    describe('Test upgradability for PaymentConditions', () => {
        it('Should be possible to fix/add a bug', async () => {
            let p = await PaymentConditionsWithBug.at(paymentConditionsAddress)

            // upgrade
            await zos.upgradeToNewContract('PaymentConditionsWithBug')

            // confirm upgrade
            await zos.approveLatestTransaction()

            // act
            const result = await p.lockPayment(
                agreementId,
                testUtils.assetId,
                price,
                { from: consumer })

            // eval
            testUtils.assertEmitted(result, 0, 'PaymentLocked')
        })
    })
})
