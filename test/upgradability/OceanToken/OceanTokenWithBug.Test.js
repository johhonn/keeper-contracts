/* eslint-env mocha */
/* global artifacts, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils')

const OceanTokenWithBug = artifacts.require('OceanTokenWithBug')

contract('OceanToken', (accounts) => {
    let zos
    let oceanTokenAddress

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('OceanToken')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('OceanToken')
        await zos.initialize(accounts[0], true)
        oceanTokenAddress = zos.getProxyAddress('OceanToken')
    })

    describe('Test upgradability for OceanToken', () => {
        it('Should be possible to fix/add a bug', async () => {
            let p = await OceanTokenWithBug.at(oceanTokenAddress)
            await zos.upgradeToNewContract('OceanTokenWithBug')

            // Approve to insert bug and call again
            await zos.approveLatestTransaction()

            // prepare
            await p.mint(accounts[0], 1000)

            // act
            await testUtils.assertRevert(p.transfer('0xf34d7653ec603f06e15965ff0009c157d112a714', 100, { from: accounts[0] }))
            await p.transfer('0xa826c0a9db411af3bad3d1d02e00c0c75b0ba9d0', 100, { from: accounts[0] })
        })
    })
})
