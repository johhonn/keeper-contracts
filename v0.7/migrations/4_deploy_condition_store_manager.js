/* global artifacts */
const EpochLibrary = artifacts.require('EpochLibrary.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const { saveDefinition } = require('./helper')

const conditionStoreManager = async (deployer, network) => {
    await deployer.link(EpochLibrary, ConditionStoreManager)
    await deployer.deploy(
        ConditionStoreManager,
    )

    saveDefinition(network, ConditionStoreManager)
}

module.exports = conditionStoreManager
