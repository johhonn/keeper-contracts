/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

const FitchainConditionsWithBug = artifacts.require('FitchainConditionsWithBug')

contract('FitchainConditions', (accounts) => {
    let zos
    let fitchainConditionsAddress
    const verifier1 = accounts[2]

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
        it('Should be possible to fix/add a bug', async () => {
            let p = await FitchainConditionsWithBug.at(fitchainConditionsAddress)
            await zos.upgradeToNewContract('FitchainConditionsWithBug')
            await zos.approveLatestTransaction()
            const registerVerifier1 = await p.registerVerifier(
                1,
                { from: verifier1 })
            assert.strictEqual(5, registerVerifier1.logs[0].args.slots.toNumber(), 'invalid verifier slots')
        })
    })
})
