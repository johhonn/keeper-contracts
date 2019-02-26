const zosGetMigrations = require('./getMigrations')

function getAddressForImplementation(
    contractName
) {
    const { contracts } = zosGetMigrations()
    const implementation = contracts && contracts[contractName]
    return implementation.address
}

module.exports = getAddressForImplementation
