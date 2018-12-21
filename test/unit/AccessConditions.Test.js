/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const AccessConditions = artifacts.require('AccessConditions.sol')
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../helpers/utils.js')

const web3 = utils.getWeb3()

contract('AccessConditions constructor', (accounts) => {
    it('Should not deploy when agreement is empty', async () => {
        // act-assert
        try {
            await AccessConditions.new(0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'invalid address')
            return
        }
        assert.fail('Expected revert not received')
    })
})

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

    function createSignature(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer) {
        const conditionKeys = utils.generateConditionsKeys(utils.templateId, contracts, fingerprints)
        const hash = utils.createSLAHash(web3, utils.templateId, conditionKeys, valueHashes, timeoutValues, agreementId)
        return web3.eth.sign(hash, consumer)
    }

    async function initAgreement() {
        const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
        await sea.setupTemplate(
            utils.templateId,
            contracts,
            fingerprints,
            dependenciesBits,
            [0], 0, { from: accounts[0] })
        await sea.initializeAgreement(utils.templateId, signature, consumer, [valueHashes], timeoutValues, agreementId, utils.templateId, { from: accounts[0] })
    }

    beforeEach(async () => {
        sea = await ServiceExecutionAgreement.new({ from: accounts[0] })
        accessConditions = await AccessConditions.new(sea.address, { from: accounts[0] })
        contracts = [accessConditions.address]
        fingerprints = [utils.getSelector(web3, AccessConditions, 'grantAccess')]
        dependenciesBits = [0]
        valueHashes = utils.valueHash(['bytes32', 'bytes32'], [assetId, assetId])
        timeoutValues = [0]
        agreementId = utils.generateId()
    })

    describe('grantAccess', () => {
        it('Should not grant access when sender is not published', async () => {
            // arrange
            await initAgreement()

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
            await initAgreement()

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
            await initAgreement()

            // act
            const result = await accessConditions.grantAccess(agreementId, assetId, assetId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 0, 'AccessGranted')
        })
    })
})
