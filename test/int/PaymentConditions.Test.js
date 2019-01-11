/* global contract, assert, artifacts, before, describe, it */

const AccessConditions = artifacts.require('AccessConditions.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const ZeppelinHelper = require('../helpers/ZeppelinHelper.js')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../helpers/utils.js')
const { hashAgreement } = require('../helpers/hashAgreement.js')

const web3 = utils.getWeb3()
const did = '0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
const serviceTemplateId = '0x419d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'

contract('PaymentConditions', (accounts) => {
    describe('Tests integration of payment conditions in SEA', () => {
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
            let zos = new ZeppelinHelper('PaymentConditions')
            await zos.restoreState(accounts[9])
            zos.addDependency('AccessConditions')
            await zos.initialize(accounts[0], false)
            token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
            agreement = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))
            paymentConditions = await PaymentConditions.at(zos.getProxyAddress('PaymentConditions'))
            accessConditions = await AccessConditions.at(zos.getProxyAddress('AccessConditions'))

            await token.mint(consumer, walletAllowance)

            await token.approve(consumer, await token.totalSupply.call())
            await token.approve(paymentConditions.address, walletAllowance)

            // Setup an agreement template where lockPayment depends on grantAccess,
            // releasePayment depends on lockPayment.
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
            const grantAccessHash = utils.valueHash(['bytes32'], [asset])

            hashes = [grantAccessHash, lockPaymentHash, releasePaymentHash]
        })

        async function signAgreement(agreementId) {
            const hash = hashAgreement(
                testTemplateId,
                utils.generateConditionsKeys(testTemplateId, contracts, fingerprints),
                hashes,
                timeouts,
                agreementId
            )
            signature = await web3.eth.sign(hash, consumer)
            const result = await agreement.initializeAgreement(
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
            const agreementId = await signAgreement(utils.generateId())

            await paymentConditions.lockPayment(agreementId, asset, price)
            assert.strictEqual(
                0,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })

        it('Locks payment if conditions are met', async () => {
            const agreementId = await signAgreement(utils.generateId())

            await accessConditions.grantAccess(
                agreementId,
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
            const agreementId = await signAgreement(utils.generateId())

            await accessConditions.grantAccess(
                agreementId,
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
            const agreementId = await signAgreement(utils.generateId())

            await paymentConditions.releasePayment(agreementId, asset, price)
            assert.strictEqual(
                0,
                web3.utils.toDecimal(await token.balanceOf.call(agreement.address))
            )
        })

        it('Releases payment if conditions are met', async () => {
            const agreementId = await signAgreement(utils.generateId())

            await accessConditions.grantAccess(
                agreementId,
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
            const agreementId = await signAgreement(utils.generateId())

            await accessConditions.grantAccess(
                agreementId,
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
