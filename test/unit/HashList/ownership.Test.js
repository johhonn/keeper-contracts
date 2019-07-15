/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const HashListLibrary = artifacts.require('HashListLibrary')
const HashList = artifacts.require('HashList')

contract('HashListLibrary', (accounts) => {
    let hashListLibrary
    let hashList
    let owner = accounts[0]

    beforeEach(async () => {
        hashListLibrary = await HashListLibrary.new()
        HashList.link('HashListLibrary', hashListLibrary.address)
        hashList = await HashList.new()
        hashList.initialize(owner, { from: owner })
    })

    describe('ownedBy', () => {
        it('should return list owner', async () => {
            assert.strictEqual(
                await hashList.ownedBy(),
                owner
            )
        })
    })
})
