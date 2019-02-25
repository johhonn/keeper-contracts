/* eslint-disable no-console */
const { encodeCall } = require('zos-lib')

const getAddressForImplementation = require('./getAddressForImplementation')

async function requestContractUpgrade(
    oldContractName,
    newContractName,
    proxyAddress,
    adminWallet,
    upgraderRole
) {
    console.log(`Upgrading contract: ${oldContractName} with ${newContractName}`)
    const implementationAddress = getAddressForImplementation(oldContractName)
    const upgradeCallData = encodeCall('upgradeTo', ['address'], [implementationAddress])
    const args = [
        proxyAddress,
        0, // value in ether
        upgradeCallData
    ]
    const tx = await adminWallet.submitTransaction(...args, { from: upgraderRole })
    console.log(`Upgraded contract: ${oldContractName}`)
    return tx.logs[0].args.transactionId.toNumber()
}

module.exports = requestContractUpgrade
