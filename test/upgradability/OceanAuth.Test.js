/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const OceanMarket = artifacts.require('OceanAuth')
const OceanAuthWithBug = artifacts.require('OceanAuthWithBug')
const OceanAuthChangeInStorage = artifacts.require('OceanAuthChangeInStorage')
const OceanAuthExtraFunctionality = artifacts.require('OceanAuthExtraFunctionality')
const OceanAuthChangeInStorageAndLogic = artifacts.require('OceanAuthChangeInStorageAndLogic')
const OceanAuthChangeFunctionSignature = artifacts.require('OceanAuthChangeFunctionSignature')

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

contract('OceanAuth', (accounts) => {
    let pAddress

    async function createAccessRequest(contract, resourceId, provider, timeout, from) {
        const result = await contract.initiateAccessRequest(resourceId, provider, 'pk', timeout, { from: from })
        return result.logs.find(i => i.event === 'AccessConsentRequested').args._id
    }

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('OceanAuth')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('OceanAuth')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('OceanAuth')
    })

    describe('Test upgradability for OceanAuth', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('OceanAuthExtraFunctionality')
            let p = await OceanAuthExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('OceanAuthChangeInStorage')
            let p = await OceanAuthChangeInStorage.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            // await p.setReceiver(accounts[0])
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to fix/add a bug', async () => {
            let p = await OceanAuthWithBug.at(pAddress)
            await zos.upgradeToNewContract('OceanAuthWithBug')
            let market = await OceanMarket.at(zos.getProxyAddress('OceanMarket'))
            let assetId = await market.methods['generateId(string)']('test asset')
            const requestId = await createAccessRequest(p, assetId, accounts[1], 100, accounts[0])
            assertRevert(p.commitAccessRequest(requestId, false, 1, '', '', '', '', { from: accounts[0] }))
            await zos.approveLatestTransaction()
            p.commitAccessRequest(requestId, false, 1, '', '', '', '', { from: accounts[0] })
        })

        it('Should be possible to append storage variables and change logic', async () => {
            /* eslint-disable-next-line no-unused-vars */
            let p = await OceanAuthChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('OceanAuthChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            // add test
        })

        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('OceanAuthChangeFunctionSignature')
            // Approve and test new logic
            await zos.approveLatestTransaction()
            /* eslint-disable-next-line no-unused-vars */
            let p = await OceanAuthChangeFunctionSignature.at(pAddress)
            // add test
        })
    })
})
