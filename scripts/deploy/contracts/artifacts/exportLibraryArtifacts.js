/* eslint-disable no-console */
const writeArtifact = require('./writeArtifact')

const zosGetMigrations = require('../zos/handlers/getMigrations')

async function exportLibraryArtifacts(
    networkName,
    networkId,
    version,
    verbose = true
) {
    const { solidityLibs } = zosGetMigrations(networkId)

    const solidityLibNames = Object.keys(solidityLibs)

    for (const solidityLibName of solidityLibNames) {
        if (verbose) {
            console.log(
                `Exporting library: ${solidityLibName}.${networkName}.json`
            )
        }

        const artifact = writeArtifact(
            solidityLibName,
            solidityLibs[solidityLibName].address,
            networkName,
            version
        )

        if (verbose) {
            console.log(
                `Exported library artifact: ${artifact.version} of ${solidityLibName} at ${artifact.address}`
            )
        }
    }
}

module.exports = exportLibraryArtifacts
