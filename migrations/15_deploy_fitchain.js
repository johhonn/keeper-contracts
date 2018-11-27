/* global artifacts */
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const FitchainConditions = artifacts.require('FitchainConditions.sol')
const { saveDefinition } = require('./helper')

const fitchainConditions = async (deployer, network) => {
    await deployer.deploy(FitchainConditions, ServiceAgreement.address, 5)

    saveDefinition(network, FitchainConditions)
}

module.exports = fitchainConditions
