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

    describe('remove', () => {
        it('should remove value from list', async () => {
            const newAccountHash = await hashList.hash(accounts[1])
            await hashList.add(
                newAccountHash,
                {
                    from: owner
                }
            )

            await hashList.remove(
                newAccountHash,
                {
                    from: owner
                }
            )

            assert.strictEqual(
                await hashList.has(
                    newAccountHash
                ),
                false
            )
        })

        it('should fail to remove if value does not exist', async () => {
            const newAccountHash = await hashList.hash(accounts[1])
            await hashList.add(
                newAccountHash,
                {
                    from: owner
                }
            )

            await hashList.remove(
                newAccountHash,
                {
                    from: owner
                }
            )

            await assert.isRejected(
                hashList.remove(
                    newAccountHash,
                    {
                        from: owner
                    }
                ),
                'Failed to remove element from list'
            )
        })
    })
})
