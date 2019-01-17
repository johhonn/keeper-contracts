/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

const OceanTokenChangeInStorageAndLogic = artifacts.require('OceanTokenChangeInStorageAndLogic')

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
        it('Should be possible to append storage variables and change logic', async () => {
            let p = await OceanTokenChangeInStorageAndLogic.at(oceanTokenAddress)
            await p.mint(accounts[0], 1000)
            await zos.upgradeToNewContract('OceanTokenChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            await p.transfer(accounts[1], 100, { from: accounts[0] })
            await p.transfer(accounts[2], 100, { from: accounts[0] })
            const n = await p.called(zos.owner)
            assert.equal(n.toNumber(), 2, 'Error on internal counter')
        })
    })
})
