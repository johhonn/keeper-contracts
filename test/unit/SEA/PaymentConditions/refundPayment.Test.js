/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, before, beforeEach */

const ZeppelinHelper = require('../../../helpers/ZeppelinHelper.js')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const OceanToken = artifacts.require('OceanToken.sol')

const testUtils = require('../../../helpers/utils.js')
const { initializeAgreement } = require('../../../helpers/initializeAgreement.js')

const web3 = testUtils.getWeb3()

contract('PaymentConditions', (accounts) => {
    let sea
    let token
    let paymentConditions
    let price
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
        zos = new ZeppelinHelper('PaymentConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach(async () => {
        await zos.initialize(accounts[0], false)
        sea = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))
        token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
        await token.mint(consumer, 1000)
        paymentConditions = await PaymentConditions.at(zos.getProxyAddress('PaymentConditions'))
        price = 1
        contracts = [paymentConditions.address]
        fingerprints = [testUtils.getSelector(web3, PaymentConditions, 'lockPayment')]
        dependenciesBits = [0]
        valueHashes = [testUtils.valueHash(['bytes32', 'uint256'], [testUtils.assetId, price])]
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

    describe('refundPayment', () => {
        it('Should not refund payment when sender is not consumer', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act-assert
            try {
                await paymentConditions.refundPayment(agreementId, testUtils.emptyBytes32, 1, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Only consumer can trigger refundPayment.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should refund payment', async () => {
            // arrang
            contracts.push(paymentConditions.address)
            fingerprints.push(testUtils.getSelector(web3, PaymentConditions, 'refundPayment'))
            dependenciesBits = [0, 0]
            valueHashes.push(testUtils.valueHash(['bytes32', 'uint256'], [testUtils.assetId, price]))
            timeoutValues.push(0)
            await initializeAgreementWithValues()
            await token.mint(consumer, price)
            await token.approve(paymentConditions.address, price, { from: consumer })
            await paymentConditions.lockPayment(agreementId, testUtils.assetId, price, { from: consumer })

            // act
            const result = await paymentConditions.refundPayment(agreementId, testUtils.assetId, price, { from: consumer })

            // assert
            testUtils.assertEmitted(result, 1, 'PaymentRefund')
        })

        it('Should not refund payment twice', async () => {
            // arrang
            contracts.push(paymentConditions.address)
            fingerprints.push(testUtils.getSelector(web3, PaymentConditions, 'refundPayment'))
            dependenciesBits = [0, 1]
            valueHashes.push(testUtils.valueHash(['bytes32', 'uint256'], [testUtils.assetId, price]))
            timeoutValues.push(0)
            await initializeAgreementWithValues()
            await token.mint(consumer, price)
            await token.approve(paymentConditions.address, price, { from: consumer })
            await paymentConditions.lockPayment(agreementId, testUtils.assetId, price, { from: consumer })
            await paymentConditions.refundPayment(agreementId, testUtils.assetId, price, { from: consumer })

            // act
            const result = await paymentConditions.refundPayment(agreementId, testUtils.assetId, price, { from: consumer })

            // assert
            testUtils.assertEmitted(result, 0, 'PaymentRefund')
        })
    })
})
