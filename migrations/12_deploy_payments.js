/* global artifacts */
const OceanToken = artifacts.require('OceanToken.sol')
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const { saveDefinition } = require('./helper')

const serviceAgreement = async (deployer, network) => {
    await deployer.deploy(PaymentConditions, ServiceAgreement.address, OceanToken.address, 1)

    saveDefinition(network, PaymentConditions)
}

module.exports = serviceAgreement
