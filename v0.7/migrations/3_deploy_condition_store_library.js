/* global artifacts */
const ConditionStoreLibrary = artifacts.require('ConditionStoreLibrary.sol')
const { saveDefinition } = require('./helper')

const conditionStoreLibrary = async (deployer, network) => {
    await deployer.deploy(
        ConditionStoreLibrary
    )

    saveDefinition(network, ConditionStoreLibrary)
}

module.exports = conditionStoreLibrary
