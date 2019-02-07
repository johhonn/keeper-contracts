/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach, expect */

const chai = require('chai')
const { assert } = chai
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
            await EpochLibrary.new({ from: accounts[0] })})
    })

    describe('create epoch', () => {
        it('should create and epoch exist', async () => {
            const { epochLibrary } = await setupTest()

        })
    })

    describe('get epoch', () => {
        it('successful create should get unfulfilled condition', async () => {
            const { epochLibrary } = await setupTest()

        })
    })

    describe('exists', () => {
        it('successful create should exist', async () => {
        })

        it('no create should not exist', async () => {
        })
    })
})
