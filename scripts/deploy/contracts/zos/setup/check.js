/* eslint-disable no-console */
const getProxyAddress = require('../addresses/getProxyAddress')

async function check(
    projectName,
    contracts,
    networkId,
    verbose = true
) {
    let success = true

    contracts.forEach(async (contractName) => {
        let proxyAddress

        proxyAddress = await getProxyAddress(
            projectName,
            contractName,
            networkId
        )
            .catch((error) => {
                if (verbose) {
                    console.log(
                        `No zos file for network '${networkId}'`
                    )
                }
            })

        if (proxyAddress) {
            if (verbose) {
                console.log(
                    `Contract ${contractName} already deployed. Please use 'upgrade ${contractName}'.`
                )
            }

            success = false
        }

        return success
    })
}

module.exports = check
