/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, beforeEach */
const testUtils = require('../../helpers/utils.js')

const Dispenser = artifacts.require('Dispenser')
const OceanToken = artifacts.require('OceanToken')

contract('Dispenser', (accounts) => {
    let dispenser
    let oceanToken

    beforeEach(async () => {
        oceanToken = await OceanToken.new()
        await oceanToken.initialize(accounts[0], accounts[0])
        dispenser = await Dispenser.new()
        await dispenser.initialize(oceanToken.address, accounts[0])
        await oceanToken.addMinter(dispenser.address)
    })

    describe('requestTokens', () => {
        it('Should transfer tokens', async () => {
            // act
            await dispenser.requestTokens(200, { from: accounts[1] })

            // assert
            const balance = await oceanToken.balanceOf(accounts[1])
            assert.strictEqual(balance.toNumber(), 200)
        })

        it('Should not transfer frequently', async () => {
            // arrange
            await dispenser.setMinPeriod(10)
            await dispenser.setMaxAmount(10)
            await dispenser.requestTokens(10, { from: accounts[1] })

            // act
            const result = await dispenser.requestTokens(10, { from: accounts[1] })

            // assert
            const balance = await oceanToken.balanceOf(accounts[1])
            assert.strictEqual(balance.toNumber(), 10)
            testUtils.assertEmitted(result, 1, 'RequestFrequencyExceeded')
        })

        it('Should not transfer more than max amount', async () => {
            // arrange
            await dispenser.setMinPeriod(2)
            await dispenser.setMaxAmount(10)

            // act
            const result = await dispenser.requestTokens(11, { from: accounts[1] })

            // assert
            const balance = await oceanToken.balanceOf(accounts[1])
            assert.strictEqual(balance.toNumber(), 0)
            testUtils.assertEmitted(result, 1, 'RequestLimitExceeded')
        })

        it('Should not mint more than max amount', async () => {
            // act
            try {
                await dispenser.requestTokens(1000 * 10 ** 10, { from: accounts[1] })
            } catch (err) {
                assert.equal(err.reason, 'Exceeded maxMintAmount')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
