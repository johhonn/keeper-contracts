/* eslint-disable no-console */
const getAddressForImplementation = require('./getAddressForImplementation')
const submitTransaction = require('../../wallet/submitTransaction')

async function requestContractUpgrade(
    oldContractName,
    newContractName,
    proxyAddress,
    upgraderWallet,
    roles,
    verbose = true
) {
    if (verbose) {
        console.log(`Upgrading contract: ${oldContractName} with ${newContractName}`)
    }

    const implementationAddress = getAddressForImplementation(oldContractName)

    if (verbose) {
        console.log(`Upgrading proxy: ${proxyAddress} with implementation: ${implementationAddress}`)
    }

    const transactionId = await submitTransaction(
        upgraderWallet,
        proxyAddress,
        [
            'upgradeTo',
            ['address'],
            [implementationAddress]
        ],
        roles.upgrader,
        verbose
    )

    if (verbose) {
        console.log(`Upgraded contract: ${oldContractName}`)
    }

    return transactionId
}

module.exports = requestContractUpgrade
