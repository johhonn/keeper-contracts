/* global artifacts */
const EpochLibrary = artifacts.require('EpochLibrary.sol')
const { saveDefinition } = require('./helper')

const epochLibrary = async (deployer, network) => {
    await deployer.deploy(
        EpochLibrary
    )

    saveDefinition(network, EpochLibrary)
}

module.exports = epochLibrary
