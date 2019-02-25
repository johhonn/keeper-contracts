const fs = require('fs')

const generateFunctionSignaturesInABI = require('./generateFunctionSignaturesInABI')

const buildDir = './build/contracts/'

function createArtifact(
    contractName,
    address,
    version
) {
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const contract = JSON.parse(fs.readFileSync(`${buildDir}${contractName}.json`, 'utf-8').toString())

    generateFunctionSignaturesInABI(contract.abi)

    return {
        abi: contract.abi,
        bytecode: contract.bytecode,
        address,
        version
    }
}

module.exports = createArtifact
