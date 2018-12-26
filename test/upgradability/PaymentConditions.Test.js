/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const PaymentConditionsWithBug = artifacts.require('PaymentConditionsWithBug')
const PaymentConditionsChangeInStorage = artifacts.require('PaymentConditionsChangeInStorage')
const PaymentConditionsExtraFunctionality = artifacts.require('PaymentConditionsExtraFunctionality')
const PaymentConditionsChangeInStorageAndLogic = artifacts.require('PaymentConditionsChangeInStorageAndLogic')
const PaymentConditionsChangeFunctionSignature = artifacts.require('PaymentConditionsChangeFunctionSignature')

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

contract('PaymentConditions', (accounts) => {
    let pAddress

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('PaymentConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('PaymentConditions')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('PaymentConditions')
    })

    describe('Test upgradability for PaymentConditions', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('PaymentConditionsExtraFunctionality')
            let p = await PaymentConditionsExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('PaymentConditionsChangeInStorage')
            let p = await PaymentConditionsChangeInStorage.at(pAddress)
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
            let p = await PaymentConditionsChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('PaymentConditionsChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            // add test
        })

        it('Should be possible to fix/add a bug', async () => {
            /* eslint-disable-next-line no-unused-vars */
            let p = await PaymentConditionsWithBug.at(pAddress)
            await zos.upgradeToNewContract('PaymentConditionsWithBug')
            await zos.approveLatestTransaction()
            // add test
        })

        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('PaymentConditionsChangeFunctionSignature')
            // Approve and test new logic
            await zos.approveLatestTransaction()
            /* eslint-disable-next-line no-unused-vars */
            let p = await PaymentConditionsChangeFunctionSignature.at(pAddress)
            // add test
        })
    })
})
