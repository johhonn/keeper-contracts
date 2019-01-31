/* global artifacts */
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const LockRewardCondition = artifacts.require('LockRewardCondition.sol')
const { saveDefinition } = require('./helper')

const lockRewardCondition = async (deployer, network) => {
    await deployer.deploy(
        LockRewardCondition,
        ConditionStoreManager.address,
        OceanToken.address
    )

    saveDefinition(network, LockRewardCondition)
}

module.exports = lockRewardCondition
