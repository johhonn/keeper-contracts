/* global artifacts */
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const AccessConditions = artifacts.require('AccessConditions.sol')
const { saveDefinition } = require('./helper')

const serviceAgreement = async (deployer, network) => {
    await deployer.deploy(
        ServiceAgreement
    )

    await deployer.deploy(PaymentConditions, ServiceAgreement.address)
    await deployer.deploy(AccessConditions, ServiceAgreement.address)

    saveDefinition(network, ServiceAgreement)
}

module.exports = serviceAgreement
