/* global artifacts */
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const { saveDefinition } = require('./helper')

const serviceAgreement = async (deployer, network) => {
    await deployer.deploy(
        ServiceAgreement
    )

    saveDefinition(network, ServiceAgreement)
}

module.exports = serviceAgreement
