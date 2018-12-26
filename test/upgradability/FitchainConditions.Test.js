/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const FitchainConditionsWithBug = artifacts.require('FitchainConditionsWithBug')
const FitchainConditionsChangeInStorage = artifacts.require('FitchainConditionsChangeInStorage')
const FitchainConditionsExtraFunctionality = artifacts.require('FitchainConditionsExtraFunctionality')
const FitchainConditionsChangeInStorageAndLogic = artifacts.require('FitchainConditionsChangeInStorageAndLogic')
const FitchainConditionsChangeFunctionSignature = artifacts.require('FitchainConditionsChangeFunctionSignature')

global.artifacts = artifacts
global.web3 = web3
let zos

async function assertRevert(promise) {
    try {
        await promise
        assert.fail('Expected revert not received')
    } catch (error) {
        const revertFound = error.message.search('revert') >= 0
        assert(revertFound, `Expected "revert", got ${error} instead`)
    }
}

contract('FitchainConditions', (accounts) => {
    let pAddress

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
            await assertRevert(p.getNumber())

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
            await assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            // await p.setReceiver(accounts[0])
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to append storage variables and change logic', async () => {
            /* eslint-disable-next-line no-unused-vars */
            let p = await FitchainConditionsChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('FitchainConditionsChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            // add test
        })

        it('Should be possible to fix/add a bug', async () => {
            /* eslint-disable-next-line no-unused-vars */
            let p = await FitchainConditionsWithBug.at(pAddress)
            await zos.upgradeToNewContract('FitchainConditionsWithBug')
            await zos.approveLatestTransaction()
            // add test
        })

        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('FitchainConditionsChangeFunctionSignature')
            // Approve and test new logic
            await zos.approveLatestTransaction()
            /* eslint-disable-next-line no-unused-vars */
            let p = await FitchainConditionsChangeFunctionSignature.at(pAddress)
            // add test
        })
    })
})
