/* eslint-disable no-console */
const exportContractArtifacts = require('./exportContractArtifacts')
const exportLibraryArtifacts = require('./exportLibraryArtifacts')

async function exportArtifacts(
    projectName,
    networkName,
    networkId,
    version,
    verbose = true
) {
    if (verbose) {
        console.log(`Exporting: ${projectName}`)
    }

    await exportContractArtifacts(
        projectName,
        networkId,
        networkName,
        version,
        verbose
    )

    await exportLibraryArtifacts(
        networkId,
        networkName,
        version,
        verbose
    )

    if (verbose) {
        console.log(projectName, version, networkName)
    }
}

module.exports = exportArtifacts
