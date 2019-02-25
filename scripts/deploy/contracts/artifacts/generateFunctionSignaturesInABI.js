const web3 = require('web3')

function generateFunctionSignaturesInABI(
    abi
) {
    abi
        .filter((abiEntry) => abiEntry.type === 'function')
        .forEach((abiEntry) => {
            const parameters = abiEntry.inputs.map((i) => i.type)
            const signature = `${abiEntry.name}(${parameters.join(',')})`

            const signatureHash = web3.utils.sha3(signature)
            abiEntry.signature = signatureHash.substring(0, 10)
        })
}

module.exports = generateFunctionSignaturesInABI
