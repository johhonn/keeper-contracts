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

    describe('releasePayment', () => {
        it('Should not release payment when sender is not publisher', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act-assert
            try {
                await paymentConditions.releasePayment(agreementId, utils.emptyBytes32, 1, { from: consumer })
            } catch (e) {
                assert.strictEqual(e.reason, 'Only service agreement publisher can trigger releasePayment.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should release payment', async () => {
            // arrang
            fingerprints = [utils.getSelector(web3, PaymentConditions, 'releasePayment')]
            valueHashes = [utils.valueHash(['bytes32', 'uint256'], [assetId, price])]
            await initializeAgreementWithValues()

            // act
            const result = await paymentConditions.releasePayment(agreementId, assetId, price, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'PaymentReleased')
        })

        it('Should not release payment when exist unfulfilled dependencies', async () => {
            // arrang
            dependenciesBits = [1]
            await initializeAgreementWithValues()

            // act
            const result = await paymentConditions.releasePayment(agreementId, assetId, price, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 0, 'PaymentReleased')
        })

        it('Should not release payment twice', async () => {
            // arrang
            fingerprints = [utils.getSelector(web3, PaymentConditions, 'releasePayment')]
            valueHashes = [utils.valueHash(['bytes32', 'uint256'], [assetId, price])]
            await initializeAgreementWithValues()
            await paymentConditions.releasePayment(agreementId, assetId, price, { from: accounts[0] })

            // act
            const result = await paymentConditions.releasePayment(agreementId, assetId, price, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 0, 'PaymentReleased')
        })
    })
})
