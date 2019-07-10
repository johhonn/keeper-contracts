/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const constants = require('../../helpers/constants')

const HashListLibrary = artifacts.require('HashListLibrary')
const HashListLibraryProxy = artifacts.require('HashListLibraryProxy')

contract('HashListLibrary', (accounts) => {
    let hashListLibrary
    let hashListLibraryProxy

    beforeEach(async () => {
        hashListLibrary = await HashListLibrary.new()
        HashListLibraryProxy.link('HashListLibrary', hashListLibrary.address)
        hashListLibraryProxy = await HashListLibraryProxy.new()
        hashListLibraryProxy.initialize(accounts[0], { from: accounts[0] })
    })

    describe('add', () => {
        it('should add a new value to list', async () => {
//            const newAccountHash = constants.bytes32.one
//            await hashListLibraryProxy.add(
//                newAccountHash
//            )
//            assert.strictEqual(
//                await hashListLibraryProxy.has(newAccountHash),
//                true
//            )
        })
    })
})
