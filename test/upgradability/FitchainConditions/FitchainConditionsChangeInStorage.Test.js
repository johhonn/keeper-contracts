/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const FitchainConditionsChangeInStorage = artifacts.require('FitchainConditionsChangeInStorage')

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
        it('Should be possible to append storage variables ', async () => {
            let p = await FitchainConditionsChangeInStorage.at(fitchainConditionsAddress)

            // upgrade
            await zos.upgradeToNewContract('FitchainConditionsChangeInStorage')

            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()

            // act
            let n = await p.called(zos.owner)

            // eval
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })
    })
})
