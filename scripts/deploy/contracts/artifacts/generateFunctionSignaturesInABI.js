const createFunctionSignature = require('./createFunctionSignature')

function generateFunctionSignaturesInABI(
    abi
) {
    abi
        .filter((abiEntry) => abiEntry.type === 'function')
        .forEach((abiEntry) => {
            const parameters = abiEntry.inputs.map((i) => i.type)
            abiEntry.signature = createFunctionSignature({
                functionName: abiEntry.name,
                parameters
            })
        })

    return abi
}

module.exports = generateFunctionSignaturesInABI
