/* eslint-env mocha */
/* global artifacts, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

const OceanTokenChangeFunctionSignature = artifacts.require('OceanTokenChangeFunctionSignature')

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
        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('OceanTokenChangeFunctionSignature')
            // Approve and test new logic
            await zos.approveLatestTransaction()
            let p = await OceanTokenChangeFunctionSignature.at(oceanTokenAddress)
            await p.methods['transferFrom(uint256,address)'](100, accounts[2], { from: accounts[0] })
        })
    })
})
