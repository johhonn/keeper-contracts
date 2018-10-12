/* global artifacts, assert, contract, describe, it */
/* eslint-disable no-console, max-len */

const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const OceanAuth = artifacts.require('ServiceAgreement.sol')
const OceanAuth = artifacts.require('.sol')
const OceanAuth = artifacts.require('.sol')


const ursa = require('ursa')
const ethers = require('ethers')
const BigNumber = require('bignumber.js')
const Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

contract('OceanAuth', (accounts) => {
    describe('Test On-chain Authorization', () => {
        // support upto 50 assets and providers; each asset has one single provider at this time
        it('Should walk through setup of SLA', async () => {
            // const marketPlace = await Market.deployed();
            const token = await OceanToken.deployed()
            const market = await OceanMarket.deployed()
            const auth = await OceanAuth.deployed()
            const scale = 10 ** 18

            const str = 'resource'
            const resourceId = await market.generateId(str, { from: accounts[0] })
            const resourcePrice = 100 * scale
            // 1. provider register dataset
            await market.register(resourceId, new BigNumber(resourcePrice), { from: accounts[0] })
            console.log('publisher registers asset with id = ', resourceId)

            // consumer accounts[1] request initial funds to play
            console.log(accounts[1])
            await market.requestTokens(new BigNumber(1000 * scale), { from: accounts[1] })
            const bal = await token.balanceOf.call(accounts[1])
            console.log(`consumer has balance := ${bal.valueOf() / scale} now`)
            // consumer approve market to withdraw amount of token from his account
            await token.approve(market.address, new BigNumber(200 * scale), { from: accounts[1] })

            // 2. consumer initiate an access request
            const modulusBit = 512
        })
    })
})
