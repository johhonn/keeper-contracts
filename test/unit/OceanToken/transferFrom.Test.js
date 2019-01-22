/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const OceanToken = artifacts.require('OceanToken.sol')

contract('OceanToken', (accounts) => {
    let token
    let zos
    let spender

    before('restore zos state before all tests', async () => {
        zos = new ZeppelinHelper('OceanToken')
        await zos.restoreState(accounts[9])
        /* eslint-disable-next-line */
        spender = accounts[1]
    })

    describe('transferFrom', () => {
        beforeEach('mint tokens before each test', async () => {
            await zos.initialize(accounts[0], false)
            token = await OceanToken.at(zos.getProxyAddress('OceanToken'))
            await token.mint(spender, 1000)
        })

        it('Should transfer', async () => {
            // arrange
            await token.approve(accounts[2], 100, { from: spender })

            // act
            await token.transferFrom(spender, accounts[3], 100, { from: accounts[2] })

            // assert
            const balance = await token.balanceOf(accounts[3])
            assert.strictEqual(balance.toNumber(), 100)
        })

        it('Should not transfer to empty address', async () => {
            // arrange
            await token.approve(accounts[2], 100, { from: spender })

            // act-assert
            try {
                await token.transferFrom(spender, 0x0, 100, { from: accounts[2] })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid address')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
