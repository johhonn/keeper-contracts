/* eslint-disable no-console */
const zosGetProxyAddress = require('./addresses/getProxyAddress')

async function getDeployedContracts(
    projectName,
    contracts,
    networkId,
    verbose = true
) {
    const deployedContracts = []

    if (verbose) {
        console.log(
            `Checking deployment state of contracts: '${contracts.join(', ')}'.`
        )
    }
    for (const contractName of contracts) {
        let proxyAddress
        let cleanedContractName

        if (contractName.indexOf(':') > -1) {
            [, cleanedContractName] = contractName.split(':')
        } else {
            cleanedContractName = contractName
        }

        try {
            proxyAddress = await zosGetProxyAddress(
                projectName,
                cleanedContractName,
                networkId
            )
        } catch (err) {
            // catch me if you can
        }

        if (proxyAddress) {
            if (verbose) {
                console.log(
                    `Contract ${cleanedContractName} is deployed.`
                )
            }

            deployedContracts.push(cleanedContractName)
        } else {
            if (verbose) {
                console.log(
                    `Contract ${cleanedContractName} is not deployed.`
                )
            }
        }
    }

    return deployedContracts
}

module.exports = getDeployedContracts
