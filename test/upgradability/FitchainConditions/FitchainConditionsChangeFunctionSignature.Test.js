/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */

const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const FitchainConditionsChangeFunctionSignature = artifacts.require('FitchainConditionsChangeFunctionSignature')

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
        it('Should be possible to change function signature', async () => {
            let p = await FitchainConditionsChangeFunctionSignature.at(fitchainConditionsAddress)

            // upgrade
            await zos.upgradeToNewContract('FitchainConditionsChangeFunctionSignature')

            testUtils.assertRevert(p.registerVerifier({ from: verifier1 }))

            // Approve and test new logic
            await zos.approveLatestTransaction()

            // act
            const registerVerifier1 = await p.registerVerifier({ from: verifier1 })

            // eval
            assert.strictEqual(verifier1, registerVerifier1.logs[0].args.verifier, 'invalid verifier address 1')
        })
    })
})
