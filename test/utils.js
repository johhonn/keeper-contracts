/* eslint-env mocha */
/* global artifacts */

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

    toBigNumber: (num) => {
        // return new BigNumber(num)
        return num
    },

    generateConditionsKeys: (slaTemplateId, contracts, fingerprints) => {
        const conditions = Array()
        for (let i=0; i<contracts.length; i++) {
            conditions.push("0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ slaTemplateId, contracts[i], fingerprints[i] ]).toString('hex'))
        }
        return conditions
    },
    createSLAHash: (web3, slaTemplateId, conditionsKeys) => {
        // Conditions keys
        //console.log('condition: ', slaTemplateId, conditions)
        // message to sign by consumer. this is the hash of slaTemplateId and condition keys
        return web3.utils.soliditySha3({type: 'bytes32', value: slaTemplateId}, {type: 'bytes32[]', value: conditionsKeys}).toString('hex')
    },

    getEventArgsFromTx: (txReceipt, eventName) => {
        return txReceipt.logs.filter((log) => {
            return log.event === eventName
        })[0].args
    },

    getSelector: (contract, name) => {
        for (var i = 0; i < contract.abi.length; i++) {
             const meta = contract.abi[i]

             if (meta.name == name) {
                return meta.signature
            }
        }

        throw 'function with the given name not found in the given contact'
    }
}

module.exports = utils
