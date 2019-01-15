/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, before,beforeEach */

const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')
const Dispenser = artifacts.require('Dispenser.sol')
const OceanToken = artifacts.require('OceanToken.sol')

contract('Dispenser', (accounts) => {
    let dispenser
    let token
    let zos

    before(async () => {
        zos = new ZeppelinHelper('Dispenser')
        await zos.restoreState(accounts[9])
    })

    beforeEach(async () => {
        await zos.initialize(accounts[0], false)

        token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
        dispenser = await Dispenser.at(zos.getProxyAddress('Dispenser'))

        await token.addMinter(dispenser.address)
    })

    describe('requestTokens', () => {
        it('Should transfer tokens', async () => {
            // act
            await dispenser.requestTokens(200, { from: accounts[1] })

            // assert
            const balance = await token.balanceOf(accounts[1])
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
            const balance = await token.balanceOf(accounts[1])
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
            const balance = await token.balanceOf(accounts[1])
            assert.strictEqual(balance.toNumber(), 0)
            testUtils.assertEmitted(result, 1, 'RequestLimitExceeded')
        })
    })
})
