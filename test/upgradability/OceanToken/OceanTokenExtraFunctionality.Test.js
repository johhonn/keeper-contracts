/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils')

const OceanTokenExtraFunctionality = artifacts.require('OceanTokenExtraFunctionality')

contract('OceanToken', (accounts) => {
    let zos
    let oceanTokenAddress

    before('restore zos before all tests', async () => {
        zos = new ZeppelinHelper('OceanToken')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async () => {
        zos = new ZeppelinHelper('OceanToken')
        await zos.initialize(accounts[0], true)
        oceanTokenAddress = zos.getProxyAddress('OceanToken')
    })

    describe('Test upgradability for OceanToken', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('OceanTokenExtraFunctionality')
            let p = await OceanTokenExtraFunctionality.at(oceanTokenAddress)
            testUtils.log('before')
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.getNumber())
            testUtils.log('after')
            // Approve and call again
            await zos.approveLatestTransaction()
            const n = await p.getNumber()
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })
    })
})
