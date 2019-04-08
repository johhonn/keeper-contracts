const fs = require('fs')

const generateFunctionSignaturesInABI = require('./generateFunctionSignaturesInABI')

const buildDir = `${__dirname}/../../../../build/contracts/`

function createArtifact(
    name,
    proxyAddress,
    implementationAddress,
    version
) {
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const contractString = fs.readFileSync(
        `${buildDir}${name}.json`,
        'utf8'
    ).toString()

    const contract = JSON.parse(contractString)

    // create function signatures in ABI
    contract.abi = generateFunctionSignaturesInABI(
        contract.abi
    )

    return {
        name,
        abi: contract.abi,
        bytecode: contract.bytecode,
        address: proxyAddress,
        implementation: implementationAddress,
        version
    }
}

module.exports = createArtifact
