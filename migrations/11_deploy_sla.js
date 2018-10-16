/* global artifacts */
const OceanToken = artifacts.require('OceanToken.sol')
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const AccessConditions = artifacts.require('AccessConditions.sol')
const { saveDefinition } = require('./helper')

const serviceAgreement = async (deployer, network) => {
    await deployer.deploy(
        ServiceAgreement
    )

    await deployer.deploy(PaymentConditions, ServiceAgreement.address, OceanToken.address, 10)
    await deployer.deploy(AccessConditions, ServiceAgreement.address)

    saveDefinition(network, ServiceAgreement)
}

module.exports = serviceAgreement
