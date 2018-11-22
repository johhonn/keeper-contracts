/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const utils = require('./utils.js')

contract('ServiceAgreement', (accounts) => {
    const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const id = '0x0000000000000000000000000000000000000000000000000000000000000001'
    const address = '0x1111aaaaeeeeffffcccc22223333444455556666'
    let contract

    beforeEach(async () => {
        contract = await ServiceAgreement.new({ from: accounts[0] })
    })

    describe('setupAgreementTemplate', () => {
        it('Should setup agreement without contracts', async () => {
            // act
            const result = await contract.setupAgreementTemplate(id, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })

            // aassert
            utils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await contract.getTemplateStatus(id)
            assert.strictEqual(status, true)
        })

        it('Should accept same amount of contracts as fingerprints', async () => {
            // act-assert
            try {
                await contract.setupAgreementTemplate(id, [], ['0x1234'], [], emptyBytes32, [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'fingerprints and contracts length do not match')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should accept same amount of contracts as dependencies', async () => {
            // act-assert
            try {
                await contract.setupAgreementTemplate(id, ['0x1111aaaaeeeeffffcccc22223333444455556666'], ['0x1234'], [], emptyBytes32, [], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'contracts and dependencies do not match')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should accept same or more amount of contracts as fulfillment indices', async () => {
            // act-assert
            try {
                await contract.setupAgreementTemplate(id, [address], ['0x1234'], [1], emptyBytes32, [1, 2], 0, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid fulfillment indices')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should accept same or more amount of fulfillment indices than fulfillment operators', async () => {
            // act-assert
            try {
                await contract.setupAgreementTemplate(id, [address], ['0x1234'], [1], emptyBytes32, [1], 2, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Invalid fulfillment operator')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should setup agreement with contracts', async () => {
            // act
            const result = await contract.setupAgreementTemplate(id, [address], ['0x1234'], [1], emptyBytes32, [1], 1, { from: accounts[0] })

            // aassert
            utils.assertEmitted(result, 1, 'SetupCondition')
            utils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await contract.getTemplateStatus(id)
            assert.strictEqual(status, true)
        })

        it('Should setup unique agreement only', async () => {
            // arrange
            await contract.setupAgreementTemplate(id, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })

            // act-aassert
            try {
                await contract.setupAgreementTemplate(id, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })
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
                await contract.executeAgreement(id, '0x10', address, [], [], emptyBytes32, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Template is revoked')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should execute agreement with valid timeout length only', async () => {
            // arrange
            await contract.setupAgreementTemplate(id, [address], ['0x1234'], [1], emptyBytes32, [1], 1, { from: accounts[0] })

            // act-aassert
            try {
                await contract.executeAgreement(id, '0x10', address, [], [], emptyBytes32, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid timeout values length')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should emit event when signature is not valid', async () => {
            // arrange
            await contract.setupAgreementTemplate(id, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })

            // act
            const result = await contract.executeAgreement(id, '0x10', address, [], [], emptyBytes32, emptyBytes32, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'ExecuteAgreement')
            assert.strictEqual(!!(result.logs.find(i => i.event === 'ExecuteAgreement').args.state), false)
        })
    })
})
