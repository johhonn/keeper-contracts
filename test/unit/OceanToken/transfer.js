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

    describe('transfer', () => {
        it('Should transfer', async () => {
            // act
            await token.transfer(accounts[1], 100, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[1])
            assert.strictEqual(balance.toNumber(), 100)
        })

        it('Should not transfer to empty address', async () => {
            // act-assert
            try {
                await token.transfer(0x0, 100, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid address')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
