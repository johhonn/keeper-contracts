/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

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
            await zos.upgradeToNewContract('FitchainConditionsChangeFunctionSignature')
            let p = await FitchainConditionsChangeFunctionSignature.at(fitchainConditionsAddress)
            try {
                await p.registerVerifier({ from: verifier1 })
                assert.fail('Expected revert not received')
            } catch (e) {
                /* eslint-disable-next-line no-empty */
            }
            // Approve and test new logic
            await zos.approveLatestTransaction()
            const registerVerifier1 = await p.registerVerifier({ from: verifier1 })
            assert.strictEqual(verifier1, registerVerifier1.logs[0].args.verifier, 'invalid verifier address 1')
        })
    })
})
