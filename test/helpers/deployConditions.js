/* global artifacts */
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition')
const EscrowReward = artifacts.require('EscrowReward')
const HashLockCondition = artifacts.require('HashLockCondition')
const LockRewardCondition = artifacts.require('LockRewardCondition')
const SignCondition = artifacts.require('SignCondition')

const deployConditions = async function(
    deployer,
    owner,
    agreementStoreManager,
    conditionStoreManager,
    oceanToken
) {
    const hashLockCondition = await HashLockCondition.new({ from: deployer })
    await hashLockCondition.initialize(
        owner,
        conditionStoreManager.address,
        { from: deployer }
    )

    const signCondition = await SignCondition.new({ from: deployer })
    await signCondition.initialize(
        owner,
        conditionStoreManager.address,
        { from: deployer }
    )

    const lockRewardCondition = await LockRewardCondition.new({ from: deployer })
    await lockRewardCondition.initialize(
        owner,
        conditionStoreManager.address,
        oceanToken.address,
        { from: deployer }
    )

    const accessSecretStoreCondition = await AccessSecretStoreCondition.new({ from: deployer })
    await accessSecretStoreCondition.initialize(
        owner,
        conditionStoreManager.address,
        agreementStoreManager.address,
        { from: deployer }
    )

    const escrowReward = await EscrowReward.new({ from: deployer })
    await escrowReward.initialize(
        owner,
        conditionStoreManager.address,
        oceanToken.address,
        { from: deployer }
    )

    return {
        accessSecretStoreCondition,
        escrowReward,
        lockRewardCondition,
        signCondition
    }
}

module.exports = deployConditions
