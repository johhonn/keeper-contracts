/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('../helpers/ZeppelinHelper.js')
const testUtils = require('../helpers/utils.js')

const FitchainConditionsWithBug = artifacts.require('FitchainConditionsWithBug')
const FitchainConditionsChangeInStorage = artifacts.require('FitchainConditionsChangeInStorage')
const FitchainConditionsExtraFunctionality = artifacts.require('FitchainConditionsExtraFunctionality')
const FitchainConditionsChangeInStorageAndLogic = artifacts.require('FitchainConditionsChangeInStorageAndLogic')
const FitchainConditionsChangeFunctionSignature = artifacts.require('FitchainConditionsChangeFunctionSignature')

global.artifacts = artifacts

let zos

contract('FitchainConditions', (accounts) => {
    let pAddress
    const verifier1 = accounts[2]

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('FitchainConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('FitchainConditions')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('FitchainConditions')
    })

    describe('Test upgradability for FitchainConditions', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('FitchainConditionsExtraFunctionality')
            let p = await FitchainConditionsExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('FitchainConditionsChangeInStorage')
            let p = await FitchainConditionsChangeInStorage.at(pAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let p = await FitchainConditionsChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('FitchainConditionsChangeInStorageAndLogic')
            // Approve and test new logic
            await zos.approveLatestTransaction()
            const registerVerifier1 = await p.registerVerifier(1, { from: verifier1 })
            assert.strictEqual(verifier1, registerVerifier1.logs[0].args.verifier, 'invalid verifier address 1')
            let n
            await p.called(verifier1).then(i => { n = i })
            assert.equal(n.toNumber() > 0, true, 'Error calling added storage variable')
        })

        it('Should be possible to fix/add a bug', async () => {
            let p = await FitchainConditionsWithBug.at(pAddress)
            await zos.upgradeToNewContract('FitchainConditionsWithBug')
            await zos.approveLatestTransaction()
            const registerVerifier1 = await p.registerVerifier(1, { from: verifier1 })
            assert.strictEqual(5, registerVerifier1.logs[0].args.slots.toNumber(), 'invalid verifier slots')
        })

        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('FitchainConditionsChangeFunctionSignature')
            let p = await FitchainConditionsChangeFunctionSignature.at(pAddress)
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
