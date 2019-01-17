/* eslint-env mocha */
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

    describe('releasePayment', () => {
        it('Should not release payment when sender is not publisher', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act-assert
            try {
                await paymentConditions.releasePayment(agreementId, testUtils.emptyBytes32, 1, { from: consumer })
            } catch (e) {
                assert.strictEqual(e.reason, 'Only service agreement publisher can trigger releasePayment.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should release payment', async () => {
            // arrang
            fingerprints = [testUtils.getSelector(web3, PaymentConditions, 'releasePayment')]
            valueHashes = [testUtils.valueHash(['bytes32', 'uint256'], [testUtils.assetId, price])]
            await initializeAgreementWithValues()

            // act
            const result = await paymentConditions.releasePayment(agreementId, testUtils.assetId, price, { from: accounts[0] })

            // assert
            testUtils.assertEmitted(result, 1, 'PaymentReleased')
        })

        it('Should not release payment when exist unfulfilled dependencies', async () => {
            // arrang
            dependenciesBits = [1]
            await initializeAgreementWithValues()

            // act
            const result = await paymentConditions.releasePayment(agreementId, testUtils.assetId, price, { from: accounts[0] })

            // assert
            testUtils.assertEmitted(result, 0, 'PaymentReleased')
        })

        it('Should not release payment twice', async () => {
            // arrang
            fingerprints = [testUtils.getSelector(web3, PaymentConditions, 'releasePayment')]
            valueHashes = [testUtils.valueHash(['bytes32', 'uint256'], [testUtils.assetId, price])]
            await initializeAgreementWithValues()
            await paymentConditions.releasePayment(agreementId, testUtils.assetId, price, { from: accounts[0] })

            // act
            const result = await paymentConditions.releasePayment(agreementId, testUtils.assetId, price, { from: accounts[0] })

            // assert
            testUtils.assertEmitted(result, 0, 'PaymentReleased')
        })
    })
})
