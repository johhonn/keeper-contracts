/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, before, contract, describe, it */

const DIDRegistry = artifacts.require('DIDRegistry.sol')
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

// todo add unit tests for did registry here
contract('DIDRegistry constructor', (accounts) => {
    let zos

    before(async () => {
        zos = new ZeppelinHelper('DIDRegistry')
        await zos.initialize(accounts[0], false)
    })

    it('Should deploy', async () => {
        // act-assert
        await DIDRegistry.at(zos.getProxyAddress('DIDRegistry'))
    })
})
