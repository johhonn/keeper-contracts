/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary.sol')
const constants = require('../../helpers/constants.js')

contract('EpochLibrary', (accounts) => {
    async function setupTest({
        epochId = constants.bytes32.one
    } = {}) {
        const epochLibrary = await EpochLibrary.new({ from: accounts[0] })

        return { epochLibrary, epochId }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            // act-assert
            await EpochLibrary.new({ from: accounts[0] })
        })
    })

    describe('create epoch', () => {
    })

    describe('get epoch', () => {
    })
})
