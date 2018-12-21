/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const PaymentConditions = artifacts.require('PaymentConditions.sol')
const Agreement = artifacts.require('ServiceExecutionAgreement.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const utils = require('../helpers/utils.js')

const web3 = utils.getWeb3()

contract('PaymentConditions constructor', (accounts) => {
    it('Should not deploy when agreement is empty', async () => {
        // act-assert
        try {
            await PaymentConditions.new(0x0, 0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'invalid address')
            return
        }
        assert.fail('Expected revert not received')
    })

    it('Should not deploy when token is empty', async () => {
        // act-assert
        try {
            await PaymentConditions.new(utils.dummyAddress, 0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'invalid address')
            return
        }
        assert.fail('Expected revert not received')
    })
})

contract('PaymentConditions', (accounts) => {
    const assetId = '0x0000000000000000000000000000000000000000000000000000000000000001'
    let agreement
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

    function createSignature(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer) {
        const conditionKeys = utils.generateConditionsKeys(utils.templateId, contracts, fingerprints)
        const hash = utils.createSLAHash(web3, utils.templateId, conditionKeys, valueHashes, timeoutValues, agreementId)
        return web3.eth.sign(hash, consumer)
    }

    async function initAgreement() {
        const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
        await agreement.setupTemplate(
            utils.templateId,
            contracts,
            fingerprints,
            dependenciesBits,
            [0], 0, { from: accounts[0] })
        await agreement.initializeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, agreementId, utils.templateId, { from: accounts[0] })
    }

    beforeEach(async () => {
        agreement = await Agreement.new({ from: accounts[0] })
        token = await OceanToken.new({ from: accounts[0] })
        paymentConditions = await PaymentConditions.new(agreement.address, token.address, { from: accounts[0] })
        price = 1
        contracts = [paymentConditions.address]
        fingerprints = [utils.getSelector(web3, PaymentConditions, 'lockPayment')]
        dependenciesBits = [0]
        valueHashes = [utils.valueHash(['bytes32', 'uint256'], [assetId, price])]
        timeoutValues = [0]
        agreementId = utils.generateId()
    })

    describe('lockPayment', () => {
        it('Should not lock payment when sender is not consumer', async () => {
            // arrange
            await initAgreement()

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
            await initAgreement()
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
            await initAgreement()

            // act
            const result = await paymentConditions.lockPayment(agreementId, assetId, price, { from: consumer })

            // assert
            utils.assertEmitted(result, 0, 'PaymentLocked')
        })

        it('Should not lock payment twice', async () => {
            // arrange
            await initAgreement()
            await token.setReceiver(consumer, { from: accounts[0] })
            await token.approve(paymentConditions.address, price, { from: consumer })
            await paymentConditions.lockPayment(agreementId, assetId, price, { from: consumer })

            // act
            const result = await paymentConditions.lockPayment(agreementId, assetId, price, { from: consumer })

            // assert
            utils.assertEmitted(result, 0, 'PaymentLocked')
        })
    })

    describe('releasePayment', () => {
        it('Should not release payment when sender is not publisher', async () => {
            // arrange
            await initAgreement()

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
            await initAgreement()

            // act
            const result = await paymentConditions.releasePayment(agreementId, assetId, price, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'PaymentReleased')
        })

        it('Should not release payment when exist unfulfilled dependencies', async () => {
            // arrang
            dependenciesBits = [1]
            await initAgreement()

            // act
            const result = await paymentConditions.releasePayment(agreementId, assetId, price, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 0, 'PaymentReleased')
        })

        it('Should not release payment twice', async () => {
            // arrang
            fingerprints = [utils.getSelector(web3, PaymentConditions, 'releasePayment')]
            valueHashes = [utils.valueHash(['bytes32', 'uint256'], [assetId, price])]
            await initAgreement()
            await paymentConditions.releasePayment(agreementId, assetId, price, { from: accounts[0] })

            // act
            const result = await paymentConditions.releasePayment(agreementId, assetId, price, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 0, 'PaymentReleased')
        })
    })

    describe('refundPayment', () => {
        it('Should not refund payment when sender is not consumer', async () => {
            // arrange
            await initAgreement()

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
            await initAgreement()
            await token.setReceiver(consumer, { from: accounts[0] })
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
            await initAgreement()
            await token.setReceiver(consumer, { from: accounts[0] })
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
