const utils = require('./utils.js')
const web3 = utils.getWeb3()

const hashAgreement = function(
    templateId,
    conditionsKeys,
    hashes,
    timeouts,
    agreementId
) {
    return web3.utils.soliditySha3(
        { type: 'bytes32', value: templateId },
        { type: 'bytes32[]', value: conditionsKeys },
        { type: 'bytes32[]', value: hashes },
        { type: 'uint256[]', value: timeouts },
        { type: 'bytes32', value: agreementId }
    ).toString('hex')
}

module.exports.hashAgreement = hashAgreement
