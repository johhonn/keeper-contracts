/* global artifacts */
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const ComputeConditions = artifacts.require('ComputeConditions.sol')
const { saveDefinition } = require('./helper')

const computeConditions = async (deployer, network) => {
    await deployer.deploy(ComputeConditions, ServiceAgreement.address)

    saveDefinition(network, AccessConditions)
}

module.exports = computeConditions
