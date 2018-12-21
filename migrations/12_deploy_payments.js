/* global artifacts */
const OceanToken = artifacts.require('OceanToken.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const { saveDefinition } = require('./helper')

const serviceAgreement = async (deployer, network) => {
    await deployer.deploy(PaymentConditions, ServiceExecutionAgreement.address, OceanToken.address)

    saveDefinition(network, PaymentConditions)
}

module.exports = serviceAgreement
