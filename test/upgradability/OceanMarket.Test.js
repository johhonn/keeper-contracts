/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const OceanMarketWithBug = artifacts.require('OceanMarketWithBug')
const OceanMarketChangeInStorage = artifacts.require('OceanMarketChangeInStorage')
const OceanMarketExtraFunctionality = artifacts.require('OceanMarketExtraFunctionality')
const OceanMarketChangeInStorageAndLogic = artifacts.require('OceanMarketChangeInStorageAndLogic')
const OceanMarketChangeFunctionSignature = artifacts.require('OceanMarketChangeFunctionSignature')

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

contract('OceanMarket', (accounts) => {
    let pAddress

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('OceanMarket')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('OceanMarket')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('OceanMarket')
    })

    describe('Test upgradability for OceanMarket', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('OceanMarketExtraFunctionality')
            let p = await OceanMarketExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('OceanMarketChangeInStorage')
            let p = await OceanMarketChangeInStorage.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let p = await OceanMarketChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('OceanMarketChangeInStorageAndLogic')
            let id = await p.methods['generateId(string)']('test')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            await p.verifyPaymentReceived(id, { from: accounts[0] })
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to fix/add a bug', async () => {
            /* eslint-disable-next-line no-unused-vars */
            let p = await OceanMarketWithBug.at(pAddress)
            await zos.upgradeToNewContract('OceanMarketWithBug')
            await zos.approveLatestTransaction()
            let id = await p.methods['generateId(string)']('test')

            const result = await p.verifyPaymentReceived(id, { from: accounts[0] })
            assert.strictEqual(result, false)
        })

        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('OceanMarketChangeFunctionSignature')
            let p = await OceanMarketChangeFunctionSignature.at(pAddress)
            let id = await p.methods['generateId(string)']('test')
            await assertRevert(p.verifyPaymentReceived(id, true))

            // Approve and test new logic
            await zos.approveLatestTransaction()
            const result = await p.verifyPaymentReceived(id, true)
            assert.strictEqual(result, true)
        })
    })
})
