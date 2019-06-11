[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# keeper-contracts

> 💧 Integration of SEAs, DID and OceanToken in Solidity
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
     - [Testnets](#testnets)
        - [Nile Testnet](#nile-testnet)
        - [Kovan Testnet](#kovan-testnet)
  - [Testing](#testing)
     - [Code Linting](#code-linting)
  - [Packages](#packages)
  - [Deployments, Upgrades, New Versions, New Releases](#deployments-upgrades-new-versions-new-releases)
  - [Documentation](#documentation)
  - [Contributing](#contributing)
  - [Prior Art](#prior-art)
  - [License](#license)
  
---

## Get Started

For local development of `keeper-contracts` you can either use Docker, or setup the development environment on your machine.

### Docker

The simplest way to get started with is [barge](https://github.com/oceanprotocol/barge), a docker compose application to run Ocean Protocol.

### Local development

As a pre-requisite, you need:

- Node.js
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
npm run deploy:development

# for redeployment run this instead
npm run clean
npm run compile
npm run deploy:development
```

Upgrade contracts [**optional**]:
```bash
npm run upgrade
```

## Testing

Run tests with `npm run test`, e.g.:

```bash
npm run test -- test/unit/agreements/AgreementStoreManager.Test.js
```

### Code Linting

Linting is setup for `JavaScript` with [ESLint](https://eslint.org) & Solidity with [Ethlint](https://github.com/duaraghav8/Ethlint).

Code style is enforced through the CI test process, builds will fail if there're any linting errors.

### Testnets

#### Duero Testnet

The contract addresses deployed on Ocean's Duero Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.10.0 | `0x99FFC24B6749512F6DE6D24c5dBCC390359af4E3` |
| AgreementStoreManager             | v0.10.0 | `0xfC6DB8141144831a8B7d858f356D0d1148d8F11d` |
| ConditionStoreManager             | v0.10.0 | `0xe6CeA58707df303b6d9D1DF5BA8Bf88fF4A5920D` |
| DIDRegistry                       | v0.10.0 | `0x4878e1dfd4105b8FF3A879C5896495d5DE3274B5` |
| DIDRegistryLibrary                | v0.10.0 | `0x663C7CF54a15fb23aF1dCab15bfa968B8be5903D` |
| Dispenser                         | v0.10.0 | `0xF7B1be190A13bDD9157d9493dF9F4BFD0c8a097F` |
| EpochLibrary                      | v0.10.0 | `0xBDFeAc66c022165Bdb320264398977bf8A54e3C0` |
| EscrowAccessSecretStoreTemplate   | v0.10.0 | `0xdAAb92eABB4F2D7fC51948E44A88aa4fd986EDa9` |
| EscrowReward                      | v0.10.0 | `0xb8D436b29CBF1ef690DD3b0972Cce2090ECb09bc` |
| HashLockCondition                 | v0.10.0 | `0xA2Ab4153F9df4Cccb859d54Aea7A47298Bc83DF6` |
| LockRewardCondition               | v0.10.0 | `0x518cf43258Ece569D5Cd19e6C0Cee41156FB6aED` |
| OceanToken                        | v0.10.0 | `0x5e29AcdE5285E24eb7A211d9F4313E5a9Ed07F36` |
| SignCondition                     | v0.10.0 | `0x8c4a2cC4572B6CD68c58BFc220f04CD1143230a0` |
| TemplateStoreManager              | v0.10.0 | `0xF454Ec72eCed751ffAD94B11ae7c0323670dd976` |

#### Nile Beta Network

The contract addresses deployed on Ocean's Nile Beta Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.10.0 | `0x45DE141F8Efc355F1451a102FB6225F1EDd2921d` |
| AgreementStoreManager             | v0.10.0 | `0x62f84700b1A0ea6Bfb505aDC3c0286B7944D247C` |
| ConditionStoreManager             | v0.10.0 | `0x39b0AA775496C5ebf26f3B81C9ed1843f09eE466` |
| DIDRegistry                       | v0.10.0 | `0x4A0f7F763B1A7937aED21D63b2A78adc89c5Db23` |
| DIDRegistryLibrary                | v0.10.0 | `0x7E51692679F0d67723E82f69437B6F64C080B3A4` |
| Dispenser                         | v0.10.0 | `0x865396b7ddc58C693db7FCAD1168E3BD95Fe3368` |
| EpochLibrary                      | v0.10.0 | `0xAA2C7e6237c22901533400AA9E381327A7B7982F` |
| EscrowAccessSecretStoreTemplate   | v0.10.0 | `0xfA16d26e9F4fffC6e40963B281a0bB08C31ed40C` |
| EscrowReward                      | v0.10.0 | `0xeD4Ef53376C6f103d2d7029D7E702e082767C6ff` |
| HashLockCondition                 | v0.10.0 | `0xB5f2e45e8aD4a1339D542f2defd5095B98054590` |
| LockRewardCondition               | v0.10.0 | `0xE30FC30c678437e0e8F78C52dE9db8E2752781a0` |
| OceanToken                        | v0.10.0 | `0x9861Da395d7da984D5E8C712c2EDE44b41F777Ad` |
| SignCondition                     | v0.10.0 | `0x5a4301F8a7a8A13485621b9B4C82B1E66c112ee2` |
| TemplateStoreManager              | v0.10.0 | `0x9768c8ae44f1dc81cAA98F48792aA5730cAd2F73` |

#### Kovan Testnet

The contract addresses deployed on Kovan testnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.10.0 | `0x9Ee06Ac392FE11f1933a51B48D1d07dd97f1dec7` |
| AgreementStoreManager             | v0.10.0 | `0x412d4F57425b41FE027e06b9f37D569dcAE2eAa4` |
| ConditionStoreManager             | v0.10.0 | `0xA5f5BaB34DE3782A71D37d0B334217Ded341cd64` |
| DIDRegistry                       | v0.10.0 | `0x9254f7c8f1176C685871E7A8A99E11e96775F488` |
| DIDRegistryLibrary                | v0.10.0 | `0xf22aEF1421CCd4f0A0D0BB1f7fe03233384c69B4` |
| Dispenser                         | v0.10.0 | `0x5B92243133094210F504dF6B9D54fD70E7B281DC` |
| EpochLibrary                      | v0.10.0 | `0x44Ca6882823a2d7864376893A4BCF3eB377693e4` |
| EscrowAccessSecretStoreTemplate   | v0.10.0 | `0xe0Afe9a948f9Fa39524c8d29a98d75409018ABf0` |
| EscrowReward                      | v0.10.0 | `0xa182ff844c71803Bf767c3AB4180B3bfFADa6B2B` |
| HashLockCondition                 | v0.10.0 | `0x11ef2D50868c1f1063ba0141aCD53691A0293c25` |
| LockRewardCondition               | v0.10.0 | `0x2a2A2C5fF51C5f1c84547FC7a194c00F82763432` |
| OceanToken                        | v0.10.0 | `0xB57C4D626548eB8AC0B82b086721516493E2908d` |
| SignCondition                     | v0.10.0 | `0x7B8B2756de9Ab474ddbCc87047117a2A16419194` |
| TemplateStoreManager              | v0.10.0 | `0xD20307e2620Bb8a60991f43c52b64f981103A829` |

## Mainnets

### Ethereum Mainnet

The contract addresses deployed on Ethereum Mainnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.10.0 | `0x57e299517B6E5637cE9da15E4372f42a63c7e099` |
| AgreementStoreManager             | v0.10.0 | `0x5E98B9EfABe192aB02a9B39D9B44A22C88A625BD` |
| ConditionStoreManager             | v0.10.0 | `0x031A0B2FE74086e5963CD5Ac27Bd1451A40Fe593` |
| DIDRegistry                       | v0.10.0 | `0xC4A1D6d4778C9A17D5e37797dA2FaB48FA9d01f6` |
| DIDRegistryLibrary                | v0.10.0 | `0xFb4231AF132A8E160292022eBd8ea4292104B1Da` |
| EpochLibrary                      | v0.10.0 | `0xb5096b69638689eE2dC7CA56Babaf7d8521a7Abb` |
| EscrowAccessSecretStoreTemplate   | v0.10.0 | `0xa713D8F4791512a599A98f5DcaCC6401D6c76e5f` |
| EscrowReward                      | v0.10.0 | `0xB950FE753871dc8b79284d76EA4A213db4697578` |
| HashLockCondition                 | v0.10.0 | `0x860761Dbbe9b8377A2933a1093B39167B907befF` |
| LockRewardCondition               | v0.10.0 | `0xD41161D8f2CE5Ec95465F4b2fBD00Cfea186204C` |
| SignCondition                     | v0.10.0 | `0xEE33DCDBE6aF6197dD01907cfc4296BFC0448B16` |
| TemplateStoreManager              | v0.10.0 | `0x04DD5364b12131ae870Ec54bd539b5Cb94B9DC36` |

### Pacific Mainnet

The contract addresses deployed on Pacific Mainnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.10.0 | `0xD57d35f3cc369187F78838eb4e4Ee37095B405a4` |
| AgreementStoreManager             | v0.10.0 | `0x79465ff79db0CAFaF77ee428207320FBB9aeF315` |
| ConditionStoreManager             | v0.10.0 | `0xeA27E2b134c6745624e67bF7AC0A056fE58c8481` |
| DIDRegistry                       | v0.10.0 | `0x7A95F2C739b187C96C52ADb8fFB7f086A968238b` |
| DIDRegistryLibrary                | v0.10.0 | `0x11F913eC180f2eA78f15e92CB9071627d33FdFdb` |
| EpochLibrary                      | v0.10.0 | `0x3f51432C504E8612d7625034b93c180dA15bC9be` |
| EscrowAccessSecretStoreTemplate   | v0.10.0 | `0x573428b11305b5d047752B7e1cD509EcfA43E1dd` |
| EscrowReward                      | v0.10.0 | `0xeF74A52DEf3A3b5730d34DA78A972073f1bA995D` |
| HashLockCondition                 | v0.10.0 | `0x664Dd1930782b5c5aE5a0b41FB15e002686bC196` |
| LockRewardCondition               | v0.10.0 | `0xBA7131370Fe7D2f83b15f1Cfb72a4722E96c593b` |
| OceanToken                        | v0.10.0 | `0x403f0eFfEE94A488871510ad8284298b9801C001` |
| SignCondition                     | v0.10.0 | `0x7Da9C8ea6EDa8F2d6D06E6122AeAE95300b2f802` |
| TemplateStoreManager              | v0.10.0 | `0x748D2ba7449677eBb8758baB65242bFb5eD30a0e` |

## Packages

To facilitate the integration of the Ocean Protocol's `keeper-contracts` there are `Python`, `JavaScript` and `Java` packages ready to be integrated. Those libraries include the Smart Contract ABI's.
Using these packages helps to avoid compiling the Smart Contracts and copying the ABI's manually to your project. In that way the integration is cleaner and easier.
The packages provided currently are:

* JavaScript `npm` package - As part of the [@oceanprotocol npm organization](https://www.npmjs.com/settings/oceanprotocol/packages), the [npm keeper-contracts package](https://www.npmjs.com/package/@oceanprotocol/keeper-contracts) provides the ABI's to be imported from your `JavaScript` code.
* Python `Pypi` package - The [Pypi keeper-contracts package](https://pypi.org/project/keeper-contracts/) provides the same ABI's to be used from `Python`.
* Java `Maven` package - The [Maven keeper-contracts package](https://search.maven.org/artifact/com.oceanprotocol/keeper-contracts) provides the same ABI's to be used from `Java`.

The packages contains all the content from the `doc/` and `artifacts/` folders.

In `JavaScript` they can be used like this:

Install the `keeper-contracts` `npm` package.

```bash
npm install @oceanprotocol/keeper-contracts
```

Load the ABI of the `OceanToken` contract on the `nile` network:

```javascript
const OceanToken = require('@oceanprotocol/keeper-contracts/artifacts/OceanToken.nile.json')
```


The structure of the `artifacts` is:

```json
{
  "abi": "...",
  "bytecode": "0x60806040523...",
  "address": "0x45DE141F8Efc355F1451a102FB6225F1EDd2921d",
  "version": "v0.9.1"
}
```

## Deployments, Upgrades, New Versions, New Releases

See [RELEASE_PROCESS.md](RELEASE_PROCESS.md)

## Documentation

* [Main Documentation](doc/)
* [Keeper-contracts Diagram](doc/files/Keeper-Contracts.png)
* [Packaging of libraries](doc/packaging.md)
* [Upgrading contracts](doc/upgrades.md)

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
