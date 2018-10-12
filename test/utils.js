/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert */

const Eth = require('ethjs')
const HttpProvider = require('ethjs-provider-http')
const abi = require('ethereumjs-abi')

const ethQuery = new Eth(new HttpProvider('http://localhost:7545'))

const PLCRVoting = artifacts.require('PLCRVoting.sol')
const Registry = artifacts.require('OceanRegistry.sol')
const Token = artifacts.require('ERC20.sol')

const BN = small => new Eth.BN(small.toString(10), 10)

const utils = {
    getVoteSaltHash: (vote, salt) => (
        `0x${abi.soliditySHA3(['uint', 'uint'], [vote, salt]).toString('hex')}`
    ),

    getListingHash: domain => (
        `0x${abi.soliditySHA3(['string'], [domain]).toString('hex')}`
    ),

    approvePLCR: async (address, adtAmount) => {
        const registry = await Registry.deployed()
        const plcrAddr = await registry.voting.call()
        const token = await Token.deployed()
        await token.approve(plcrAddr, adtAmount, { from: address })
    },

    addToWhitelist: async (domain, deposit, actor) => {
        const registry = await Registry.deployed()
        await utils.as(actor, registry.apply, domain, deposit, '')
        await utils.increaseTime(2000)
        await utils.as(actor, registry.updateStatus, domain)
    },

    as: (actor, fn, ...args) => {
        function detectSendObject(potentialSendObj) {
            function hasOwnProperty(obj, prop) {
                const proto = obj.constructor.prototype
                return (prop in obj) &&
          (!(prop in proto) || proto[prop] !== obj[prop])
            }
            if (typeof potentialSendObj !== 'object') { return undefined }
            if (
                hasOwnProperty(potentialSendObj, 'from') ||
        hasOwnProperty(potentialSendObj, 'to') ||
        hasOwnProperty(potentialSendObj, 'gas') ||
        hasOwnProperty(potentialSendObj, 'gasPrice') ||
        hasOwnProperty(potentialSendObj, 'value')
            ) {
                throw new Error('It is unsafe to use "as" with custom send objects')
            }
            return undefined
        }
        detectSendObject(args[args.length - 1])
        const sendObject = { from: actor }
        return fn(...args, sendObject)
    },

    isEVMException: err => (
        err.toString().includes('revert')
    ),

    // returns block timestamp
    getBlockTimestamp: () => ethQuery.blockNumber()
        .then(num => ethQuery.getBlockByNumber(num, true))
        .then(block => block.timestamp.toString(10)),

    getUnstakedDeposit: async (domain) => {
        const registry = await Registry.deployed()
        // get the struct in the mapping
        const listing = await registry.listings.call(domain)
        // get the unstaked deposit amount from the listing struct
        const unstakedDeposit = await listing[3]
        return unstakedDeposit.toString()
    },

    challengeAndGetPollID: async (domain, actor) => {
        const registry = await Registry.deployed()
        const receipt = await utils.as(actor, registry.challenge, domain, '')
        return receipt.logs[0].args.challengeID
    },

    commitVote: async (pollID, voteOption, tokensArg, salt, voter) => {
        const voting = await PLCRVoting.deployed()
        const hash = utils.getVoteSaltHash(voteOption, salt)
        await utils.as(voter, voting.requestVotingRights, tokensArg)

        const prevPollID = await voting.getInsertPointForNumTokens.call(voter, tokensArg, pollID)
        await utils.as(voter, voting.commitVote, pollID, hash, tokensArg, prevPollID)
    },

    divideAndGetWei: (numerator, denominator) => {
        const weiNumerator = Eth.toWei(BN(numerator), 'gwei')
        return weiNumerator.div(BN(denominator))
    },

    multiplyFromWei: (x, weiBN) => {
        if (!Eth.BN.isBN(weiBN)) {
            return false
        }
        const weiProduct = BN(x).mul(weiBN)
        return BN(Eth.fromWei(weiProduct, 'gwei'))
    },

    multiplyByPercentage: (x, y, z = 100) => {
        const weiQuotient = utils.divideAndGetWei(y, z)
        return utils.multiplyFromWei(x, weiQuotient)
    },

    assertEmitted: (result, n, name, payload) => {
        var gotEvents = 0
        for (var i = 0; i < result.logs.length; i++) {
            const ev = result.logs[i]
            if (ev.event === name) {
                gotEvents++
            }
        }
        assert.strictEqual(n, gotEvents)
    }
}

module.exports = utils
