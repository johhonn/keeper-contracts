/* global artifacts */
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const HashLockCondition = artifacts.require('HashLockCondition.sol')
const { saveDefinition } = require('./helper')

const hashLockCondition = async (deployer, network) => {
    await deployer.deploy(
        HashLockCondition,
        ConditionStoreManager.address
    )

    saveDefinition(network, HashLockCondition)
}

module.exports = hashLockCondition
