/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, before, beforeEach */

const ZeppelinHelper = require('../../../helpers/ZeppelinHelper.js')
const AccessConditions = artifacts.require('AccessConditions.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')

const testUtils = require('../../../helpers/utils.js')
const { initializeAgreement } = require('../../../helpers/initializeAgreement.js')

const web3 = testUtils.getWeb3()

contract('AccessConditions', (accounts) => {
    let sea
    let accessConditions
    /* eslint-disable-next-line prefer-destructuring */
    const consumer = accounts[1]
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let agreementId
    let zos

    before(async () => {
        zos = new ZeppelinHelper('AccessConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach(async () => {
        await zos.initialize(accounts[0], false)
        sea = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))
        accessConditions = await AccessConditions.at(zos.getProxyAddress('AccessConditions'))
        contracts = [accessConditions.address]
        fingerprints = [testUtils.getSelector(web3, AccessConditions, 'grantAccess')]
        dependenciesBits = [0]
        valueHashes = [testUtils.valueHash(['bytes32'], [testUtils.assetId])]
        timeoutValues = [0]
        agreementId = testUtils.generateId()
    })

    async function initializeAgreementWithValues() {
        return initializeAgreement(
            sea,
            accounts[0],
            consumer,
            contracts,
            agreementId,
            fingerprints,
            valueHashes,
            timeoutValues,
            dependenciesBits)
    }

    describe('grantAccess', () => {
        it('Should not grant access when sender is not published', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act-assert
            try {
                await accessConditions.grantAccess(
                    agreementId,
                    testUtils.emptyBytes32,
                    { from: consumer })
            } catch (e) {
                assert.strictEqual(e.reason, 'Restricted access - only SLA publisher')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should grant access', async () => {
            // arrange
            await initializeAgreementWithValues()

            // act
            const result = await accessConditions.grantAccess(
                agreementId,
                testUtils.assetId,
                { from: accounts[0] })

            // assert
            testUtils.assertEmitted(result, 1, 'AccessGranted')
            const hasPermission = await accessConditions.checkPermissions(
                consumer,
                testUtils.assetId,
                { from: accounts[0] })
            assert.strictEqual(hasPermission, true)
        })

        it('Should not grant access when unfilfilled dependencies exist', async () => {
            // arrange
            dependenciesBits = [1]
            await initializeAgreementWithValues()

            // act
            const result = await accessConditions.grantAccess(
                agreementId,
                testUtils.assetId,
                { from: accounts[0] })

            // assert
            testUtils.assertEmitted(result, 0, 'AccessGranted')
        })
    })
})
