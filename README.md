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
  - [New Version / New Release](#new-version-new-release)
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

- Node.js >=6, <=v10.13.0
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

| Contract                  | Version | Address                                      |
|---------------------------|---------|----------------------------------------------|
| ConditionStoreManager     | v0.7.0  | `0xa11ab1263ae3df547a9bbf705218975c497893f9` |
| DIDRegistry               | v0.7.0  | `0x121d92f7ec45f91f504e946ce35d08a27ca7c401` |
| Dispenser                 | v0.7.0  | `0xe489ac0bae65042de3e48890ed5829520872728d` |
| HashLockCondition         | v0.7.0  | `0x9dd31d43b418b6f3361a264a90c782be9b11f151` |
| LockRewardCondition       | v0.7.0  | `0x393851125bcac3f90006451998b9b222f205b815` |
| OceanToken                | v0.7.0  | `0xaab0f2bf4b9267440caedaf32a9cfa6f27befc41` |
| SignCondition             | v0.7.0  | `0x3066e8a50e42d63c1bf612cad991d07bc16457de` |

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

| Contract                  | Version | Address                                      |
|---------------------------|---------|----------------------------------------------|
| AccessConditions          | v0.6.10 | `0xa5a8c65a5db8f1d18ccbb4759692e4dbe1434974` |
| ComputeConditions         | v0.6.10 | `0xa33b8526f2842bb21d996a27f58e285f3fc1e355` |
| DIDRegistry               | v0.6.10 | `0xe838039bc5a796e63cfbc35e68cd21b16b34d9a6` |
| Dispenser                 | v0.6.10 | `0x7077fb27fbcd4fc8369cbd188c1808d27df54aad` |
| FitchainConditions        | v0.6.10 | `0xe48abe6c24c6cf0a43578622964b6a09f51db415` |
| OceanToken                | v0.6.10 | `0xdb003f6eec829d4e936ecee2b4d9db98e676bc5f` |
| PaymentConditions         | v0.6.10 | `0xf15c29421c85bcddfe4e14b945aa5fc1c15315bb` |
| ServiceExecutionAgreement | v0.6.10 | `0x513e54350ecbb1513b5c63132a86e340edda34b8` |

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
* [Upgrading contracts](doc/upgrades.md)

## New Version / New Release

See [RELEASE_PROCESS.md](RELEASE_PROCESS.md)

## Contributing

See the page titled "[Ways to Contribute](https://docs.oceanprotocol.com/concepts/contributing/)" in the Ocean Protocol documentation.

## Prior Art

This project builds on top of the work done in open source projects:

- [OpenZeppelin/openzeppelin-eth](https://github.com/OpenZeppelin/openzeppelin-eth)

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

