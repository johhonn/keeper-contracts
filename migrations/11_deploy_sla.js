/* global artifacts */
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const { saveDefinition } = require('./helper')

const serviceAgreement = async (deployer, network) => {
    await deployer.deploy(
        ServiceExecutionAgreement
    )

    saveDefinition(network, ServiceExecutionAgreement)
}

module.exports = serviceAgreement
