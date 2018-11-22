package com.oceanprotocol.keeper.contracts;

import io.reactivex.Flowable;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.Callable;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.RemoteCall;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tuples.generated.Tuple3;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

/**
 * <p>Auto generated code.
 * <p><strong>Do not modify!</strong>
 * <p>Please use the <a href="https://docs.web3j.io/command_line.html">web3j command line tools</a>,
 * or the org.web3j.codegen.SolidityFunctionWrapperGenerator in the 
 * <a href="https://github.com/web3j/web3j/tree/master/codegen">codegen module</a> to update.
 *
 * <p>Generated with web3j version 4.0.1.
 */
public class OceanDispute extends Contract {
    private static final String BINARY = "0x608060405234801561001057600080fd5b50604051606080610d0e8339810160408181528251602080850151948301516000805433600160a060020a0319918216178255600280548216600160a060020a03808b16919091179091556001805490921681871617918290557feec9cd5400000000000000000000000000000000000000000000000000000000885295519497969295169363eec9cd54936004808501949193918390030190829087803b1580156100bb57600080fd5b505af11580156100cf573d6000803e3d6000fd5b505050506040513d60208110156100e557600080fd5b505060038054600160a060020a031916600160a060020a038381169190911791829055604080517ffb0878860000000000000000000000000000000000000000000000000000000081523060048201529051929091169163fb087886916024808201926020929091908290030181600087803b15801561016457600080fd5b505af1158015610178573d6000803e3d6000fd5b505050506040513d602081101561018e57600080fd5b5050505050610b6c806101a26000396000f3006080604052600436106100b95763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416632e17922a81146100be5780634ad24e61146100ea578063715018a61461012a5780637b103999146101415780637b2e941e1461017257806380f556051461019c57806383516aea146101b15780638da5cb5b146101c9578063a2756f45146101de578063c8218e3e14610202578063f2fde38b1461021a578063fce1ccca1461023b575b600080fd5b3480156100ca57600080fd5b506100d6600435610250565b604080519115158252519081900360200190f35b3480156100f657600080fd5b5061010260043561026d565b60408051600160a060020a039094168452911515602084015282820152519081900360600190f35b34801561013657600080fd5b5061013f6102ad565b005b34801561014d57600080fd5b50610156610319565b60408051600160a060020a039092168252519081900360200190f35b34801561017e57600080fd5b5061018a600435610328565b60408051918252519081900360200190f35b3480156101a857600080fd5b50610156610521565b3480156101bd57600080fd5b506100d6600435610530565b3480156101d557600080fd5b506101566105c8565b3480156101ea57600080fd5b506100d6600435600160a060020a03602435166105d7565b34801561020e57600080fd5b506100d66004356107ab565b34801561022657600080fd5b5061013f600160a060020a0360043516610a91565b34801561024757600080fd5b50610156610ab4565b600090815260046020526040902054600160a060020a0316151590565b60046020526000908152604090208054600190910154600160a060020a0382169174010000000000000000000000000000000000000000900460ff169083565b600054600160a060020a031633146102c457600080fd5b60008054604051600160a060020a03909116917ff8df31144d9c2f0f6b59d69b8b98abd5459d07f2742c4df920b25aae33c6482091a26000805473ffffffffffffffffffffffffffffffffffffffff19169055565b600254600160a060020a031681565b600154604080517fdb14195f0000000000000000000000000000000000000000000000000000000081526004810184905290516000928392600160a060020a039091169163db14195f91602480820192869290919082900301818387803b15801561039257600080fd5b505af11580156103a6573d6000803e3d6000fd5b5050600254604080517f43cffefe00000000000000000000000000000000000000000000000000000000815260048101889052602481018290526000604482018190529151600160a060020a0390931694506343cffefe9350608480820193602093909283900390910190829087803b15801561042257600080fd5b505af1158015610436573d6000803e3d6000fd5b505050506040513d602081101561044c57600080fd5b50516040805160608101825233808252600060208084018281528486018781528a845260048352928690209451855491511515740100000000000000000000000000000000000000000274ff000000000000000000000000000000000000000019600160a060020a0390921673ffffffffffffffffffffffffffffffffffffffff199093169290921716178455905160019093019290925582518481529251939450869390927fe9fac214985b016bdbd1a8198959f85969d3898a2047fefc18b65b36ee282c4d92908290030190a392915050565b600154600160a060020a031681565b600254604080517f77609a41000000000000000000000000000000000000000000000000000000008152600481018490529051600092600160a060020a0316916377609a4191602480830192602092919082900301818787803b15801561059657600080fd5b505af11580156105aa573d6000803e3d6000fd5b505050506040513d60208110156105c057600080fd5b505192915050565b600054600160a060020a031681565b600080548190600160a060020a031633146105f157600080fd5b5060008381526004602081815260408084206001015460035482517f88d21ff300000000000000000000000000000000000000000000000000000000815294850182905291519094600160a060020a03909216936388d21ff3936024808301949193928390030190829087803b15801561066a57600080fd5b505af115801561067e573d6000803e3d6000fd5b505050506040513d602081101561069457600080fd5b5051151560011461070657604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601360248201527f706f6c6c20646f6573206e6f7420657869737400000000000000000000000000604482015290519081900360640190fd5b600354604080517f9b7f202300000000000000000000000000000000000000000000000000000000815260048101849052600160a060020a03868116602483015291519190921691639b7f20239160448083019260209291908290030181600087803b15801561077557600080fd5b505af1158015610789573d6000803e3d6000fd5b505050506040513d602081101561079f57600080fd5b50600195945050505050565b600254604080517f77609a4100000000000000000000000000000000000000000000000000000000815260048101849052905160009283928392600160a060020a03909216916377609a419160248082019260209290919082900301818787803b15801561081857600080fd5b505af115801561082c573d6000803e3d6000fd5b505050506040513d602081101561084257600080fd5b505115156108535760009250610a8a565b600254604080517f8a59eb56000000000000000000000000000000000000000000000000000000008152600481018790529051600160a060020a0390921691638a59eb569160248082019260009290919082900301818387803b1580156108b957600080fd5b505af11580156108cd573d6000803e3d6000fd5b5050506000858152600460208181526040808420805474ff000000000000000000000000000000000000000019167401000000000000000000000000000000000000000017905560025481517f01a5e3fe0000000000000000000000000000000000000000000000000000000081529384018a90529051939650869550600160a060020a031693506301a5e3fe9260248084019382900301818787803b15801561097657600080fd5b505af115801561098a573d6000803e3d6000fd5b505050506040513d60208110156109a057600080fd5b505115156109b0575060016109b5565b600191505b600154604080517f7082613800000000000000000000000000000000000000000000000000000000815260048101879052841515602482015283151560448201529051600160a060020a039092169163708261389160648082019260009290919082900301818387803b158015610a2b57600080fd5b505af1158015610a3f573d6000803e3d6000fd5b5050604080518515158152841515602082015281518894503393507f117b6bc39b12f74389a9a1a201dad37fd55152517094e63a364e4c4e9948d709929181900390910190a3600192505b5050919050565b600054600160a060020a03163314610aa857600080fd5b610ab181610ac3565b50565b600354600160a060020a031681565b600160a060020a0381161515610ad857600080fd5b60008054604051600160a060020a03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a36000805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600a165627a7a72305820c9569b3757ccbb53334b03fe7cbf624e4673741d987b92e4fd43a3217a3380e30029";

    public static final String FUNC_MDISPUTES = "mDisputes";

    public static final String FUNC_RENOUNCEOWNERSHIP = "renounceOwnership";

    public static final String FUNC_REGISTRY = "registry";

    public static final String FUNC_MARKET = "market";

    public static final String FUNC_OWNER = "owner";

    public static final String FUNC_TRANSFEROWNERSHIP = "transferOwnership";

    public static final String FUNC_VOTING = "voting";

    public static final String FUNC_DISPUTEEXIST = "disputeExist";

    public static final String FUNC_INITIATEDISPUTE = "initiateDispute";

    public static final String FUNC_ADDAUTHORIZEDVOTER = "addAuthorizedVoter";

    public static final String FUNC_VOTINGENDED = "votingEnded";

    public static final String FUNC_RESOLVEDISPUTE = "resolveDispute";

    public static final Event _DISPUTEINITIATED_EVENT = new Event("_DisputeInitiated", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Bytes32>(true) {}, new TypeReference<Uint256>() {}));
    ;

    public static final Event _DISPUTERESOLVED_EVENT = new Event("_DisputeResolved", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Bytes32>(true) {}, new TypeReference<Bool>() {}, new TypeReference<Bool>() {}));
    ;

    public static final Event OWNERSHIPRENOUNCED_EVENT = new Event("OwnershipRenounced", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}));
    ;

    public static final Event OWNERSHIPTRANSFERRED_EVENT = new Event("OwnershipTransferred", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Address>(true) {}));
    ;

    protected static final HashMap<String, String> _addresses;

    static {
        _addresses = new HashMap<String, String>();
        _addresses.put("1539856672111", "0x1805ed874e1994fc11a37bb365228038dbf125f8");
    }

    @Deprecated
    protected OceanDispute(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected OceanDispute(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected OceanDispute(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected OceanDispute(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public RemoteCall<Tuple3<String, Boolean, BigInteger>> mDisputes(byte[] param0) {
        final Function function = new Function(FUNC_MDISPUTES, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}, new TypeReference<Bool>() {}, new TypeReference<Uint256>() {}));
        return new RemoteCall<Tuple3<String, Boolean, BigInteger>>(
                new Callable<Tuple3<String, Boolean, BigInteger>>() {
                    @Override
                    public Tuple3<String, Boolean, BigInteger> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple3<String, Boolean, BigInteger>(
                                (String) results.get(0).getValue(), 
                                (Boolean) results.get(1).getValue(), 
                                (BigInteger) results.get(2).getValue());
                    }
                });
    }

    public RemoteCall<TransactionReceipt> renounceOwnership() {
        final Function function = new Function(
                FUNC_RENOUNCEOWNERSHIP, 
                Arrays.<Type>asList(), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<String> registry() {
        final Function function = new Function(FUNC_REGISTRY, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteCall<String> market() {
        final Function function = new Function(FUNC_MARKET, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteCall<String> owner() {
        final Function function = new Function(FUNC_OWNER, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteCall<TransactionReceipt> transferOwnership(String _newOwner) {
        final Function function = new Function(
                FUNC_TRANSFEROWNERSHIP, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_newOwner)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<String> voting() {
        final Function function = new Function(FUNC_VOTING, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public List<_DisputeInitiatedEventResponse> get_DisputeInitiatedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_DISPUTEINITIATED_EVENT, transactionReceipt);
        ArrayList<_DisputeInitiatedEventResponse> responses = new ArrayList<_DisputeInitiatedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _DisputeInitiatedEventResponse typedResponse = new _DisputeInitiatedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._complainant = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._id = (byte[]) eventValues.getIndexedValues().get(1).getValue();
            typedResponse._pollID = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_DisputeInitiatedEventResponse> _DisputeInitiatedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _DisputeInitiatedEventResponse>() {
            @Override
            public _DisputeInitiatedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_DISPUTEINITIATED_EVENT, log);
                _DisputeInitiatedEventResponse typedResponse = new _DisputeInitiatedEventResponse();
                typedResponse.log = log;
                typedResponse._complainant = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._id = (byte[]) eventValues.getIndexedValues().get(1).getValue();
                typedResponse._pollID = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_DisputeInitiatedEventResponse> _DisputeInitiatedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_DISPUTEINITIATED_EVENT));
        return _DisputeInitiatedEventFlowable(filter);
    }

    public List<_DisputeResolvedEventResponse> get_DisputeResolvedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_DISPUTERESOLVED_EVENT, transactionReceipt);
        ArrayList<_DisputeResolvedEventResponse> responses = new ArrayList<_DisputeResolvedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _DisputeResolvedEventResponse typedResponse = new _DisputeResolvedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._complainant = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._id = (byte[]) eventValues.getIndexedValues().get(1).getValue();
            typedResponse._release = (Boolean) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse._refund = (Boolean) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_DisputeResolvedEventResponse> _DisputeResolvedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _DisputeResolvedEventResponse>() {
            @Override
            public _DisputeResolvedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_DISPUTERESOLVED_EVENT, log);
                _DisputeResolvedEventResponse typedResponse = new _DisputeResolvedEventResponse();
                typedResponse.log = log;
                typedResponse._complainant = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._id = (byte[]) eventValues.getIndexedValues().get(1).getValue();
                typedResponse._release = (Boolean) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse._refund = (Boolean) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_DisputeResolvedEventResponse> _DisputeResolvedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_DISPUTERESOLVED_EVENT));
        return _DisputeResolvedEventFlowable(filter);
    }

    public List<OwnershipRenouncedEventResponse> getOwnershipRenouncedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(OWNERSHIPRENOUNCED_EVENT, transactionReceipt);
        ArrayList<OwnershipRenouncedEventResponse> responses = new ArrayList<OwnershipRenouncedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            OwnershipRenouncedEventResponse typedResponse = new OwnershipRenouncedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.previousOwner = (String) eventValues.getIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<OwnershipRenouncedEventResponse> ownershipRenouncedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, OwnershipRenouncedEventResponse>() {
            @Override
            public OwnershipRenouncedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(OWNERSHIPRENOUNCED_EVENT, log);
                OwnershipRenouncedEventResponse typedResponse = new OwnershipRenouncedEventResponse();
                typedResponse.log = log;
                typedResponse.previousOwner = (String) eventValues.getIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<OwnershipRenouncedEventResponse> ownershipRenouncedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(OWNERSHIPRENOUNCED_EVENT));
        return ownershipRenouncedEventFlowable(filter);
    }

    public List<OwnershipTransferredEventResponse> getOwnershipTransferredEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(OWNERSHIPTRANSFERRED_EVENT, transactionReceipt);
        ArrayList<OwnershipTransferredEventResponse> responses = new ArrayList<OwnershipTransferredEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            OwnershipTransferredEventResponse typedResponse = new OwnershipTransferredEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.previousOwner = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.newOwner = (String) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<OwnershipTransferredEventResponse> ownershipTransferredEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, OwnershipTransferredEventResponse>() {
            @Override
            public OwnershipTransferredEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(OWNERSHIPTRANSFERRED_EVENT, log);
                OwnershipTransferredEventResponse typedResponse = new OwnershipTransferredEventResponse();
                typedResponse.log = log;
                typedResponse.previousOwner = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.newOwner = (String) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<OwnershipTransferredEventResponse> ownershipTransferredEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(OWNERSHIPTRANSFERRED_EVENT));
        return ownershipTransferredEventFlowable(filter);
    }

    public RemoteCall<Boolean> disputeExist(byte[] id) {
        final Function function = new Function(FUNC_DISPUTEEXIST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<TransactionReceipt> initiateDispute(byte[] id) {
        final Function function = new Function(
                FUNC_INITIATEDISPUTE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> addAuthorizedVoter(byte[] id, String voter) {
        final Function function = new Function(
                FUNC_ADDAUTHORIZEDVOTER, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id), 
                new org.web3j.abi.datatypes.Address(voter)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<Boolean> votingEnded(byte[] id) {
        final Function function = new Function(FUNC_VOTINGENDED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<TransactionReceipt> resolveDispute(byte[] id) {
        final Function function = new Function(
                FUNC_RESOLVEDISPUTE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    @Deprecated
    public static OceanDispute load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new OceanDispute(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static OceanDispute load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new OceanDispute(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static OceanDispute load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new OceanDispute(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static OceanDispute load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new OceanDispute(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<OceanDispute> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider, String _marketAddr, String _registryAddress, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddr), 
                new org.web3j.abi.datatypes.Address(_registryAddress), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(OceanDispute.class, web3j, credentials, contractGasProvider, BINARY, encodedConstructor);
    }

    public static RemoteCall<OceanDispute> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider, String _marketAddr, String _registryAddress, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddr), 
                new org.web3j.abi.datatypes.Address(_registryAddress), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(OceanDispute.class, web3j, transactionManager, contractGasProvider, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<OceanDispute> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit, String _marketAddr, String _registryAddress, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddr), 
                new org.web3j.abi.datatypes.Address(_registryAddress), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(OceanDispute.class, web3j, credentials, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<OceanDispute> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit, String _marketAddr, String _registryAddress, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddr), 
                new org.web3j.abi.datatypes.Address(_registryAddress), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(OceanDispute.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    protected String getStaticDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static String getPreviouslyDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static class _DisputeInitiatedEventResponse {
        public Log log;

        public String _complainant;

        public byte[] _id;

        public BigInteger _pollID;
    }

    public static class _DisputeResolvedEventResponse {
        public Log log;

        public String _complainant;

        public byte[] _id;

        public Boolean _release;

        public Boolean _refund;
    }

    public static class OwnershipRenouncedEventResponse {
        public Log log;

        public String previousOwner;
    }

    public static class OwnershipTransferredEventResponse {
        public Log log;

        public String previousOwner;

        public String newOwner;
    }
}
