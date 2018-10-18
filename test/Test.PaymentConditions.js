/* global assert, artifacts, contract, before, describe, it */

const AccessConditions = artifacts.require('AccessConditions.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')

const utils = require('./utils.js')

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

contract('PaymentConditions', (accounts) => {
    describe('Tests payment conditions used in SLAs', () => {
        const consumer = accounts[0]

        let token

        let agreement
        let accessConditions
        let paymentConditions

        let templateId
        let signature
        let contracts
        let fingerprints
        let dependencies

        const walletAllowance = 1000

        const price = 10

        var walletBalance = 0

        before(async () => {
            token = await OceanToken.new()

            await token.setReceiver(consumer)
            await token.approve(consumer, await token.totalSupply.call())

            agreement = await ServiceAgreement.new()

            paymentConditions = await PaymentConditions.new(
                agreement.address, token.address, price
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
                utils.getSelector(accessConditions, 'grantAccess'),
                utils.getSelector(paymentConditions, 'lockPayment'),
                utils.getSelector(paymentConditions, 'releasePayment')
            ]
            dependencies = [0, 1, 2]

            const result = await agreement.setupAgreementTemplate(
                contracts,
                fingerprints,
                dependencies,
                web3.utils.fromAscii('test-payment-conditions')
            )
            templateId = result.logs[3].args.serviceTemplateId

            const hash = utils.createSLAHash(
                web3, templateId,
                utils.generateConditionsKeys(templateId, contracts, fingerprints)
            )

            signature = await web3.eth.sign(hash, consumer)
        })

        async function signAgreement() {
            const result = await agreement.executeAgreement(templateId, signature, consumer)
            return result.logs[3].args.serviceId
        }

        it('Rejects to lock payments if conditions are not met', async () => {
            const serviceId = await signAgreement()

            await paymentConditions.lockPayment(serviceId)
            assert.strictEqual(
                0,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })

        it('Locks payment if conditions are met', async () => {
            const serviceId = await signAgreement()

            agreement.setConditionStatus(
                serviceId,
                utils.getSelector(accessConditions, 'grantAccess')
            )

            await paymentConditions.lockPayment(serviceId)
            walletBalance += price
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })

        it('Does not lock twice', async () => {
            const serviceId = await signAgreement()

            agreement.setConditionStatus(
                serviceId,
                utils.getSelector(accessConditions, 'grantAccess')
            )

            await paymentConditions.lockPayment(serviceId)
            walletBalance += price
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )

            // Try to lock again, the balance must not change.
            await paymentConditions.lockPayment(serviceId)
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })

        it('Rejects to release payment if conditions are not met', async () => {
            const serviceId = await signAgreement()

            await paymentConditions.releasePayment(serviceId)
            assert.strictEqual(
                0,
                web3.utils.toDecimal(await token.balanceOf.call(agreement.address))
            )
        })

        it('Releases payment if conditions are met', async () => {
            const serviceId = await signAgreement()

            agreement.setConditionStatus(
                serviceId,
                utils.getSelector(accessConditions, 'grantAccess')
            )
            await paymentConditions.lockPayment(serviceId)
            walletBalance += price

            await paymentConditions.releasePayment(serviceId)
            walletBalance -= price
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })

        it('Does not release twice', async () => {
            const serviceId = await signAgreement()

            agreement.setConditionStatus(
                serviceId,
                utils.getSelector(accessConditions, 'grantAccess')
            )
            await paymentConditions.lockPayment(serviceId)
            walletBalance += price

            await paymentConditions.releasePayment(serviceId)
            walletBalance -= price
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )

            // Try to release again, the balance must not change.
            await paymentConditions.releasePayment(serviceId)
            assert.strictEqual(
                walletBalance,
                web3.utils.toDecimal(await token.balanceOf.call(paymentConditions.address))
            )
        })
    })
})
