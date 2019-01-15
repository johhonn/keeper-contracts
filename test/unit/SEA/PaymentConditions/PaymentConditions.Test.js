/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const PaymentConditions = artifacts.require('PaymentConditions.sol')

const testUtils = require('../../../helpers/utils.js')

contract('PaymentConditions constructor', (accounts) => {
    it('Should not deploy when agreement is empty', async () => {
        // act-assert
        try {
            await PaymentConditions.new(0x0, 0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'invalid address')
            return
        }
        assert.fail('Expected revert not received')
    })

    it('Should not deploy when token is empty', async () => {
        // act-assert
        try {
            await PaymentConditions.new(testUtils.dummyAddress, 0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'invalid address')
            return
        }
        assert.fail('Expected revert not received')
    })
})
