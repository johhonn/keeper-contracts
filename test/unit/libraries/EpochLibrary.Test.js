/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const testUtils = require('../../helpers/utils')

const EpochLibrary = artifacts.require('EpochLibrary')
const EpochLibraryProxy = artifacts.require('EpochLibraryProxy')

contract('EpochLibrary', (accounts) => {
    let epochLibrary
    let epochLibraryProxy

    beforeEach(async () => {
        epochLibrary = await EpochLibrary.new()
        EpochLibraryProxy.link('EpochLibrary', epochLibrary.address)
        epochLibraryProxy = await EpochLibraryProxy.new()
    })

    describe('create', () => {
        it('should fail when timout equals timelock', async () => {
            await assert.isRejected(
                epochLibraryProxy.create(testUtils.generateId(), 10, 10),
                'Invalid time margin')
        })

        it('should fail when timout greater timelock', async () => {
            await assert.isRejected(
                epochLibraryProxy.create(testUtils.generateId(), 15, 10),
                'Invalid time margin')
        })

        it('should succeed when timelock greater timeout', async () => {
            await assert.isFulfilled(
                epochLibraryProxy.create(testUtils.generateId(), 10, 15)
            )
        })
    })
})
