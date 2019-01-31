/* global artifacts */
const EpochLibrary = artifacts.require('EpochLibrary.sol')
const ConditionStoreLibrary = artifacts.require('ConditionStoreLibrary.sol')
const { saveDefinition } = require('./helper')

const conditionStoreLibrary = async (deployer, network) => {
    await deployer.deploy(
        EpochLibrary
    )
    deployer.link(EpochLibrary, ConditionStoreLibrary);
    await deployer.deploy(
        ConditionStoreLibrary
    )

    saveDefinition(network, ConditionStoreLibrary)
}

module.exports = conditionStoreLibrary
