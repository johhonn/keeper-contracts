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
npm run deploy

# for redeployment run this instead
npm run clean
npm run compile
npm run deploy
```

Upgrade contract [**optional**]:
```bash
npm run upgrade <DEPLOYED_CONTRACT>:<NEW_CONTRACT>
```

### Testnet deployment

#### Nile Testnet

Follow the steps for local deployment. Make sure that the address `0x90eE7A30339D05E07d9c6e65747132933ff6e624` is having enough (~1) Ether.

```bash
export NMEMORIC=<your nile nmemoric>
npm run deploy:nile
```

The transaction should show up on the account: `0x90eE7A30339D05E07d9c6e65747132933ff6e624`

The contract addresses deployed on Ocean Nile testnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.7.0  | `0x146becf5607b4daea1be310781ee20a84d232541` |
| AgreementStoreManager             | v0.7.0  | `0x3ec8be9fb4c3b5840650f6deab7e537917ba2243` |
| ConditionStoreManager             | v0.7.0  | `0x4ca8a132f33989358d0a3042cd5394b57b820931` |
| DIDRegistry                       | v0.7.0  | `0xa1f09400b6959c3de6a32a58e625858ae0370401` |
| Dispenser                         | v0.7.0  | `0x3ebd0ab62a354bd3baeeed7345cf369ec7a1f2c5` |
| EscrowAccessSecretStoreTemplate   | v0.7.0  | `0x743e848db40fb8a3cd996970feeabee0bfd0d2b6` |
| EscrowReward                      | v0.7.0  | `0xc3ba87cb998d2d529c3ad97aa18a16468764e108` |
| HashLockCondition                 | v0.7.0  | `0xe7ee67fc1b3009a04d89401eaa8356d6f6e407af` |
| LockRewardCondition               | v0.7.0  | `0x918eb48009ccc25dbd6b4a6812cc5a859036df7e` |
| OceanToken                        | v0.7.0  | `0x1e8a47dc8af56d48a2a6a3c9335537778adca420` |
| SignCondition                     | v0.7.0  | `0x70f90441db73675436c60cdd5b0beb8d14aee01f` |
| TemplateStoreManager              | v0.7.0  | `0x2778ae1d2e5a0af155b073d7de259f82f7d8f88f` |

#### Kovan Testnet

Follow the steps for local deployment. Make sure that the address [0x2c0d5f47374b130ee398f4c34dbe8168824a8616](https://kovan.etherscan.io/address/0x2c0d5f47374b130ee398f4c34dbe8168824a8616) is having enough (~1) Ether.

If you managed to deploy the contracts locally do:

```bash
export INFURA_TOKEN=<your infura token>
export NMEMORIC=<your kovan nmemoric>
npm run deploy:kovan
```

The transaction should show up on: `https://kovan.etherscan.io/address/0x2c0d5f47374b130ee398f4c34dbe8168824a8616`

The contract addresses deployed on Kovan testnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.7.0  | `0x6e0e0e474102c2f326bfbd5e367455258ed87d1e` |
| AgreementStoreManager             | v0.7.0  | `0xd462a1b14cbd7a6c2cbea0958d2f755a6f0901a6` |
| ConditionStoreManager             | v0.7.0  | `0x459ff387330e3f3aadcc46dda6de964aa8e63421` |
| DIDRegistry                       | v0.7.0  | `0x7061c669fad3efe6ebcb863646649210bd08f534` |
| Dispenser                         | v0.7.0  | `0xb38d23fdc5c4340144c4ff92954b2a4b47648459` |
| EscrowAccessSecretStoreTemplate   | v0.7.0  | `0xaeb99e067c09b332c8ff15f6bd4213f5a3327b4e` |
| EscrowReward                      | v0.7.0  | `0x5e349b50e477dcfebb028f788e2c7c0a4a38505b` |
| HashLockCondition                 | v0.7.0  | `0x3553a5e64598291e3b4820c368db1ad5bea9b549` |
| LockRewardCondition               | v0.7.0  | `0x3a25d63058f9c33aba700577a4c0097c47b3998b` |
| OceanToken                        | v0.7.0  | `0x94b139d39257f3b9b7bd1772749076f8b7f74790` |
| SignCondition                     | v0.7.0  | `0x7d4959e62be3a32c199c47c14a445eb92d3d8879` |
| TemplateStoreManager              | v0.7.0  | `0x9660ca4a3d5a114b56050bbe0382f3c44ad4dae7` |

## Libraries

To facilitate the integration of the Ocean Keeper Smart Contracts, Python and Javascript libraries are ready to be integrated. Those libraries include the Smart Contract ABI's.
Using these libraries helps to avoid compiling the Smart Contracts and copying the ABI's manually to your project. In that way the integration is cleaner and easier.
The libraries provided currently are:

* JavaScript npm package - As part of the [@oceanprotocol npm organization](https://www.npmjs.com/settings/oceanprotocol/packages), the [npm keeper-contracts package](https://www.npmjs.com/package/@oceanprotocol/keeper-contracts) provides the ABI's to be imported from your JavaScript code.
* Python Pypi package - The [Pypi keeper-contracts package](https://pypi.org/project/keeper-contracts/) provides the same ABI's to be used from Python.
* Java Maven package - It's possible to generate the maven stubs to interact with the smart contracts. It's necessary to have locally web3j and run the `scripts/maven.sh` script

## Testing

Run tests with `npm run test`, e.g.:

```bash
npm run test -- test/unit/agreements/AgreementStoreManager.Test.js
```

### Code Linting

Linting is setup for JavaScript with [ESLint](https://eslint.org) & Solidity with [Ethlint](https://github.com/duaraghav8/Ethlint).

Code style is enforced through the CI test process, builds will fail if there're any linting errors.

## Documentation

* [Main Documentation](doc/)
* [Keeper-contracts Diagram](doc/files/Keeper-Contracts.png)
* [Packaging of libraries](doc/packaging.md)
* [Upgrading contracts](doc/upgrades.md)

## New Version / New Release

See [RELEASE_PROCESS.md](RELEASE_PROCESS.md)

## Contributing

See the page titled "[Ways to Contribute](https://docs.oceanprotocol.com/concepts/contributing/)" in the Ocean Protocol documentation.

## Prior Art

This project builds on top of the work done in open source projects:
- [zeppelinos/zos](https://github.com/zeppelinos/zos)
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
