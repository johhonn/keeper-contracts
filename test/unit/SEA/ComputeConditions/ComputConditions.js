/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ComputeConditions = artifacts.require('ComputeConditions.sol')

contract('ComputeConditions constructor', (accounts) => {
    it('Should not deploy when agreement is empty', async () => {
        // act-assert
        try {
            await ComputeConditions.new(0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'invalid address')
            return
        }
        assert.fail('Expected revert not received')
    })
})
