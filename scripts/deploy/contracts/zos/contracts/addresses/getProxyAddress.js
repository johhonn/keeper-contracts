const zosGetMigrations = require('../../handlers/getMigrations')

async function getImplementationAddress(
    projectName,
    contractName,
    networkId
) {
    const { proxies } = zosGetMigrations(networkId)
    const proxyEntries = proxies[`${projectName}/${contractName}`]
    return proxyEntries[proxyEntries.length - 1].address
}

module.exports = getImplementationAddress
