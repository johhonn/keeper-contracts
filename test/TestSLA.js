/* global artifacts, contract, describe, it */
/* eslint-disable no-console, max-len */

const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const SLA = artifacts.require('ServiceAgreement.sol')
const PaymentCtrl = artifacts.require('PaymentConditions.sol')
const AccessCtrl = artifacts.require('AccessConditions.sol')
const testUtils = require('./utils')

// const ursa = require('ursa')
// const ethers = require('ethers')
const Web3 = require('web3')

// const web3 = new Web3(Web3.givenProvider || 'localhost:8546')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
// const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

contract('ServiceAgreement', (accounts) => {
    describe('Test On-chain Authorization', () => {
        it('Should walk through setup of SLA', async () => {
            const token = await OceanToken.deployed()
            const market = await OceanMarket.deployed()
            const sla = await SLA.deployed()
            const paymentConditions = await PaymentCtrl.deployed()
            const accessConditions = await AccessCtrl.deployed()

            const provider = accounts[0]
            const consumer = accounts[1]

            const scale = 10 ** 18

            // Do some preperations: give consumer funds, add an asset
            // consumer request initial funds to play
            console.log(consumer)
            await market.requestTokens(testUtils.toBigNumber(1000 * scale), { from: consumer })
            await market.requestTokens(testUtils.toBigNumber(1000 * scale), { from: provider })
            const bal = await token.balanceOf.call(consumer)
            console.log(`consumer has balance := ${bal.valueOf() / scale} now`)

            // register dataset
            const resourceName = 'resource'
            const resourceId = await market.generateId(resourceName, { from: provider })
            const resourcePrice = 100 * scale
            await market.register(resourceId, testUtils.toBigNumber(resourcePrice), { from: provider })
            console.log('publisher registers asset with id = ', resourceId)

            // Provider setup SLA on-chain
            const contracts = [paymentConditions.address, accessConditions.address, paymentConditions.address]
            const funcFingerPrints = [
                web3.utils.sha3('lockPayment(bytes32 , uint256 , bytes32 , bytes32 )').slice(0, 10),
                web3.utils.sha3('grantAccess(bytes32 , bytes32 )').slice(0, 10),
                web3.utils.sha3('releasePayment(bytes32 , bytes32 )').slice(0, 10)]

            console.log('conditions control contracts', contracts)
            console.log('functions: ', funcFingerPrints)
            const serviceName = 'doService'
            const dependencies = [0, 1, 2]
            const setupTx = await sla.setupAgreementTemplate(contracts, funcFingerPrints, dependencies, serviceName, { from: provider })
            // Grab `SetupAgreementTemplate` event to fetch the serviceTemplateId
            const templateId = testUtils.getEventArgsFromTx(setupTx, 'SetupAgreementTemplate').serviceTemplateId

            console.log('templateid: ', templateId)
            // 1. consumer request access to asset
            // consumer approve market to withdraw amount of token from his account
            // await token.approve(market.address, testUtils.toBigNumber(200 * scale), { from: consumer })
            const conditionsKeys = testUtils.generateConditionsKeys(templateId, contracts, funcFingerPrints)
            const slaMsgHash = testUtils.createSLAHash(web3, templateId, conditionsKeys)
            const signature = await web3.eth.sign(slaMsgHash, consumer)

            // Start a purchase, i.e. execute the service agreement
            const execSLATx = await sla.executeAgreement(
                templateId, signature, consumer, { from: provider }
            )
            const execAgrArgs = testUtils.getEventArgsFromTx(execSLATx, 'ExecuteAgreement')
            const { serviceId } = execAgrArgs.serviceId
            console.log('serviceId: ', serviceId)
            console.log(execAgrArgs)

            // Check status of sla
            // const tx = await sla.fulfillAgreement(serviceId)
            const canlock = !(await sla.hasUnfulfilledDependencies(serviceId, conditionsKeys[0]))
            console.log('canLock: ', canlock)
            const canAccess = !(await sla.hasUnfulfilledDependencies(serviceId, conditionsKeys[1]))
            console.log('canAccess: ', canAccess)
            const canRelease = !(await sla.hasUnfulfilledDependencies(serviceId, conditionsKeys[2]))
            console.log('canRelease: ', canRelease)

            // try to get access before lock payment, should fail
            // TODO:

            // Submit payment via the PaymentConditions contract
            // grab event of payment locked
            await token.approve(paymentConditions.address, testUtils.toBigNumber(200 * scale), { from: consumer })
            const payTx = await paymentConditions.lockPayment(serviceId, { from: consumer })
            console.log('lockpayment event: ', testUtils.getEventArgsFromTx(payTx, 'PaymentLocked').serviceId)

            // grant access
            const gaccTx = await accessConditions.grantAccess(serviceId, resourceId, { from: provider })
            console.log('accessgranted event: ', testUtils.getEventArgsFromTx(gaccTx, 'AccessGranted').serviceId)

            // release payment
            const releaseTx = await paymentConditions.releasePayment(serviceId, { from: provider })
            console.log('releasepayment event: ', testUtils.getEventArgsFromTx(releaseTx, 'PaymentReleased').serviceId)
        })
    })
})
