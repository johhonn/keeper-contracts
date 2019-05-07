const loadArtifact = require('./loadArtifact')

async function loadArtifacts({
    contractNames,
    networkName
} = {}) {
    const artifacts = []

    for (const contractName of contractNames) {
        const artifact = await loadArtifact(
            contractName,
            networkName
        )
        artifacts.push(artifact)
    }

    return artifacts
}

module.exports = loadArtifacts
