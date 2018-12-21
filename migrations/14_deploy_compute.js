/* global artifacts */
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const ComputeConditions = artifacts.require('ComputeConditions.sol')
const { saveDefinition } = require('./helper')

const computeConditions = async (deployer, network) => {
    await deployer.deploy(ComputeConditions, ServiceExecutionAgreement.address)

    saveDefinition(network, ComputeConditions)
}

module.exports = computeConditions
