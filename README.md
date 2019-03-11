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

Follow the steps for local deployment. Make sure that the address [`0x90eE7A30339D05E07d9c6e65747132933ff6e624`](https://submarine.dev-ocean.com/address/0x90ee7a30339d05e07d9c6e65747132933ff6e624) is having enough (~1) Ether.

```bash
export NMEMORIC=<your nile nmemoric>
npm run deploy:nile
```

The transaction should show up on the account: [`0x90eE7A30339D05E07d9c6e65747132933ff6e624`](https://submarine.dev-ocean.com/address/0x90ee7a30339d05e07d9c6e65747132933ff6e624/transactions)

The contract addresses deployed on Ocean Nile testnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.8.2  | `0x3195fCEb1F95006C77dBD957690224e047a1EdD9` |
| AgreementStoreManager             | v0.8.2  | `0xa2c2F2B55b9bCd36c014e0900875c662737f1731` |
| ConditionStoreManager             | v0.8.2  | `0x1b8c05c40B888aCe1050bb761eFF1E8cFAEafF04` |
| DIDRegistry                       | v0.8.2  | `0xeB56578EA25e3DbbA73136Cc250354Ed849dCcf3` |
| DIDRegistryLibrary                | v0.8.2  | `0x87361F953C48459465530d0a4F8D22a010E90895` |
| Dispenser                         | v0.8.2  | `0x97eA790cA2997C53030c9Cc9bC1f430AE4771714` |
| EpochLibrary                      | v0.8.2  | `0xC4f818e2818C294A59D3A4E55544549f7cF5Ef0D` |
| EscrowAccessSecretStoreTemplate   | v0.8.2  | `0x7A2f22E8449d971Dcd4dB18FB8552F4d6512a551` |
| EscrowReward                      | v0.8.2  | `0x4b3102679A3EBBF0010D50F8271F0A0Ab07c5Bdc` |
| HashLockCondition                 | v0.8.2  | `0xB241dB858e4390679AC10e8Ed2bCf15621C3f865` |
| LockRewardCondition               | v0.8.2  | `0x39BF3F8Bc807Ff7F7fE2C859074efaA25b052010` |
| OceanToken                        | v0.8.2  | `0x03A84EBA0A08403b57c465Ba4d5fF694574eFE70` |
| SignCondition                     | v0.8.2  | `0xA4917d03cf75d25247ce34C4Ec4397CE78820788` |
| TemplateStoreManager              | v0.8.2  | `0x545E17Ec84209245CCC8c6F0bF6a1AD4a1dF2CcD` |

#### Kovan Testnet

Follow the steps for local deployment. Make sure that the address [`0x2c0d5f47374b130ee398f4c34dbe8168824a8616`](https://kovan.etherscan.io/address/0x2c0d5f47374b130ee398f4c34dbe8168824a8616) is having enough (~1) Ether.

If you managed to deploy the contracts locally do:

```bash
export INFURA_TOKEN=<your infura token>
export NMEMORIC=<your kovan nmemoric>
npm run deploy:kovan
```

The transaction should show up on: [`0x2c0d5f47374b130ee398f4c34dbe8168824a8616`](https://kovan.etherscan.io/address/0x2c0d5f47374b130ee398f4c34dbe8168824a8616)

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
