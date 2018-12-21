/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const AccessConditions = artifacts.require('AccessConditions.sol')

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
