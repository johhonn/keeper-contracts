/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils')

const OceanTokenChangeInStorage = artifacts.require('OceanTokenChangeInStorage')

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
        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('OceanTokenChangeInStorage')
            let p = await OceanTokenChangeInStorage.at(oceanTokenAddress)

            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()

            // check again
            const n = await p.called(zos.owner)
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })
    })
})
