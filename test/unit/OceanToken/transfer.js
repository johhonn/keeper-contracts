/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const OceanToken = artifacts.require('OceanToken.sol')

contract('OceanToken', (accounts) => {
    let token

    beforeEach(async () => {
        const zos = new ZeppelinHelper('OceanToken')
        await zos.initialize(accounts[0], false)
        token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
        await token.mint(accounts[1], 1000)
    })

    describe('transfer', () => {
        it('Should transfer', async () => {
            // act
            await token.transfer(accounts[2], 100, { from: accounts[1] })

            // assert
            const balance = await token.balanceOf(accounts[2])
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
