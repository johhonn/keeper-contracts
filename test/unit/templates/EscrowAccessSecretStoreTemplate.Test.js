/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EscrowAccessSecretStoreTemplate = artifacts.require('EscrowAccessSecretStoreTemplate')

const constants = require('../../helpers/constants.js')
const deployManagers = require('../../helpers/deployManagers.js')

contract('TemplateStoreManager', (accounts) => {
    async function setupTest({
        deployer = accounts[8],
        owner = accounts[9]
    } = {}) {
        const {
            oceanToken,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager
        } = await deployManagers(deployer, owner)

        const escrowAccessSecretStoreTemplate = await EscrowAccessSecretStoreTemplate.new({ from: deployer })
        await escrowAccessSecretStoreTemplate.methods['initialize(address,address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            didRegistry.address,
            accounts[0],
            accounts[0],
            accounts[0],
            { from: deployer }
        )

        return {
            oceanToken,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            escrowAccessSecretStoreTemplate,
            deployer,
            owner
        }
    }

    async function prepareAgreement({
        agreementId = constants.bytes32.one,
        conditionIds = [
            constants.bytes32.one,
            constants.bytes32.two,
            constants.bytes32.three
        ],
        timeLocks = [0, 0, 0],
        timeOuts = [0, 0, 0],
        sender = accounts[0],
        receiver = accounts[1],
        escrowAmount = 10,
        did = constants.did[0]
    } = {}) {
        // construct agreement
        const agreement = {
            did,
            conditionIds,
            timeLocks,
            timeOuts,
            accessConsumer: receiver
        }
        return {
            agreementId,
            agreement
        }
    }

    describe('create agreement', () => {
        it('correct create should get data, agreement & conditions', async () => {
            const {
                didRegistry,
                agreementStoreManager,
                conditionStoreManager,
                templateStoreManager,
                escrowAccessSecretStoreTemplate,
                owner
            } = await setupTest()

            const {
                agreementId,
                agreement
            } = await prepareAgreement()

            await assert.isRejected(
                escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                constants.template.error.templateNotApproved
            )

            // propose and approve template
            const templateId = escrowAccessSecretStoreTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            await assert.isRejected(
                escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                constants.registry.error.didNotRegistered
            )

            // register DID
            await didRegistry.registerAttribute(agreement.did, constants.bytes32.one, constants.registry.url)

            await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))

            const storedAgreementData = await escrowAccessSecretStoreTemplate.getAgreementData(agreementId)
            assert.strictEqual(storedAgreementData.accessConsumer, agreement.accessConsumer)
            assert.strictEqual(storedAgreementData.accessProvider, accounts[0])

            const storedAgreement = await agreementStoreManager.getAgreement(agreementId)
            expect(storedAgreement.conditionIds)
                .to.deep.equal(agreement.conditionIds)
            expect(storedAgreement.lastUpdatedBy)
                .to.equal(templateId)

            agreement.conditionIds.forEach(async (conditionId, i) => {
                let storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(agreement.conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
                expect(storedCondition.timeLock.toNumber()).to.equal(agreement.timeLocks[i])
                expect(storedCondition.timeOut.toNumber()).to.equal(agreement.timeOuts[i])
            })
        })
    })
})
