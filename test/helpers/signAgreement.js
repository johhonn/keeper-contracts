const utils = require('./utils.js')
const web3 = utils.getWeb3()
const { hashAgreement } = require('./hashAgreement.js')

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
    const hash = hashAgreement(
        utils.templateId,
        conditionKeys,
        valueHashes,
        timeoutValues,
        agreementId)
    return web3.eth.sign(hash, consumer)
}

module.exports.signAgreement = signAgreement
