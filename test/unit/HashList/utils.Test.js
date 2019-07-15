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
        hashList.initialize(accounts[0], { from: owner })
    })

    describe('get', () => {
        it('should return value by index', async () => {
            const newValue = await hashList.hash(accounts[1])
            await hashList.add(
                newValue,
                {
                    from: owner
                }
            )

            assert.strictEqual(
                await hashList.get(1),
                newValue
            )
        })
    })

    describe('all', () => {
        it('should return all list values', async () => {
            const newValue = await hashList.hash(accounts[1])
            await hashList.add(
                newValue,
                {
                    from: owner
                }
            )

            assert.strictEqual(
                (await hashList.all()).length,
                1
            )
        })
    })

    describe('indexOf', () => {
        it('should return index of value in a list', async () => {
            const newValue = await hashList.hash(accounts[1])
            await hashList.add(
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                (await hashList.indexOf(newValue)).toNumber(),
                1
            )
        })

        it('should fail if value does not exists', async () => {
            const newValue = await hashList.hash(accounts[1])
            await assert.isRejected(
                hashList.indexOf(newValue),
                'Value does not exist'
            )
        })
    })

    describe('isIndexed', () => {
        it('should return false if not indexed list', async () => {
            await assert.isRejected(
                hashList.isIndexed()
            )
        })

        it('should return true if indexed in case of add single element', async () => {
            const newValue = await hashList.hash(accounts[1])
            await hashList.add(
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                await hashList.isIndexed(),
                true
            )
        })

        it('should return true if indexed using add multiple elements', async () => {
            const values = [
                await hashList.hash(accounts[1]),
                await hashList.hash(accounts[2])
            ]

            await hashList.methods['add(bytes32[])'](
                values,
                {
                    from: owner
                }
            )

            await hashList.index(
                1,
                2,
                {
                    from: owner
                }
            )

            // assert
            assert.strictEqual(
                await hashList.isIndexed(),
                true
            )
        })

        it('should fail if not indexed after patch add', async () => {
            const values = [
                await hashList.hash(accounts[1]),
                await hashList.hash(accounts[2])
            ]

            await hashList.methods['add(bytes32[])'](
                values,
                {
                    from: owner
                }
            )

            // assert
            assert.strictEqual(
                await hashList.isIndexed(),
                false
            )
        })
    })

    describe('size', () => {
        it('should return size', async () => {
            const newValue = await hashList.hash(accounts[1])
            await hashList.add(
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                (await hashList.size()).toNumber(),
                1
            )
        })
    })
})
