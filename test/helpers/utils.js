/* eslint-env mocha */
/* eslint-disable no-console */
/* global assert */
const Web3 = require('web3')
const abi = require('ethereumjs-abi')

const utils = {

    emptyBytes32: '0x0000000000000000000000000000000000000000000000000000000000000000',
    templateId: '0x0000000000000000000000000000000000000000000000000000000000000001',
    dummyAddress: '0xeE9300b7961e0a01d9f0adb863C7A227A07AaD75',

    getWeb3: () => {
        const nodeUrl = `http://localhost:${process.env.ETHEREUM_RPC_PORT ? process.env.ETHEREUM_RPC_PORT : '8545'}`
        return new Web3(new Web3.providers.HttpProvider(nodeUrl))
    },

    generateId: () => {
        return utils.getWeb3().utils.sha3(Math.random().toString())
    },

    assertEmitted: (result, n, name, payload) => {
        let gotEvents = 0
        for (let i = 0; i < result.logs.length; i++) {
            const ev = result.logs[i]
            if (ev.event === name) {
                gotEvents++
            }
        }
        assert.strictEqual(n, gotEvents, `Event ${name} was not emitted.`)
    },

    generateConditionsKeys: (slaTemplateId, contracts, fingerprints) => {
        const conditions = []
        for (let i = 0; i < contracts.length; i++) {
            conditions.push('0x' + abi.soliditySHA3(
                ['bytes32', 'address', 'bytes4'],
                [slaTemplateId, contracts[i], fingerprints[i]]
            ).toString('hex'))
        }
        return conditions
    },

    createSLAHash: (web3, slaTemplateId, conditionsKeys, hashes, timeouts, agreementId) => {
        // console.log(web3, slaTemplateId, conditionsKeys, hashes, timeouts, agreementId)
        return web3.utils.soliditySha3(
            { type: 'bytes32', value: slaTemplateId },
            { type: 'bytes32[]', value: conditionsKeys },
            { type: 'bytes32[]', value: hashes },
            { type: 'uint256[]', value: timeouts },
            { type: 'bytes32', value: agreementId }
        ).toString('hex')
    },

    getEventArgsFromTx: (txReceipt, eventName) => {
        return txReceipt.logs.filter((log) => {
            return log.event === eventName
        })[0].args
    },

    getSelector: (web3, contract, name) => {
        for (let i = 0; i < contract.abi.length; i++) {
            const meta = contract.abi[i]
            if (meta.name === name) {
                let argsStr = ''
                for (let input of meta.inputs) {
                    argsStr += input.type + ','
                }
                return web3.utils.sha3(`${name}(${argsStr.slice(0, -1)})`).slice(0, 10)
            }
        }

        throw new Error('function with the given name not found in the given contact')
    },

    valueHash: (types, values) => {
        return '0x' + abi.soliditySHA3(types, values).toString('hex')
    },

    signAgreement: async (agreement, templateId, signature, consumer, hashes, timeouts, agreementId, did, args = {}) => {
        const result = await agreement.initializeAgreement(
            templateId,
            signature,
            consumer,
            hashes,
            timeouts,
            agreementId,
            did,
            args
        )

        return result.logs.filter((log) => {
            return log.event === 'AgreementInitialized'
        })[0].args.agreementId
    },

    sleep: (millis) => {
        return new Promise(resolve => setTimeout(resolve, millis))
    }
}

module.exports = utils
