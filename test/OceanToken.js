/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const OceanToken = artifacts.require('OceanToken.sol')

contract('OceanToken', (accounts) => {
    let contract

    beforeEach(async () => {
        contract = await OceanToken.new({ from: accounts[0] })
    })

    describe('setReceiver', () => {
        it('Should set receiver', async () => {
            // act
            await contract.setReceiver(accounts[0])

            // assert
            const balance = await contract.balanceOf(accounts[0])
            assert.equal(parseInt(balance, 10), 1400000000000000000000000000)
            assert.equal(await contract._receiver(), accounts[0])
        })

        it('Shouldn\'t set receiver twice', async () => {
            // arrange
            await contract.setReceiver(accounts[0])

            // act-assert
            try {
                await contract.setReceiver(accounts[1])
            } catch (e) {
                assert.equal(e.reason, 'Receiver address already set.')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('transfer', () => {
        it('Should transfer', async () => {
            // arrange
            await contract.setReceiver(accounts[0])

            // act
            await contract.transfer(accounts[1], 100, { from: accounts[0] })

            // assert
            const balance = await contract.balanceOf(accounts[1])
            assert.equal(parseInt(balance, 10), 100)
        })

        it('Shouldn\'t transfer to empty address', async () => {
            // arrange
            await contract.setReceiver(accounts[0])

            // act-assert
            try {
                await contract.transfer(0x0, 100, { from: accounts[0] })
            } catch (e) {
                assert.equal(e.reason, 'To address is 0x0.')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('transferFrom', () => {
        it('Should transfer', async () => {
            // arrange
            await contract.setReceiver(accounts[0])
            await contract.approve(accounts[1], 100, { from: accounts[0] })

            // act
            await contract.transferFrom(accounts[0], accounts[2], 100, { from: accounts[1] })

            // assert
            const balance = await contract.balanceOf(accounts[2])
            assert.equal(parseInt(balance, 10), 100)
        })

        it('Shouldn\'t transfer to empty address', async () => {
            // arrange
            await contract.setReceiver(accounts[0])
            await contract.approve(accounts[1], 100, { from: accounts[0] })

            // act-assert
            try {
                await contract.transferFrom(accounts[0], 0x0, 100, { from: accounts[1] })
            } catch (e) {
                assert.equal(e.reason, 'To address is 0x0.')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
