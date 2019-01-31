/* global artifacts */
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const EscrowReward = artifacts.require('EscrowReward.sol')
const { saveDefinition } = require('./helper')

const escrowReward = async (deployer, network) => {
    await deployer.deploy(
        EscrowReward,
        ConditionStoreManager.address,
        OceanToken.address
    )

    saveDefinition(network, EscrowReward)
}

module.exports = escrowReward
