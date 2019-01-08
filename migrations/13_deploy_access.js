/* global artifacts */
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const AccessConditions = artifacts.require('AccessConditions.sol')
const { saveDefinition } = require('./helper')

const serviceAgreement = async (deployer, network) => {
    await deployer.deploy(
        AccessConditions,
        ServiceExecutionAgreement.address
    )

    saveDefinition(network, AccessConditions)
}

module.exports = serviceAgreement
