const generateFunctionSignaturesInABI = require('./generateFunctionSignaturesInABI')

const buildDir = `${__dirname}/../../../../build/contracts/`

function createArtifact(
    name,
    address,
    version
) {
    /* eslint-disable-next-line security/detect-non-literal-require */
    const contract = require(`${buildDir}${name}.json`)

    // create function signatures in ABI
    generateFunctionSignaturesInABI(
        contract.abi
    )

    return {
        abi: contract.abi,
        bytecode: contract.bytecode,
        address,
        version
    }
}

module.exports = createArtifact
