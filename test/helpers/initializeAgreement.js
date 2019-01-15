const { signAgreement } = require('./signAgreement.js')
const testUtils = require('./utils.js')

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
        testUtils.templateId,
        contracts,
        fingerprints,
        dependenciesBits,
        [0], 0, { from: templateAccount })
    await serviceAgreementContract.initializeAgreement(
        testUtils.templateId,
        signature,
        consumerAccount,
        valueHashes,
        timeoutValues,
        agreementId,
        testUtils.templateId,
        { from: templateAccount })
}

module.exports.initializeAgreement = initializeAgreement
