/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const AccessConditions = artifacts.require('AccessConditions.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')

const utils = require('../../../helpers/utils.js')
const { initializeAgreement } = require('../../../helpers/initializeAgreement.js')

const web3 = utils.getWeb3()

contract('AccessConditions', (accounts) => {
    const assetId = '0x0000000000000000000000000000000000000000000000000000000000000001'
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

    beforeEach(async () => {
        sea = await ServiceExecutionAgreement.new({ from: accounts[0] })
        accessConditions = await AccessConditions.new(sea.address, { from: accounts[0] })
        contracts = [accessConditions.address]
        fingerprints = [utils.getSelector(web3, AccessConditions, 'grantAccess')]
        dependenciesBits = [0]
        valueHashes = [utils.valueHash(['bytes32', 'bytes32'], [assetId, assetId])]
        timeoutValues = [0]
        agreementId = utils.generateId()
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
                await accessConditions.grantAccess(agreementId, utils.emptyBytes32, utils.emptyBytes32, { from: consumer })
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
            const result = await accessConditions.grantAccess(agreementId, assetId, assetId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'AccessGranted')
            const hasPermission = await accessConditions.checkPermissions(consumer, assetId, { from: accounts[0] })
            assert.strictEqual(hasPermission, true)
        })

        it('Should not grant access when unfilfilled dependencies exist', async () => {
            // arrange
            dependenciesBits = [1]
            await initializeAgreementWithValues()

            // act
            const result = await accessConditions.grantAccess(agreementId, assetId, assetId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 0, 'AccessGranted')
        })
    })
})
