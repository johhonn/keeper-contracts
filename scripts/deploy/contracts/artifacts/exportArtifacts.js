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
        networkName,
        networkId,
        version,
        verbose
    )

    await exportLibraryArtifacts(
        networkName,
        networkId,
        version,
        verbose
    )

    if (verbose) {
        console.log(projectName, version, networkName)
    }
}

module.exports = exportArtifacts
