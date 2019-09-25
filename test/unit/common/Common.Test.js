/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const web3 = require('web3')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const constants = require('../../helpers/constants.js')

contract('Common', (accounts) => {
    let common
    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            common = await Common.new()
            await common.initialize(
                accounts[0],
                { from: accounts[0] }
            )
        })
    })
    describe('hashString', () => {
        it('should be able to hash string', async () => {
            const hash = await common.hashString('string')
            assert.strictEqual(
                hash,
                web3.utils.keccak256('string')
            )
        })
    })
    describe('isContract', () => {
        it('should return true in case of contract address', async () => {
            assert.strictEqual(
                await common.isContract(common.address),
                true
            )
        })
        it('should return false in case of non-contract address', async () => {
            assert.strictEqual(
                await common.isContract(constants.address.one),
                false
            )
        })
    })
})
