/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const OceanMarket = artifacts.require('OceanMarket.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const utils = require('../../helpers/utils.js')

contract('OceanMarket', (accounts) => {
    let token
    let market

    beforeEach(async () => {
        token = await OceanToken.new({ from: accounts[0] })
        market = await OceanMarket.new(token.address, { from: accounts[0] })
    })

    describe('requestTokens', () => {
        it('Should transfer tokens', async () => {
            // act
            await market.requestTokens(200, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(balance.toNumber(), 200)
        })

        it('Should not transfer frequently', async () => {
            // arrange
            await market.limitTokenRequest(10, 10)
            await market.requestTokens(10, { from: accounts[0] })

            // act
            const result = await market.requestTokens(10, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(balance.toNumber(), 10)
            utils.assertEmitted(result, 1, 'FrequentTokenRequest')
        })

        it('Should not transfer more than max amount', async () => {
            // arrange
            await market.limitTokenRequest(2, 10)

            // act
            const result = await market.requestTokens(10, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(balance.toNumber(), 2)
            utils.assertEmitted(result, 1, 'LimitTokenRequest')
        })
    })
})
