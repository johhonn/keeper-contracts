/* global artifacts */
const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const FitchainConditions = artifacts.require('FitchainConditions.sol')
const { saveDefinition } = require('./helper')

const stake = 10
const maxSlots = 1

const fitchainConditions = async (deployer, network) => {
    await deployer.deploy(FitchainConditions, ServiceAgreement.address, stake, maxSlots)

    saveDefinition(network, FitchainConditions)
}

module.exports = fitchainConditions
