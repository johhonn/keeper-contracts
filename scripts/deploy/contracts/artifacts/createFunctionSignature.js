const web3 = require('web3')

function createFunctionSignature({
    functionName,
    parameters
} = {}) {
    const signature = `${functionName}(${parameters.join(',')})`

    const signatureHash = web3.utils.sha3(signature)
    return signatureHash.substring(0, 10)
}

module.exports = createFunctionSignature
