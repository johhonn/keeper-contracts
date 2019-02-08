let constants = {
    keeper: {
        nodeUrl: `http://localhost:${process.env.ETHEREUM_RPC_PORT || '8545'}`
    },
    address: {
        zero: '0x0000000000000000000000000000000000000000',
        dummy: '0xeE9300b7961e0a01d9f0adb863C7A227A07AaD75',
        error: {
            invalidAddress0x0: 'Invalid address: 0x0'
        }
    },
    bytes32: {
        zero: '0x0000000000000000000000000000000000000000000000000000000000000000',
        one: '0x0000000000000000000000000000000000000000000000000000000000000001'
    },
    condition: {
        id: {
            error: {
                idAlreadyExists: 'Id already exists'
            }
        },
        state: {
            uninitialized: 0,
            unfulfilled: 1,
            fulfilled: 2,
            aborted: 3,
            error: {
                invalidStateTransition: 'Invalid state transition',
                conditionAlreadyCreated: 'Condition already created'
            }
        },
        epoch: {
            error: {
                isTimeLocked: 'TimeLock is not over yet'
            }
        },
        hashlock: {
            string: {
                preimage: 'oceanprotocol',
                keccak: '0x59121d7fa7841527fcd5769dfc19998cbc47fdb534f6355db06ce6f563e80af4'
            },
            uint: {
                preimage: 420,
                keccak: '0x2cd2b35a7ca7a66f45b347c27a3912232124ea6e1669d4ef7cf850571a10e7ea'
            },
            bytes32: {
                preimage: '0x0100000000000000000000000000000000000000000000000000000000000000',
                keccak: '0x48078cfed56339ea54962e72c37c7f588fc4f8e5bc173827ba75cb10a63a96a5'
            }
        },
        sign: {
            bytes32: {
                message: '0x225cded94ed000b85624acb3090384c7676fe920939ba66d994b7fd54459b85a',
                signature: '0x89e0243d7bd929e499b18640565a532bebe490cbe7cfec432462e47e702852' +
                    '284e6cc334870e8be586388af53b524ca6773de977270940a0239f06524fcd25891b',
                publicKey: '0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e'
            },
            error: {
                couldNotRecoverSignature: 'Could not recover signature'
            }
        },
        reward: {
            escrowReward: {
                error: {
                    lockConditionNeedsToBeFulfilled: 'LockCondition needs to be Fulfilled'
                }
            }
        }
    },
    template: {
        error: {
            templateMustExist: 'Template must exist'
        }
    },
    acl: {
        error: {
            invalidCreateConditionRole: 'Invalid CreateConditionRole',
            invalidUpdateRole: 'Invalid UpdateRole'
        }
    },
    did: [
        '0x0000000000000000000000000000000000000000000000000000000001111111',
        '0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
    ]
}

module.exports = constants
