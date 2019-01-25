const testUtils = require('./utils.js')
const web3 = testUtils.getWeb3()
const { hashAgreement } = require('./hashAgreement.js')

const signAgreement = function signAgreement(
    contracts,
    fingerprints,
    valueHashes,
    timeoutValues,
    agreementId,
    consumer
) {
    const conditionKeys = testUtils.generateConditionsKeys(
        testUtils.templateId,
        contracts,
        fingerprints)
    const hash = hashAgreement(
        testUtils.templateId,
        conditionKeys,
        valueHashes,
        timeoutValues,
        agreementId)
    return web3.eth.sign(hash, consumer)
}

module.exports.signAgreement = signAgreement
