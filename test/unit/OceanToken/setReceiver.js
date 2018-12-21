/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const OceanToken = artifacts.require('OceanToken.sol')

contract('OceanToken', (accounts) => {
    let token

    beforeEach(async () => {
        token = await OceanToken.new({ from: accounts[0] })
        await token.setReceiver(accounts[0])
    })

    describe('setReceiver', () => {
        it('Should set receiver', async () => {
            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(parseInt(balance, 10), 1400000000000000000000000000)
            assert.strictEqual(await token.receiver(), accounts[0])
        })

        it('Should not set receiver twice', async () => {
            // act-assert
            try {
                await token.setReceiver(accounts[1])
            } catch (e) {
                assert.strictEqual(e.reason, 'Receiver address already set.')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
