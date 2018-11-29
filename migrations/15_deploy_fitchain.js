/* global artifacts */
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const FitchainConditions = artifacts.require('FitchainConditions.sol')
const { saveDefinition } = require('./helper')

const fitchainConditions = async (deployer, network) => {
    await deployer.deploy(FitchainConditions, ServiceAgreement.address, 10, 1)

    saveDefinition(network, FitchainConditions)
}

module.exports = fitchainConditions
