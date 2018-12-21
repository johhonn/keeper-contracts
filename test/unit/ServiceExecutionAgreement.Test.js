/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const utils = require('../utils.js')

const web3 = utils.getWeb3()

contract('ServiceExecutionAgreement', (accounts) => {
    const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
    let contract
    let consumer
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let serviceAgreementId

    function createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer) {
        const conditionKeys = utils.generateConditionsKeys(utils.templateId, contracts, fingerprints)
        const hash = utils.createSLAHash(web3, utils.templateId, conditionKeys, valueHashes, timeoutValues, serviceAgreementId)
        return web3.eth.sign(hash, consumer)
    }

    async function initAgreement() {
        const signature = await createSignature(
            contracts,
            fingerprints,
            valueHashes,
            timeoutValues,
            serviceAgreementId,
            consumer)
        await contract.setupTemplate(
            utils.templateId,
            contracts,
            fingerprints,
            dependenciesBits,
            [0], 0, { from: accounts[0] })
        await contract.executeAgreement(
            utils.templateId,
            signature,
            consumer,
            valueHashes,
            timeoutValues,
            serviceAgreementId,
            utils.templateId,
            { from: accounts[0] })
    }

    beforeEach(async () => {
        contract = await ServiceExecutionAgreement.new({ from: accounts[0] })
        /* eslint-disable-next-line prefer-destructuring */
        consumer = accounts[1]
        contracts = [accounts[2]]
        fingerprints = ['0x2e0a37a5']
        dependenciesBits = [0]
        valueHashes = [utils.valueHash(['bool'], [true])]
        timeoutValues = [0]
        serviceAgreementId = utils.generateId(web3)
    })

    describe('setupAgreementTemplate', () => {
        it('Should setup agreement without contracts', async () => {
            // act
            const result = await contract.setupTemplate(
                utils.templateId,
                [], [], [], [], 0, { from: accounts[0] })

            // aassert
            utils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await contract.getTemplateStatus(utils.templateId)
            assert.strictEqual(status, true)
        })

        it('Should not accept different amount of contracts and fingerprints', async () => {
            // act-assert
            try {
                await contract.setupTemplate(
                    utils.templateId,
                    [], ['0x1234'], [], [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'fingerprints and contracts length do not match')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not accept different amount of contracts and dependencies', async () => {
            // act-assert
            try {
                await contract.setupTemplate(
                    utils.templateId,
                    [utils.dummyAddress],
                    ['0x1234'], [], [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'contracts and dependencies do not match')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not accept less amount of contracts than fulfillment indices', async () => {
            // act-assert
            try {
                await contract.setupTemplate(
                    utils.templateId,
                    [utils.dummyAddress],
                    ['0x1234'],
                    [1], [1, 2], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid fulfillment indices')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not accept less amount of fulfillment indices than fulfillment operators', async () => {
            // act-assert
            try {
                await contract.setupTemplate(
                    utils.templateId,
                    [utils.dummyAddress],
                    ['0x1234'],
                    [1], [1], 2, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid fulfillment operator')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should setup agreement with contracts', async () => {
            // act
            const result = await contract.setupTemplate(
                utils.templateId,
                [utils.dummyAddress],
                ['0x1234'],
                [1], [1], 1, { from: accounts[0] })

            // aassert
            utils.assertEmitted(result, 1, 'SetupCondition')
            utils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await contract.getTemplateStatus(utils.templateId)
            assert.strictEqual(status, true)
        })

        it('Should setup unique agreement only', async () => {
            // arrange
            await contract.setupTemplate(utils.templateId, [], [], [], [], 0, { from: accounts[0] })

            // act-aassert
            try {
                await contract.setupTemplate(utils.templateId, [], [], [], [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Template ID already exists')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('executeAgreement', () => {
        it('Should execute exist agreement only', async () => {
            // act-aassert
            try {
                await contract.executeAgreement(utils.templateId, '0x10', utils.dummyAddress, [], [], emptyBytes32, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Template is revoked')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not execute agreement with invalid timeout length', async () => {
            // arrange
            await contract.setupTemplate(
                utils.templateId,
                [utils.dummyAddress],
                ['0x1234'],
                [1], [1], 1, { from: accounts[0] })

            // act-assert
            try {
                await contract.executeAgreement(utils.templateId, '0x10', utils.dummyAddress, [], [], emptyBytes32, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid timeout values length')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not execute agreement (revert) when signature is not valid', async () => {
            // arrange
            await contract.setupTemplate(utils.templateId, [], [], [], [], 0, { from: accounts[0] })

            // act-assert
            try {
                await contract.executeAgreement(utils.templateId, '0x10', utils.dummyAddress, [], [], emptyBytes32, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid consumer signature of service agreement')
                return
            }
            assert.fail('Expected revert not received on invalid signature')
        })

        it('Should execute condition when signature is valid', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints,
                [0], [0], 0, { from: accounts[0] })

            // act
            const result = await contract.executeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, serviceAgreementId, utils.templateId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ExecuteCondition')
            utils.assertEmitted(result, 1, 'ExecuteAgreement')
        })

        it('Should revert when timeout can lead to race condition', async () => {
            // arrange
            timeoutValues = [1]
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupTemplate(utils.templateId, contracts, fingerprints, [0], [0], 0, { from: accounts[0] })

            // act-assert
            try {
                await contract.executeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, serviceAgreementId, utils.templateId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid timeout with a margin (~ 30 to 40 seconds = 2 blocks intervals) to avoid race conditions')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should execute condition when signature is valid and safe timeout', async () => {
            // arrange
            timeoutValues = [3]
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints,
                [0], [0], 0, { from: accounts[0] })

            // act
            const result = await contract.executeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, serviceAgreementId, utils.templateId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ExecuteCondition')
            utils.assertEmitted(result, 1, 'ExecuteAgreement')
        })
    })

    describe('fulfillCondition', () => {
        it('Should not fulfill condition when controller handler is not valid', async () => {
            // arrange
            await initAgreement()

            // act-assert
            try {
                await contract.fulfillCondition(serviceAgreementId, fingerprints[0], valueHashes[0], { from: accounts[1] })
            } catch (e) {
                assert.strictEqual(e.reason, 'unable to reconstruct the right condition hash')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill condition when controller handler is valid', async () => {
            // arrange
            await initAgreement()

            // act
            const result = await contract.fulfillCondition(serviceAgreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })

            // assert
            utils.assertEmitted(result, 1, 'ConditionFulfilled')
        })

        it('Should not fulfill condition with unfulfilled dependency', async () => {
            // arrange
            dependenciesBits = [1]
            await initAgreement()

            // act-assert
            try {
                await contract.fulfillCondition(serviceAgreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'This condition has unfulfilled dependency')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should fulfill condition and lock dependencies when controller handler is valid', async () => {
            // arrange
            dependenciesBits = [3]
            await initAgreement()

            // act
            const result = await contract.fulfillCondition(serviceAgreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })

            // assert
            utils.assertEmitted(result, 1, 'ConditionFulfilled')
        })
    })

    describe('fulfillAgreement', () => {
        it('Should fulfill agreement with non pending conditions', async () => {
            // arrange
            await initAgreement()
            await contract.fulfillCondition(serviceAgreementId, fingerprints[0], valueHashes[0], { from: accounts[2] })

            // act
            const result = await contract.fulfillAgreement(serviceAgreementId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'AgreementFulfilled')
            const isTerminated = await contract.isAgreementTerminated(serviceAgreementId, { from: accounts[0] })
            assert.strictEqual(isTerminated, true)
            const agreementStatus = await contract.isAgreementAvailable(serviceAgreementId, { from: accounts[0] })
            assert.strictEqual(agreementStatus, true)
        })

        it('Should not fulfill agreement with pending conditions', async () => {
            // arrange
            await initAgreement()

            // act-assert
            try {
                await contract.fulfillAgreement(serviceAgreementId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Indicating one of the fulfillment conditions is false')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not fulfill agreement with pending conditions when single operator', async () => {
            // arrange
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints,
                [0], [0], 1, { from: accounts[0] })
            await contract.executeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, serviceAgreementId, utils.templateId, { from: accounts[0] })

            // act-assert
            try {
                await contract.fulfillAgreement(serviceAgreementId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Indicating all fulfillment conditions are false')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not fulfill agreement with pending conditions when multiple operators', async () => {
            // arrange
            contracts = [accounts[2], accounts[2]]
            fingerprints = ['0x2e0a37a5', '0x2e0a37a6']
            valueHashes = [utils.valueHash(['bool'], [true]), utils.valueHash(['bool'], [true])]
            timeoutValues = [0, 0]
            const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
            await contract.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints,
                [0, 0], [0, 1], 2, { from: accounts[0] })
            await contract.executeAgreement(utils.templateId, signature, consumer, valueHashes, timeoutValues, serviceAgreementId, utils.templateId, { from: accounts[0] })

            // act-assert
            try {
                await contract.fulfillAgreement(serviceAgreementId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Indicating N of M fulfillment conditions are false')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('revokeTemplate', () => {
        it('Should not revoke by non template owner', async () => {
            // arrange
            await contract.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints,
                [0], [0], 0, { from: accounts[0] })

            // act-assert
            try {
                await contract.revokeTemplate(utils.templateId, { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Not a template owner')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not revoke template when state of agreement is false', async () => {
            // arrange
            await initAgreement()

            // act-assert
            try {
                await contract.revokeTemplate(utils.templateId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Owner can not revoke template!')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should revoke template', async () => {
            // arrange
            await contract.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints,
                [0], [0], 0, { from: accounts[0] })

            // act
            const result = await contract.revokeTemplate(utils.templateId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'SLATemplateRevoked')
            const status = await contract.getTemplateStatus(utils.templateId)
            assert.strictEqual(status, false)
        })
    })

    describe('getConditionStatus', () => {
        it('Should not return condition status for non exists condition', async () => {
            // arrange
            dependenciesBits = [3]
            await initAgreement()

            // act-assert
            try {
                await contract.getConditionStatus(serviceAgreementId, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should return condition status', async () => {
            // arrange
            dependenciesBits = [3]
            await initAgreement()
            const conditionKey = await contract.generateConditionKeyForId(serviceAgreementId, contracts[0], fingerprints[0], { from: accounts[0] })

            // act
            const result = await contract.getConditionStatus(serviceAgreementId, conditionKey, { from: accounts[0] })

            // assert
            assert.strictEqual(result.toNumber(), 0)
        })
    })

    describe('conditionTimedOut', () => {
        it('Should return true when condition timeout matches', async () => {
            // arrange
            dependenciesBits = [3]
            await initAgreement()
            const conditionKey = await contract.generateConditionKeyForId(serviceAgreementId, contracts[0], fingerprints[0], { from: accounts[0] })

            // act
            const result = await contract.conditionTimedOut(serviceAgreementId, conditionKey, { from: accounts[0] })

            // assert
            assert.strictEqual(result, true)
        })

        it('Should return false when condition timeout does not match', async () => {
            // arrange
            timeoutValues = [100]
            dependenciesBits = [3]
            await initAgreement()
            const conditionKey = await contract.generateConditionKeyForId(serviceAgreementId, contracts[0], fingerprints[0], { from: accounts[0] })

            // act
            const result = await contract.conditionTimedOut(serviceAgreementId, conditionKey, { from: accounts[0] })

            // assert
            assert.strictEqual(result, false)
        })
    })

    describe('views', () => {
        it('Should return current block', async () => {
            // act
            const result = await contract.getCurrentBlockNumber({ from: accounts[0] })

            // assert
            assert.isOk(result > 0)
        })

        it('Should return tempalte owner', async () => {
            // arrange
            await contract.setupTemplate(
                utils.templateId,
                contracts,
                fingerprints, [0], [0], 0, { from: accounts[0] })

            // act
            const result = await contract.getTemplateOwner(utils.templateId, { from: accounts[0] })

            // assert
            assert.strictEqual(result, accounts[0])
        })
    })
})
