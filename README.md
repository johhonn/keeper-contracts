[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# keeper-contracts

> 💧 Integration of TCRs, CPM and Ocean Tokens in Solidity
> [oceanprotocol.com](https://oceanprotocol.com)

| Dockerhub | TravisCI | Ascribe | Greenkeeper |
|-----------|----------|---------|-------------|
|[![Docker Build Status](https://img.shields.io/docker/build/oceanprotocol/keeper-contracts.svg)](https://hub.docker.com/r/oceanprotocol/keeper-contracts/)|[![Build Status](https://api.travis-ci.com/oceanprotocol/keeper-contracts.svg?branch=master)](https://travis-ci.com/oceanprotocol/keeper-contracts)|[![js ascribe](https://img.shields.io/badge/js-ascribe-39BA91.svg)](https://github.com/ascribe/javascript)|[![Greenkeeper badge](https://badges.greenkeeper.io/oceanprotocol/keeper-contracts.svg)](https://greenkeeper.io/)|

---

**🐲🦑 THERE BE DRAGONS AND SQUIDS. This is in alpha state and you can expect running into problems. If you run into them, please open up [a new issue](https://github.com/oceanprotocol/keeper-contracts/issues). 🦑🐲**

---

Ocean Keeper implementation where we put the following modules together:

* **TCRs**: users create challenges and resolve them through voting to maintain registries;
* **Ocean Tokens**: the intrinsic tokens circulated inside Ocean network, which is used in the voting of TCRs;
* **Marketplace**: the core marketplace where people can transact with each other with Ocean tokens.

## Table of Contents

  - [Get Started](#get-started)
     - [Docker](#docker)
     - [Local development](#local-development)
     - [Testnet deployment](#testnet-deployment)
        - [Nile Testnet](#nile-testnet)
        - [Kovan Testnet](#kovan-testnet)
  - [Libraries](#libraries)
  - [Testing](#testing)
     - [Code Linting](#code-linting)
  - [Documentation](#documentation)
     - [Use Case 1: Register data asset](#use-case-1-register-data-asset)
     - [Use Case 2: Authorize access with OceanAuth contract](#use-case-2-authorize-access-with-oceanauth-contract)
  - [New version](#version)
  - [Contributing](#contributing)
  - [Prior Art](#prior-art)
  - [License](#license)

---

## Get Started

For local development you can either use Docker, or setup the development environment on your machine.

### Docker

The most simple way to get started is with Docker:

```bash
git clone git@github.com:oceanprotocol/keeper-contracts.git
cd keeper-contracts/

docker build -t oceanprotocol/keeper-contracts:0.1 .
docker run -d -p 8545:8545 oceanprotocol/keeper-contracts:0.1
```

or simply pull it from docker hub:

```bash
docker pull oceanprotocol/keeper-contracts
docker run -d -p 8545:8545 oceanprotocol/keeper-contracts 
```

Which will expose the Ethereum RPC client with all contracts loaded under localhost:8545, which you can add to your `truffle.js`:

```js
module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*',
            gas: 6000000
        },
    }
}
```

### Local development

As a pre-requisite, you need:

- Node.js >=6, <=v9 (because of ursa, see https://github.com/JoshKaufman/ursa/issues/175)
- npm

Clone the project and install all dependencies:

```bash
git clone git@github.com:oceanprotocol/keeper-contracts.git
cd keeper-contracts/

# install dependencies
npm i

# install RPC client globally
npm install -g ganache-cli
```

Compile the solidity contracts:

```bash
npm run compile
```

In a new terminal, launch an Ethereum RPC client, e.g. [ganache-cli](https://github.com/trufflesuite/ganache-cli):

```bash
ganache-cli
```

Switch back to your other terminal and deploy the contracts:

```bash
npm run migrate

# for redeployment run this instead
npm run migrate -- --reset
```

### Testnet deployment

#### Nile Testnet

Follow the steps for local deployment. Make sure that the address `0x90eE7A30339D05E07d9c6e65747132933ff6e624` is having enough (~1) Ether.

```bash
export NMEMORIC=<your nile nmemoric>
npm run migrate:nile
```

The transaction should show up on the account: `0x90eE7A30339D05E07d9c6e65747132933ff6e624`

The contract addresses deployed on Ocean Nile testnet:

| Contract           | Version | Address                                      |
|--------------------|---------|----------------------------------------------|
| AccessConditions   | v0.5.0  | `0x38ba43fFa8C7715F0f2A5d52E78a392d2bD71176` |
| ComputeConditions  | v0.5.0  | `0x771136ebC55A1747B52722D1bb95323D98550293` |
| DIDRegistry        | v0.5.0  | `0xe6CeA58707df303b6d9D1DF5BA8Bf88fF4A5920D` |
| FitchainConditions | v0.5.0  | `0x4563092EE6736a5D920882D2c39c91EAf7956f07` |
| OceanAuth          | v0.5.0  | `0xfC6DB8141144831a8B7d858f356D0d1148d8F11d` |
| OceanMarket        | v0.5.0  | `0x8c4a2cC4572B6CD68c58BFc220f04CD1143230a0` |
| OceanToken         | v0.5.0  | `0x5e29AcdE5285E24eb7A211d9F4313E5a9Ed07F36` |
| PaymentConditions  | v0.5.0  | `0xdAAb92eABB4F2D7fC51948E44A88aa4fd986EDa9` |
| ServiceAgreement   | v0.5.0  | `0xb8D436b29CBF1ef690DD3b0972Cce2090ECb09bc` |

#### Kovan Testnet

Follow the steps for local deployment. Make sure that the address [0x2c0d5f47374b130ee398f4c34dbe8168824a8616](https://kovan.etherscan.io/address/0x2c0d5f47374b130ee398f4c34dbe8168824a8616) is having enough (~1) Ether.

If you managed to deploy the contracts locally do:

```bash
export INFURA_TOKEN=<your infura token>
export NMEMORIC=<your kovan nmemoric>
npm run migrate:kovan
```

The transaction should show up on: `https://kovan.etherscan.io/address/0x2c0d5f47374b130ee398f4c34dbe8168824a8616`

The contract addresses deployed on Kovan testnet:

| Contract           | Version | Address                                      |
|--------------------|---------|----------------------------------------------|
| AccessConditions   | v0.5.0  | `0x0aF8734b1DB51464a01F83FE4167054a2f7F6794` |
| ComputeConditions  | v0.5.0  | `0x138F020dDdd65cA6Ce4E799adFD32cbfEbE384f6` |
| DIDRegistry        | v0.5.0  | `0x6DCbE42F6bF7c350F5A8a86FC5fCfea0b3EDe9f6` |
| FitchainConditions | v0.5.0  | `0xE4498F5B1a9E890F3A0A4Bbd6aF4fCC8b54D96ff` |
| OceanAuth          | v0.5.0  | `0x094E34848e884411684BDC5422BAcF251d046D8B` |
| OceanMarket        | v0.5.0  | `0xb5bEfAB48835547Ac3A22608c74CFe2ce973d110` |
| OceanToken         | v0.5.0  | `0x63A94230DA3aa27E5f68F22F8854CE3FcA702695` |
| PaymentConditions  | v0.5.0  | `0x34D6dFB10fb29441Ee6B053f86AE58D3A8a7D869` |
| ServiceAgreement   | v0.5.0  | `0xd13998e9c0B40c0028412b59e36213f5cAaA9C6E` |

## Libraries

To facilitate the integration of the Ocean Keeper Smart Contracts, Python and Javascript libraries are ready to be integrated. Those libraries include the Smart Contract ABI's.
Using these libraries helps to avoid compiling the Smart Contracts and copying the ABI's manually to your project. In that way the integration is cleaner and easier.
The libraries provided currently are:

* JavaScript npm package - As part of the [@oceanprotocol npm organization](https://www.npmjs.com/settings/oceanprotocol/packages), the [npm keeper-contracts package](https://www.npmjs.com/package/@oceanprotocol/keeper-contracts) provides the ABI's to be imported from your JavaScript code.
* Python Pypi package - The [Pypi keeper-contracts package](https://pypi.org/project/keeper-contracts/) provides the same ABI's to be used from Python.
* Java Maven package - It's possible to generate the maven stubs to interact with the smart contracts. It's necessary to have locally web3j and run the `scripts/maven.sh` script

## Testing

Run tests with `npm test`, e.g.:

```bash
npm test -- test/Auth.Test.js
```

### Code Linting

Linting is setup for JavaScript with [ESLint](https://eslint.org) & Solidity with [Ethlint](https://github.com/duaraghav8/Ethlint).

Code style is enforced through the CI test process, builds will fail if there're any linting errors.

## Documentation

* [**Main Documentation: TCR, Market and Ocean Tokens**](doc/)
* [Architecture (pdf)](doc/files/Smart-Contract-UML-class-diagram.pdf)
* [Packaging of libraries](doc/packaging.md)

### Use Case 1: Register data asset

```Javascript
const Market = artifacts.require('OceanMarket.sol')
...
// get instance of OceanMarket contract
const market = await Market.deployed()
...
// generate resource id
const name = 'resource name'
const resourceId = await market.generateId(name, { from: accounts[0] })
const resourcePrice = 100

// register data asset on-chain
await market.register(resourceId, resourcePrice, { from: accounts[0] })
```

### Use Case 2: Authorize access with OceanAuth contract

Here is an example of authorization process with OceanAuth contract.

`accounts[0]` is provider and `accounts[1]` is consumer.

Note that different cryptographic algorithms can be chosen to encrypt and decrypt access token using key pairs (i.e., public key and private key). This example uses [URSA](https://www.npmjs.com/package/ursa) to demonstrate the process for illustration purpose.

```Javascript
const Token = artifacts.require('OceanToken.sol')
const Market = artifacts.require('OceanMarket.sol')
const Auth = artifacts.require('OceanAuth.sol')
...
const ursa = require('ursa')
const ethers = require('ethers')
const Web3 = require('web3')
...
// get instances of deployed contracts
const token = await Token.deployed()
const market = await Market.deployed()
const auth = await Auth.deployed()
...
// consumer request some testing tokens to buy data asset
await market.requestTokens(200, { from: accounts[1] })
// consumers approve withdraw limit of their funds
await token.approve(market.address, 200, { from: accounts[1] })
...
// consumer generates temporary key pairs in local
const modulusBit = 512
const key = ursa.generatePrivateKey(modulusBit, 65537)
const privatePem = ursa.createPrivateKey(key.toPrivatePem())
const publicPem = ursa.createPublicKey(key.toPublicPem())
const publicKey = publicPem.toPublicPem('utf8')
...
// consumer initiate a new access request and pass public key
await auth.initiateAccessRequest(resourceId, accounts[0], publicKey, expireTime, { from: accounts[1] })
// provider commit the access request
await auth.commitAccessRequest(accessId, true, expireTime, '', '', '', '', { from: accounts[0] })
...
// consumer sends the payment to OceanMarket contract
await market.sendPayment(accessId, accounts[0], price, expireTime, { from: accounts[1] })
...
// provider encrypt "JSON Web Token" (JWT) using consumer's temp public key
const encJWT = getPubKeyPem.encrypt('JWT', 'utf8', 'hex')
// provider delivers the encrypted JWT on-chain
await auth.deliverAccessToken(accessId, `0x${encJWT}`, { from: accounts[0] })
...
// consumer generate signature of encrypte JWT and send to provider
const prefix = '0x'
const hexString = Buffer.from(onChainencToken).toString('hex')
const signature = web3.eth.sign(accounts[1], `${prefix}${hexString}`)
...
// provider verify the signature from consumer to prove delivery of access token
const sig = ethers.utils.splitSignature(signature)
const fixedMsg = `\x19Ethereum Signed Message:\n${onChainencToken.length}${onChainencToken}`
const fixedMsgSha = web3.sha3(fixedMsg)
await auth.verifyAccessTokenDelivery(accessId, accounts[1], fixedMsgSha, sig.v, sig.r, sig.s, { from: accounts[0] })
```

## New Version

The `bumpversion.sh` script helps to bump the project version. You can execute the script using as first argument {major|minor|patch} to bump accordingly the version. Also you can provide the option `--tag` to automatically create the version tag.

## Contributing

See the page titled "[Ways to Contribute](https://docs.oceanprotocol.com/concepts/contributing/)" in the Ocean Protocol documentation.

## Prior Art

This project builds on top of the work done in open source projects:

- [ConsenSys/PLCRVoting](https://github.com/ConsenSys/PLCRVoting)
- [skmgoldin/tcr](https://github.com/skmgoldin/tcr)
- [OpenZeppelin/openzeppelin-solidity](https://github.com/OpenZeppelin/openzeppelin-solidity)

## License

```
Copyright 2018 Ocean Protocol Foundation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

