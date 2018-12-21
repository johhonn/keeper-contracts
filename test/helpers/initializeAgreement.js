const { signAgreement } = require('./signAgreement.js')
const utils = require('./utils.js')

const initializeAgreement = async function initializeAgreement(
    serviceAgreementContract,
    templateAccount,
    consumerAccount,
    contracts,
    agreementId,
    fingerprints,
    valueHashes,
    timeoutValues,
    dependenciesBits
) {
    const signature = await signAgreement(
        contracts,
        fingerprints,
        valueHashes,
        timeoutValues,
        agreementId,
        consumerAccount)
    await serviceAgreementContract.setupTemplate(
        utils.templateId,
        contracts,
        fingerprints,
        dependenciesBits,
        [0], 0, { from: templateAccount })
    await serviceAgreementContract.initializeAgreement(
        utils.templateId,
        signature,
        consumerAccount,
        valueHashes,
        timeoutValues,
        agreementId,
        utils.templateId,
        { from: templateAccount })
}

module.exports.initializeAgreement = initializeAgreement
