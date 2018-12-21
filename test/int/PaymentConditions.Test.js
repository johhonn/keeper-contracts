/* global assert, artifacts, contract, before, describe, it */

const AccessConditions = artifacts.require('AccessConditions.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const Agreement = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../utils.js')

const web3 = utils.getWeb3()
const did = '0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
const serviceTemplateId = '0x419d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'

contract('PaymentConditions', (accounts) => {
    describe('Tests payment conditions used in SLAs', () => {
        const consumer = accounts[0]

        let token

        let agreement
        let accessConditions
        let paymentConditions

        let testTemplateId
        let signature
        let contracts
        let fingerprints
        let dependencies
        let hashes
        const timeouts = [0, 0, 0]

        const walletAllowance = 1000

        const asset = web3.utils.fromAscii('my-asset')
        const price = 10

        let walletBalance = 0

        before(async () => {
            token = await OceanToken.new()

            await token.setReceiver(consumer)
            await token.approve(consumer, await token.totalSupply.call())

            agreement = await Agreement.new()

            paymentConditions = await PaymentConditions.new(
                agreement.address, token.address
            )
            await token.approve(paymentConditions.address, walletAllowance)

            // Setup an agreement template where lockPayment depends on grantAccess,
            // releasePayment depends on lockPayment.
            accessConditions = await AccessConditions.new(agreement.address)
            contracts = [
                accessConditions.address,
                paymentConditions.address,
                paymentConditions.address
            ]
            fingerprints = [
                utils.getSelector(web3, accessConditions, 'grantAccess'),
                utils.getSelector(web3, paymentConditions, 'lockPayment'),
                utils.getSelector(web3, paymentConditions, 'releasePayment')
            ]
            dependencies = [0, 1, 2]
            const fulfillmentIndices = [0] // Root Condition
            const fulfilmentOperator = 0 // AND

            const result = await agreement.setupTemplate(
                serviceTemplateId,
                contracts,
                fingerprints,
                dependencies,
                fulfillmentIndices,
                fulfilmentOperator
            )
            const { templateId } = result.logs[3].args
            testTemplateId = templateId

            const lockPaymentHash = utils.valueHash(['bytes32', 'uint256'], [asset, price])
            const releasePaymentHash = utils.valueHash(['bytes32', 'uint256'], [asset, price])
            const grantAccessHash = utils.valueHash(['bytes32', 'bytes32'], [asset, asset])

            hashes = [grantAccessHash, lockPaymentHash, releasePaymentHash]
        })

        async function signAgreement(agreementId) {
            const hash = utils.createSLAHash(
                web3, testTemplateId,
                utils.generateConditionsKeys(testTemplateId, contracts, fingerprints),
                hashes,
                timeouts,
                agreementId
            )
            signature = await web3.eth.sign(hash, consumer)
            const result = await agreement.executeAgreement(
                testTemplateId,
                signature,
                consumer,
                hashes,
                timeouts,
                agreementId,
                did
            )

            return result.logs[3].args.agreementId
        }

        it('Rejects to lock payments if conditions are not met', async () => {
            const agreementId = await signAgreement(utils.generateId(web3))

            await paymentConditions.lockPayment(agreementId, asset, price)
            assert.strictEqual(
                0,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })

        it('Locks payment if conditions are met', async () => {
            const agreementId = await signAgreement(utils.generateId(web3))

            await accessConditions.grantAccess(
                agreementId,
                asset,
                asset
            )

            await paymentConditions.lockPayment(agreementId, asset, price)
            walletBalance += price
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })

        it('Does not lock twice', async () => {
            const agreementId = await signAgreement(utils.generateId(web3))

            await accessConditions.grantAccess(
                agreementId,
                asset,
                asset
            )

            await paymentConditions.lockPayment(agreementId, asset, price)
            walletBalance += price
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )

            // Try to lock again, the balance must not change.
            await paymentConditions.lockPayment(agreementId, asset, price)
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })

        it('Rejects to release payment if conditions are not met', async () => {
            const agreementId = await signAgreement(utils.generateId(web3))

            await paymentConditions.releasePayment(agreementId, asset, price)
            assert.strictEqual(
                0,
                web3.utils.toDecimal(await token.balanceOf.call(agreement.address))
            )
        })

        it('Releases payment if conditions are met', async () => {
            const agreementId = await signAgreement(utils.generateId(web3))

            await accessConditions.grantAccess(
                agreementId,
                asset,
                asset
            )
            await paymentConditions.lockPayment(agreementId, asset, price)
            walletBalance += price

            await paymentConditions.releasePayment(agreementId, asset, price)
            walletBalance -= price
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })

        it('Does not release twice', async () => {
            const agreementId = await signAgreement(utils.generateId(web3))

            await accessConditions.grantAccess(
                agreementId,
                asset,
                asset
            )
            await paymentConditions.lockPayment(agreementId, asset, price)
            walletBalance += price

            await paymentConditions.releasePayment(agreementId, asset, price)
            walletBalance -= price
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )

            // Try to release again, the balance must not change.
            await paymentConditions.releasePayment(agreementId, asset, price)
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })
    })
})
