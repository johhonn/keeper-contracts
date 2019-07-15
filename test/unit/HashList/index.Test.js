/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
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
        hashList.initialize(accounts[0], { from: owner })
    })

    describe('index', () => {
        it('should revert error message if list already indexed', async () => {

        })

        it('should index non-indexed values in list', async () => {

        })
    })
})
