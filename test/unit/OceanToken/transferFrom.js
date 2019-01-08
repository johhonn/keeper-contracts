/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const OceanToken = artifacts.require('OceanToken.sol')

contract('OceanToken', (accounts) => {
    let token

    beforeEach(async () => {
        token = await OceanToken.new({ from: accounts[0] })
        await token.mint(accounts[0], 1000)
    })

    describe('transferFrom', () => {
        it('Should transfer', async () => {
            // arrange
            await token.approve(accounts[1], 100, { from: accounts[0] })

            // act
            await token.transferFrom(accounts[0], accounts[2], 100, { from: accounts[1] })

            // assert
            const balance = await token.balanceOf(accounts[2])
            assert.strictEqual(balance.toNumber(), 100)
        })

        it('Should not transfer to empty address', async () => {
            // arrange
            await token.approve(accounts[1], 100, { from: accounts[0] })

            // act-assert
            try {
                await token.transferFrom(accounts[0], 0x0, 100, { from: accounts[1] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid address')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
