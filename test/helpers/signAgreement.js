const utils = require('./utils.js')
const web3 = utils.getWeb3()

const signAgreement = function signAgreement(
    contracts,
    fingerprints,
    valueHashes,
    timeoutValues,
    agreementId,
    consumer
) {
    const conditionKeys = utils.generateConditionsKeys(
        utils.templateId,
        contracts,
        fingerprints)
    const hash = utils.createSLAHash(
        web3,
        utils.templateId,
        conditionKeys,
        valueHashes,
        timeoutValues,
        agreementId)
    return web3.eth.sign(hash, consumer)
}

module.exports.signAgreement = signAgreement
