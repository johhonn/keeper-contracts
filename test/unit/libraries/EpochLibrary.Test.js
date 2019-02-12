/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary.sol')

contract('EpochLibrary', (accounts) => {
    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            // act-assert
            await EpochLibrary.new()
        })
    })

    describe('create epoch', () => {
    })

    describe('get epoch', () => {
    })
})
