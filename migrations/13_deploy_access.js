/* global artifacts */
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const AccessConditions = artifacts.require('AccessConditions.sol')
const { saveDefinition } = require('./helper')

const serviceAgreement = async (deployer, network) => {
    await deployer.deploy(AccessConditions, ServiceAgreement.address)

    saveDefinition(network, AccessConditions)
}

module.exports = serviceAgreement
