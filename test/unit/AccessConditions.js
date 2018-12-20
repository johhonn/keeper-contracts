/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const AccessConditions = artifacts.require('AccessConditions.sol')
const Agreement = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../utils.js')

const web3 = utils.getWeb3()

contract('AccessConditions constructor', (accounts) => {
    it('Should not deploy when agreement is empty', async () => {
        // act-assert
        try {
            await AccessConditions.new(0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'invalid contract address')
            return
        }
        assert.fail('Expected revert not received')
    })
})

contract('AccessConditions', (accounts) => {
    const assetId = '0x0000000000000000000000000000000000000000000000000000000000000001'
    const templateId = '0x0000000000000000000000000000000000000000000000000000000000000002'
    const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
    let agreement
    let contract
    let consumer
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let agreementId

    function createSignature(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer) {
        const conditionKeys = utils.generateConditionsKeys(templateId, contracts, fingerprints)
        const hash = utils.createSLAHash(web3, templateId, conditionKeys, valueHashes, timeoutValues, agreementId)
        return web3.eth.sign(hash, consumer)
    }

    async function initAgreement() {
        const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, agreementId, consumer)
        await agreement.setupTemplate(
            templateId,
            contracts,
            fingerprints,
            dependenciesBits,
            [0], 0, { from: accounts[0] })
        await agreement.executeAgreement(templateId, signature, consumer, [valueHashes], timeoutValues, agreementId, templateId, { from: accounts[0] })
    }

    beforeEach(async () => {
        agreement = await Agreement.new({ from: accounts[0] })
        contract = await AccessConditions.new(agreement.address, { from: accounts[0] })
        /* eslint-disable-next-line prefer-destructuring */
        consumer = accounts[1]
        contracts = [contract.address]
        fingerprints = [utils.getSelector(web3, AccessConditions, 'grantAccess')]
        dependenciesBits = [0]
        valueHashes = utils.valueHash(['bytes32', 'bytes32'], [assetId, assetId])
        timeoutValues = [0]
        agreementId = utils.generateId(web3)
    })

    describe('grantAccess', () => {
        it('Should not grant access when sender is not published', async () => {
            // arrange
            await initAgreement()

            // act-assert
            try {
                await contract.grantAccess(agreementId, emptyBytes32, emptyBytes32, { from: consumer })
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
            const result = await contract.grantAccess(agreementId, assetId, assetId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'AccessGranted')
            const hasPermission = await contract.checkPermissions(consumer, assetId, { from: accounts[0] })
            assert.strictEqual(hasPermission, true)
        })

        it('Should not grant access when unfilfilled dependencies exist', async () => {
            // arrange
            dependenciesBits = [1]
            await initAgreement()

            // act
            const result = await contract.grantAccess(agreementId, assetId, assetId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 0, 'AccessGranted')
        })
    })
})
