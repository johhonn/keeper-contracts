/* global artifacts, beforeEach, contract, describe, it */
/* eslint-disable no-console, max-len */
const Token = artifacts.require('OceanToken.sol')
const Exchange = artifacts.require('OceanExchange.sol')
const Market = artifacts.require('OceanMarket.sol')

const BigNumber = require('bignumber.js')
const Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

contract('OceanExchange', (accounts) => {
    describe('Test Ocean Exchange (Ether <> Ocean token)', () => {
        let token
        let market
        let exchange
        const scale = 10 ** 18

        beforeEach(async () => {
            token = await Token.deployed()
            market = await Market.deployed()
            exchange = await Exchange.deployed()
        })

        it('Should initialize exchange', async () => {
            // user request initial 100 Ether and 1000 Ocean tokens from market
            await market.requestTokens(new BigNumber(1000 * scale), { from: accounts[0] })
            const bal = await token.balanceOf.call(accounts[0])
            const ethbal = Web3.utils.fromWei(await web3.eth.getBalance(accounts[0]))
            console.log(`user has ${ethbal} ether and ${bal / scale} Ocean tokens before initialization.`)

            {
                await token.approve(exchange.address, new BigNumber(1000 * scale), { from: accounts[0] })
                // current exchange status
                let { _ethPool, _tokenPool, _invariant, _totalShares } = await exchange.exchangeStatus({ from: accounts[0] })
                console.log('initial status: ethPool=' + _ethPool + ' tokenPool=' + _tokenPool + ' invariant=' + _invariant + ' totalShares=' + _totalShares)
            }
            {
                // initialize exchange with 1 ether and 100 tokens
                await exchange.initializeExchange(new BigNumber(100 * scale), { from: accounts[0], value: Web3.utils.toWei('1', 'ether') })
                let { _ethPool, _tokenPool, _invariant, _totalShares } = await exchange.exchangeStatus({ from: accounts[0] })
                console.log('status (Initialized): ethPool=' + _ethPool / scale + ' tokenPool=' + _tokenPool / scale + ' invariant=' + _invariant / scale ** 2 + ' totalShares=' + _totalShares)
            }

            // user has 99 Ether and 900 Ocean tokens left in his wallet
            const bal1 = await token.balanceOf.call(accounts[0])
            const ethbal1 = Web3.utils.fromWei(await web3.eth.getBalance(accounts[0]))
            console.log(`user has ${ethbal1} ether and ${bal1 / scale} Ocean tokens after initialization.`)
        })

        it('Should add liquidity', async () => {
            await exchange.addLiquidity(new BigNumber(100 * scale), new BigNumber(99999999999999), { from: accounts[0], value: Web3.utils.toWei('0.5', 'ether') })
            let { _ethPool, _tokenPool, _invariant, _totalShares } = await exchange.exchangeStatus({ from: accounts[0] })
            console.log('status (liquidityAdded): ethPool=' + _ethPool / scale + ' tokenPool=' + _tokenPool / scale + ' invariant=' + _invariant / scale ** 2 + ' totalShares=' + _totalShares)
        })

        it('Should swap ether -> token ', async () => {
            console.log('buyer sends 1 ether into exchange')
            await exchange.ethToTokenSwap(new BigNumber(10 * scale), new BigNumber(99999999999999), { from: accounts[1], value: Web3.utils.toWei('1', 'ether') })
            let { _ethPool, _tokenPool, _invariant, _totalShares } = await exchange.exchangeStatus({ from: accounts[1] })
            console.log('status (swap ether to token): ethPool=' + _ethPool / scale + ' tokenPool=' + _tokenPool / scale + ' invariant=' + _invariant / scale ** 2 + ' totalShares=' + _totalShares)

            const bal = await token.balanceOf.call(accounts[1])
            console.log(`buyer received ${bal / scale} Ocean tokens now.`)
            // approve
            await token.approve(exchange.address, new BigNumber(bal * scale), { from: accounts[1] })
        })

        it('Should swap token -> ether', async () => {
            const ethbalB = Web3.utils.fromWei(await web3.eth.getBalance(accounts[1]))
            console.log('seller sends 30 to exchange for ether; current ether balance = ', ethbalB)
            await exchange.tokenToEthSwap(new BigNumber(30 * scale), Web3.utils.toWei('0.01', 'ether'), new BigNumber(99999999999999), { from: accounts[1] })
            let { _ethPool, _tokenPool, _invariant, _totalShares } = await exchange.exchangeStatus({ from: accounts[1] })
            console.log('status (swap token to ether): ethPool=' + _ethPool / scale + ' tokenPool=' + _tokenPool / scale + ' invariant=' + _invariant / scale ** 2 + ' totalShares=' + _totalShares)

            const bal = await token.balanceOf.call(accounts[1])
            const ethbal = Web3.utils.fromWei(await web3.eth.getBalance(accounts[1]))
            console.log(`buyer has ${ethbal} ether and ${bal / scale} Ocean tokens available now.`)
        })

        it('Should remove liquidity', async () => {
            const bal1 = await token.balanceOf.call(accounts[0])
            const ethbal1 = Web3.utils.fromWei(await web3.eth.getBalance(accounts[0]))
            console.log(`user has ${ethbal1} ether and ${bal1 / scale} Ocean tokens available now.`)

            await exchange.removeLiquidity(new BigNumber(300), Web3.utils.toWei('0.001', 'ether'), new BigNumber(1 * scale), new BigNumber(99999999999999), { from: accounts[0] })
            let { _ethPool, _tokenPool, _invariant, _totalShares } = await exchange.exchangeStatus({ from: accounts[0] })
            console.log('status (liquidity removed): ethPool=' + _ethPool / scale + ' tokenPool=' + _tokenPool / scale + ' invariant=' + _invariant / scale ** 2 + ' totalShares=' + _totalShares)

            const bal = await token.balanceOf.call(accounts[0])
            const ethbal = Web3.utils.fromWei(await web3.eth.getBalance(accounts[0]))
            console.log(`user has ${ethbal} ether and ${bal / scale} Ocean tokens available now.`)
        })
    })
})
