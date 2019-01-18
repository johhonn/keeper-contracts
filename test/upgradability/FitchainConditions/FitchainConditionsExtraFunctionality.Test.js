/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const FitchainConditionsExtraFunctionality = artifacts.require('FitchainConditionsExtraFunctionality')

contract('FitchainConditions', (accounts) => {
    let zos
    let fitchainConditionsAddress

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('FitchainConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('FitchainConditions')
        await zos.initialize(accounts[0], true)
        fitchainConditionsAddress = zos.getProxyAddress('FitchainConditions')
    })

    describe('Test upgradability for FitchainConditions', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            let p = await FitchainConditionsExtraFunctionality.at(fitchainConditionsAddress)

            // upgrade
            await zos.upgradeToNewContract('FitchainConditionsExtraFunctionality')

            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()

            // act
            const n = await p.getNumber()

            // eval
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })
    })
})
