/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const OceanToken = artifacts.require('OceanToken.sol')

contract('OceanToken', (accounts) => {
    let oceanToken
    let spender

    before('restore state before all tests', async () => {
        /* eslint-disable-next-line */
        spender = accounts[1]
    })

    describe('transferFrom', () => {
        beforeEach('mint tokens before each test', async () => {
            oceanToken = await OceanToken.new()
            await oceanToken.initialize(accounts[0], accounts[0])
            await oceanToken.mint(spender, 1000)
        })

        it('Should transfer', async () => {
            // arrange
            await oceanToken.approve(accounts[2], 100, { from: spender })

            // act
            await oceanToken.transferFrom(spender, accounts[3], 100, { from: accounts[2] })

            // assert
            const balance = await oceanToken.balanceOf(accounts[3])
            assert.strictEqual(balance.toNumber(), 100)
        })

        it('Should not transfer to empty address', async () => {
            // arrange
            await oceanToken.approve(accounts[2], 100, { from: spender })

            // act-assert
            try {
                await oceanToken.transferFrom(spender, 0x0, 100, { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid address')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
