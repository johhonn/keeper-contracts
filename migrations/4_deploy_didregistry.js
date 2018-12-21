/* global artifacts */
const DIDRegistry = artifacts.require('DIDRegistry.sol')
const { saveDefinition } = require('./helper')

const dIDRegistry = async (deployer, network) => {
    await deployer.deploy(DIDRegistry)
    saveDefinition(network, DIDRegistry)
}

module.exports = dIDRegistry
