/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it, before, beforeEach */

const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const OceanToken = artifacts.require('OceanToken.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const PaymentConditionsChangeInStorageAndLogic = artifacts.require('PaymentConditionsChangeInStorageAndLogic')

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

    before('restore zos before all tests', async () => {
        zos = new ZeppelinHelper('PaymentConditions')
        await zos.restoreState(accounts[9])
        /* eslint-disable-next-line */
        consumer = accounts[2]
    })

    beforeEach('Deploy with zos before each tests', async () => {
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
        it('Should be possible to append storage variables and change logic', async () => {
            let p = await PaymentConditionsChangeInStorageAndLogic.at(paymentConditionsAddress)

            // upgrade contract
            await zos.upgradeToNewContract('PaymentConditionsChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()

            // act
            const result = await p.lockPayment(
                agreementId,
                testUtils.assetId,
                price,
                { from: consumer })

            // assert
            testUtils.assertEmitted(result, 1, 'PaymentLocked')

            // eval
            let n = await p.called(zos.owner)
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })
    })
})
