/* eslint-env mocha */
/* global assert */
const Web3 = require('web3')
const constants = require('./constants')

const utils = {
    getWeb3: () => {
        return new Web3(new Web3.providers.HttpProvider(constants.keeper.nodeUrl))
    },

    generateId: () => {
        return utils.getWeb3().utils.sha3(Math.random().toString())
    },

    assertEmitted: (result, n, name) => {
        let gotEvents = 0
        for (let i = 0; i < result.logs.length; i++) {
            const ev = result.logs[i]
            if (ev.event === name) {
                gotEvents++
            }
        }
        assert.strictEqual(n, gotEvents, `Event ${name} was not emitted.`)
    },

    assertRevert: async (promise) => {
        try {
            await promise
            assert.fail('Expected revert not received')
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }
    }
}

module.exports = utils
