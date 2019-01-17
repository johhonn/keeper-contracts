/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, beforeEach */
const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')

contract('ServiceExecutionAgreement', (accounts) => {
    let sea

    beforeEach(async () => {
        sea = await ServiceExecutionAgreement.new({ from: accounts[0] })
    })

    describe('views', () => {
        it('Should return current block', async () => {
            // act
            const result = await sea.getCurrentBlockNumber({ from: accounts[0] })

            // assert
            assert.isOk(result > 0)
        })
    })
})
