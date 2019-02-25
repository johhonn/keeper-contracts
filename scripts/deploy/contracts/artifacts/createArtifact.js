const generateFunctionSignaturesInABI = require('./generateFunctionSignaturesInABI')

const buildDir = `${__dirname}/../../../../build/contracts/`

function createArtifact(
    contractName,
    proxyAddress,
    version
) {
    /* eslint-disable-next-line security/detect-non-literal-require */
    const contract = require(`${buildDir}${contractName}.json`)

    // create function signatures in ABI
    generateFunctionSignaturesInABI(contract.abi)

    return {
        abi: contract.abi,
        bytecode: contract.bytecode,
        address: proxyAddress,
        version
    }
}

module.exports = createArtifact
