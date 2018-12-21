/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const PaymentConditions = artifacts.require('PaymentConditions.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const OceanToken = artifacts.require('OceanToken.sol')

const utils = require('../../helpers/utils.js')
const { initializeAgreement } = require('../../helpers/initializeAgreement.js')

const web3 = utils.getWeb3()

contract('PaymentConditions', (accounts) => {
    const assetId = '0x0000000000000000000000000000000000000000000000000000000000000001'
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

    beforeEach(async () => {
        sea = await ServiceExecutionAgreement.new({ from: accounts[0] })
        token = await OceanToken.new({ from: accounts[0] })
        paymentConditions = await PaymentConditions.new(sea.address, token.address, { from: accounts[0] })
        price = 1
        contracts = [paymentConditions.address]
        fingerprints = [utils.getSelector(web3, PaymentConditions, 'lockPayment')]
        dependenciesBits = [0]
        valueHashes = [utils.valueHash(['bytes32', 'uint256'], [assetId, price])]
        timeoutValues = [0]
        agreementId = utils.generateId()
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

    describe('lockPayment', () => {
        it('Should not lock payment when sender is not consumer', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act-assert
            try {
                await paymentConditions.lockPayment(agreementId, utils.emptyBytes32, 1, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Only consumer can trigger lockPayment.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should lock payment', async () => {
            // arrange
            await initializeAgreementWithValues()
            await token.setReceiver(consumer, { from: accounts[0] })
            await token.approve(paymentConditions.address, price, { from: consumer })

            // act
            const result = await paymentConditions.lockPayment(agreementId, assetId, price, { from: consumer })

            // assert
            utils.assertEmitted(result, 1, 'PaymentLocked')
        })

        it('Should not lock payment when exist unfulfilled dependencies', async () => {
            // arrang
            dependenciesBits = [1]
            await initializeAgreementWithValues()

            // act
            const result = await paymentConditions.lockPayment(agreementId, assetId, price, { from: consumer })

            // assert
            utils.assertEmitted(result, 0, 'PaymentLocked')
        })

        it('Should not lock payment twice', async () => {
            // arrange
            await initializeAgreementWithValues()
            await token.setReceiver(consumer, { from: accounts[0] })
            await token.approve(paymentConditions.address, price, { from: consumer })
            await paymentConditions.lockPayment(agreementId, assetId, price, { from: consumer })

            // act
            const result = await paymentConditions.lockPayment(agreementId, assetId, price, { from: consumer })

            // assert
            utils.assertEmitted(result, 0, 'PaymentLocked')
        })
    })
})
