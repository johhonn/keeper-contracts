/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')
const testUtils = require('../../helpers/utils.js')

const ComputeConditionsChangeInStorage = artifacts.require('ComputeConditionsChangeInStorage')

contract('ComputeConditions', (accounts) => {
    let zos
    let computeConditionsAddress

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('ComputeConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('ComputeConditions')
        zos.addDependency('PaymentConditions')
        zos.addDependency('AccessConditions')
        await zos.initialize(accounts[0], true)
        computeConditionsAddress = zos.getProxyAddress('ComputeConditions')
    })

    describe('Test upgradability for ComputeConditions', () => {
        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('ComputeConditionsChangeInStorage')
            let p = await ComputeConditionsChangeInStorage.at(computeConditionsAddress)

            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()

            let n = await p.called(zos.owner)
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })
    })
})
