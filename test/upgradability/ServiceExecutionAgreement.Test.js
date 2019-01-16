/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('../helpers/ZeppelinHelper.js')
const testUtils = require('../helpers/utils.js')

const ServiceExecutionAgreementWithBug = artifacts.require('ServiceExecutionAgreementWithBug')
const ServiceExecutionAgreementChangeInStorage = artifacts.require('ServiceExecutionAgreementChangeInStorage')
const ServiceExecutionAgreementExtraFunctionality = artifacts.require('ServiceExecutionAgreementExtraFunctionality')
const ServiceExecutionAgreementChangeInStorageAndLogic = artifacts.require('ServiceExecutionAgreementChangeInStorageAndLogic')
const ServiceExecutionAgreementChangeFunctionSignature = artifacts.require('ServiceExecutionAgreementChangeFunctionSignature')

global.artifacts = artifacts
global.web3 = web3
let zos

contract('ServiceExecutionAgreement', (accounts) => {
    let pAddress
    const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const templateId = '0x0000000000000000000000000000000000000000000000000000000000000001'

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('ServiceExecutionAgreement')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('ServiceExecutionAgreement')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('ServiceExecutionAgreement')
    })

    describe('Test upgradability for ServiceExecutionAgreement', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('ServiceExecutionAgreementExtraFunctionality')
            let p = await ServiceExecutionAgreementExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('ServiceExecutionAgreementChangeInStorage')
            let p = await ServiceExecutionAgreementChangeInStorage.at(pAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            // await p.setReceiver(accounts[0])
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let p = await ServiceExecutionAgreementChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('ServiceExecutionAgreementChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            // add test
            const result = await p.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })

            // assert
            testUtils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await p.getTemplateStatus(templateId)
            assert.strictEqual(status, true)
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 1, 'Error calling added storage variable')
        })

        it('Should be possible to fix/add a bug', async () => {
            /* eslint-disable-next-line no-unused-vars */
            let p = await ServiceExecutionAgreementWithBug.at(pAddress)
            await zos.upgradeToNewContract('ServiceExecutionAgreementWithBug')
            await zos.approveLatestTransaction()
            // add test
            const result = await p.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })
            // assert
            testUtils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await p.getTemplateStatus(templateId)
            assert.strictEqual(status, false)
        })

        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('ServiceExecutionAgreementChangeFunctionSignature')
            let p = await ServiceExecutionAgreementChangeFunctionSignature.at(pAddress)
            await testUtils.assertRevert(p.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], { from: accounts[0] }))

            // Approve and test new logic
            await zos.approveLatestTransaction()
            const result = await p.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], { from: accounts[0] })

            // assert
            testUtils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await p.getTemplateStatus(templateId)
            assert.strictEqual(status, true)
        })
    })
})
