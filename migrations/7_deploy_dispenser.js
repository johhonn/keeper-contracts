/* global artifacts */
const OceanToken = artifacts.require('OceanToken.sol')
const Dispenser = artifacts.require('Dispenser.sol')
const { saveDefinition } = require('./helper')

const dispenser = async (deployer, network) => {
    await deployer.deploy(
        Dispenser,
        OceanToken.address
    )

    saveDefinition(network, Dispenser)
}

module.exports = dispenser
