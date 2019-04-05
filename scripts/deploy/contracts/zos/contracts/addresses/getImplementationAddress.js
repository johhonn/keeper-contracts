const zosGetMigrations = require('../../handlers/getMigrations')

function getImplementationAddress(
    contractName,
    networkId
) {
    const { contracts } = zosGetMigrations(networkId)
    const implementation = contracts && contracts[contractName]
    return implementation.address
}

module.exports = getImplementationAddress
