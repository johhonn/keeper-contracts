const zosGetMigrations = require('./getMigrations')

function getAddressForImplementation(
    contractName,
    networkId
) {
    const { contracts } = zosGetMigrations(networkId)
    const implementation = contracts && contracts[contractName]
    return implementation.address
}

module.exports = getAddressForImplementation
