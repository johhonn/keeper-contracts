/* global artifacts */
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const SignCondition = artifacts.require('SignCondition.sol')
const { saveDefinition } = require('./helper')

const signCondition = async (deployer, network) => {
    await deployer.deploy(
        SignCondition,
        ConditionStoreManager.address
    )

    saveDefinition(network, SignCondition)
}

module.exports = signCondition
