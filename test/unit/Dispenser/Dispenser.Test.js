/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const Dispenser = artifacts.require('Dispenser.sol')

contract('Dispenser constructor', (accounts) => {
    it('Should not deploy if token is empty', async () => {
        // act-assert
        try {
            await Dispenser.new(0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'invalid address')
            return
        }
        assert.fail('Expected revert not received')
    })
})
