/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

const FitchainConditionsChangeInStorageAndLogic = artifacts.require('FitchainConditionsChangeInStorageAndLogic')

contract('FitchainConditions', (accounts) => {
    let zos
    let fitchainConditionsAddress
    const verifier1 = accounts[2]

    before('restore zos before all tests', async () => {
        zos = new ZeppelinHelper('FitchainConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async () => {
        zos = new ZeppelinHelper('FitchainConditions')
        await zos.initialize(accounts[0], true)
        fitchainConditionsAddress = zos.getProxyAddress('FitchainConditions')
    })

    describe('Test upgradability for FitchainConditions', () => {
        it('Should be possible to append storage variables and change logic', async () => {
            let p = await FitchainConditionsChangeInStorageAndLogic.at(fitchainConditionsAddress)

            // ugrade
            await zos.upgradeToNewContract('FitchainConditionsChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()

            // act
            const registerVerifier1 = await p.registerVerifier(
                1,
                { from: verifier1 })

            // eval
            assert.strictEqual(verifier1, registerVerifier1.logs[0].args.verifier, 'invalid verifier address 1')

            // act
            let n = await p.called(verifier1)
            // eval
            assert.equal(n.toNumber() > 0, true, 'Error calling added storage variable')
        })
    })
})
