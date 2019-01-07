/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, beforeEach */

const Dispenser = artifacts.require('Dispenser.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const utils = require('../../helpers/utils.js')

contract('Dispenser', (accounts) => {
    let token
    let dispenser

    beforeEach(async () => {
        token = await OceanToken.new({ from: accounts[0] })
        dispenser = await Dispenser.new(token.address, { from: accounts[0] })
        await token.addMinter(dispenser.address)
    })

    describe('requestTokens', () => {
        it('Should transfer tokens', async () => {
            // act
            await dispenser.requestTokens(200, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(balance.toNumber(), 200)
        })

        it('Should not transfer frequently', async () => {
            // arrange
            await dispenser.setMinPeriod(10)
            await dispenser.setMaxAmount(10)
            await dispenser.requestTokens(10, { from: accounts[0] })

            // act
            const result = await dispenser.requestTokens(10, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(balance.toNumber(), 10)
            utils.assertEmitted(result, 1, 'RequestFrequencyExceeded')
        })

        it('Should not transfer more than max amount', async () => {
            // arrange
            await dispenser.setMinPeriod(2)
            await dispenser.setMaxAmount(10)

            // act
            const result = await dispenser.requestTokens(11, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(balance.toNumber(), 0)
            utils.assertEmitted(result, 1, 'RequestLimitExceeded')
        })
    })
})
