const Web3 = require('web3')
const constants = require('./constants.js')

let web3 = new Web3(new Web3.providers.HttpProvider(constants.keeper.nodeUrl))
let getBalance = async (token, address) => {
    return web3.utils.toDecimal(
        await token.balanceOf.call(address)
    )
}

module.exports = getBalance
