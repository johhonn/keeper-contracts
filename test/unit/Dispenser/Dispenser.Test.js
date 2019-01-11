/* eslint-env mocha */
/* eslint-disable no-console */
/* global assert, contract, describe, it, before */
const ZeppelinHelper = require('../../helpers/ZeppelinHelper.js')

contract('Dispenser initializer', (accounts) => {
    let zos
    before(() => {
        zos = new ZeppelinHelper('Dispenser')
    })
    it('Should not deploy if token is empty', async () => {
        // act-assert
        try {
            await zos.initialize(0x0, false)
        } catch (e) {
            console.log(e.message)
            assert.strictEqual(e.reason, 'invalid address')
            return
        }
        assert.fail('Expected revert not received')
    })
})
