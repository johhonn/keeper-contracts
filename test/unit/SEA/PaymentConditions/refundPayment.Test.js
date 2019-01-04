/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const PaymentConditions = artifacts.require('PaymentConditions.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const OceanToken = artifacts.require('OceanToken.sol')

const utils = require('../../../helpers/utils.js')
const { initializeAgreement } = require('../../../helpers/initializeAgreement.js')

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

    describe('refundPayment', () => {
        it('Should not refund payment when sender is not consumer', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act-assert
            try {
                await paymentConditions.refundPayment(agreementId, utils.emptyBytes32, 1, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Only consumer can trigger refundPayment.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should refund payment', async () => {
            // arrang
            contracts.push(paymentConditions.address)
            fingerprints.push(utils.getSelector(web3, PaymentConditions, 'refundPayment'))
            dependenciesBits = [0, 0]
            valueHashes.push(utils.valueHash(['bytes32', 'uint256'], [assetId, price]))
            timeoutValues.push(0)
            await initializeAgreementWithValues()
            await token.mint(consumer, price)
            await token.approve(paymentConditions.address, price, { from: consumer })
            await paymentConditions.lockPayment(agreementId, assetId, price, { from: consumer })

            // act
            const result = await paymentConditions.refundPayment(agreementId, assetId, price, { from: consumer })

            // assert
            utils.assertEmitted(result, 1, 'PaymentRefund')
        })

        it('Should not refund payment twice', async () => {
            // arrang
            contracts.push(paymentConditions.address)
            fingerprints.push(utils.getSelector(web3, PaymentConditions, 'refundPayment'))
            dependenciesBits = [0, 1]
            valueHashes.push(utils.valueHash(['bytes32', 'uint256'], [assetId, price]))
            timeoutValues.push(0)
            await initializeAgreementWithValues()
            await token.mint(consumer, price)
            await token.approve(paymentConditions.address, price, { from: consumer })
            await paymentConditions.lockPayment(agreementId, assetId, price, { from: consumer })
            await paymentConditions.refundPayment(agreementId, assetId, price, { from: consumer })

            // act
            const result = await paymentConditions.refundPayment(agreementId, assetId, price, { from: consumer })

            // assert
            utils.assertEmitted(result, 0, 'PaymentRefund')
        })
    })
})
