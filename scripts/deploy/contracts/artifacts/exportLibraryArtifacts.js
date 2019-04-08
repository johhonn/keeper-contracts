/* eslint-disable no-console */
const createArtifact = require('./createArtifact')
const writeArtifact = require('./writeArtifact')

const zosGetMigrations = require('../zos/handlers/getMigrations')

async function exportLibraryArtifacts(
    networkId,
    networkName,
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

        // create the artifact
        const artifact = createArtifact(
            solidityLibName,
            solidityLibs[solidityLibName].address,
            solidityLibs[solidityLibName].address,
            version
        )

        writeArtifact(
            artifact,
            networkName
        )

        if (verbose) {
            console.log(
                `Exported library artifact: ${artifact.version} of ${solidityLibName} at ${artifact.address}`
            )
        }
    }
}

module.exports = exportLibraryArtifacts
