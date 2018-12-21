/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const DIDRegistry = artifacts.require('DIDRegistry.sol')

contract('DIDRegistry constructor', (accounts) => {
    it('Should deploy', async () => {
        // act-assert
        await DIDRegistry.new({ from: accounts[0] })
    })
})
