/* eslint-env mocha */
/* global artifacts, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

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
            await p.transfer(0x11, 0, { from: accounts[0] })
            await p.transfer(0x12, 0, { from: accounts[0] })
        })
    })
})
