/* global artifacts */
const OceanToken = artifacts.require('./OceanToken.sol')
const Dispenser = artifacts.require('./Dispenser.sol')

const oceanToken = async (deployer) => {
    const oceanToken = await OceanToken.deployed()
    await Dispenser.deployed()

    await oceanToken.addMinter(Dispenser.address)
}

module.exports = oceanToken
