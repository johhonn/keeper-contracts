/* global artifacts, assert, contract, describe, it */
/* eslint-disable no-console, max-len */

const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const SLA = artifacts.require('ServiceAgreement.sol')
const PaymentCtrl = artifacts.require('PaymentController.sol')
const AccessCtrl = artifacts.require('AccessController.sol')


const ursa = require('ursa')
const ethers = require('ethers')
const BigNumber = require('bignumber.js')
const Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

contract('OceanAuth', (accounts) => {
    describe('Test On-chain Authorization', () => {
        it('Should walk through setup of SLA', async () => {
            const token = await OceanToken.deployed()
            const market = await OceanMarket.deployed()
            const sla = await SLA.deployed()
            const paymentController = await PaymentCtrl.deployed()
            const accessController = await AccessCtrl.deployed()

            const provider = accounts[0]
            const consumer = accounts[1]

            const scale = 10 ** 18

            const str = 'resource'
            const resourceId = await market.generateId(str, { from: provider })
            const resourcePrice = 100 * scale

            // 1. provider register dataset
            await market.register(resourceId, new BigNumber(resourcePrice), { from: provider })
            console.log('publisher registers asset with id = ', resourceId)

            // consumer request initial funds to play
            console.log(consumer)
            await market.requestTokens(new BigNumber(1000 * scale), { from: consumer })
            const bal = await token.balanceOf.call(consumer)
            console.log(`consumer has balance := ${bal.valueOf() / scale} now`)
            // consumer approve market to withdraw amount of token from his account
            await token.approve(market.address, new BigNumber(200 * scale), { from: consumer })

            // 2. consumer initiate an access request
            const modulusBit = 512


        })
    })
})
