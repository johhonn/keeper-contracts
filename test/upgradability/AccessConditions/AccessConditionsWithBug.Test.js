/* eslint-env mocha */
/* global web3, artifacts, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement')
const AccessConditions = artifacts.require('AccessConditions')
const AccessConditionsWithBug = artifacts.require('AccessConditionsWithBug')

const { initializeAgreement } = require('../../helpers/initializeAgreement.js')

contract('AccessConditions', (accounts) => {
    let zos
    let accessConditionsAddress
    let serviceExecutionAgreement
    let consumer
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let agreementId

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('AccessConditions')
        await zos.restoreState(accounts[9])
        /* eslint-disable-next-line */
        consumer = accounts[2]
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('AccessConditions')
        await zos.initialize(accounts[0], true)
        accessConditionsAddress = zos.getProxyAddress('AccessConditions')
        serviceExecutionAgreement = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))
        contracts = [accessConditionsAddress]
        fingerprints = [testUtils.getSelector(web3, AccessConditions, 'grantAccess')]
        dependenciesBits = [0]
        valueHashes = [testUtils.valueHash(['bytes32'], [testUtils.assetId])]
        timeoutValues = [0]
        agreementId = testUtils.generateId()
    })

    describe('Test upgradability for AccessConditions', () => {
        it('Should be possible to fix/add a bug', async () => {
            await initializeAgreement(
                serviceExecutionAgreement,
                accounts[0],
                consumer,
                contracts,
                agreementId,
                fingerprints,
                valueHashes,
                timeoutValues,
                dependenciesBits
            )

            let p = await AccessConditionsWithBug.at(accessConditionsAddress)
            await zos.upgradeToNewContract('AccessConditionsWithBug')

            await testUtils.assertRevert(p.grantAccess(
                agreementId,
                testUtils.emptyBytes32,
                { from: consumer })
            )

            await zos.approveLatestTransaction()

            await p.grantAccess(
                agreementId,
                testUtils.emptyBytes32,
                { from: consumer })
        })
    })
})
