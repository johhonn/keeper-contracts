package com.oceanprotocol.keeper.contracts;

import io.reactivex.Flowable;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
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
public class OceanMarket extends Contract {
    private static final String BINARY = "0x608060405269021e19e0c9bab2400000600455600060055534801561002357600080fd5b5060405160208061140e833981016040819052905160008054600160a060020a03191633178082559192600160a060020a0392909216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a3600160a060020a03811615156100f657604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601560248201527f546f6b656e2061646472657373206973203078302e0000000000000000000000604482015290519081900360640190fd5b60078054600160a060020a031916600160a060020a038381169190911791829055604080517f718da7ee0000000000000000000000000000000000000000000000000000000081523060048201529051929091169163718da7ee916024808201926020929091908290030181600087803b15801561017357600080fd5b505af1158015610187573d6000803e3d6000fd5b505050506040513d602081101561019d57600080fd5b50505061125f806101af6000396000f3006080604052600436106100fb5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166319a9c2f1811461010057806324d468d81461016b5780632790539f1461019757806337e13cf7146101b457806360ffee42146101c9578063715018a6146101e157806372a22ea3146101f65780637aa1ed581461022057806388a8c598146102385780638da5cb5b146102505780638f32d59b14610281578063c3b6f93914610296578063d634db0a146102ab578063de8f8b3f146102c3578063eef9c27c146102db578063f2fde38b146102f3578063f7d5993514610100578063ff3617f814610314575b600080fd5b34801561010c57600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261015994369492936024939284019190819084018382808284375094975061032f9650505050505050565b60408051918252519081900360200190f35b34801561017757600080fd5b506101836004356103fc565b604080519115158252519081900360200190f35b3480156101a357600080fd5b506101b260043560243561043e565b005b3480156101c057600080fd5b50610183610459565b3480156101d557600080fd5b50610183600435610529565b3480156101ed57600080fd5b506101b2610541565b34801561020257600080fd5b50610183600435600160a060020a03602435166044356064356105ab565b34801561022c57600080fd5b50610183600435610813565b34801561024457600080fd5b50610183600435610a7e565b34801561025c57600080fd5b50610265610a9d565b60408051600160a060020a039092168252519081900360200190f35b34801561028d57600080fd5b50610183610aac565b3480156102a257600080fd5b50610265610abd565b3480156102b757600080fd5b50610159600435610acc565b3480156102cf57600080fd5b50610183600435610ae2565b3480156102e757600080fd5b50610183600435610d59565b3480156102ff57600080fd5b506101b2600160a060020a0360043516610ff9565b34801561032057600080fd5b50610183600435602435611018565b6000816040516020018082805190602001908083835b602083106103645780518252601f199092019160209182019101610345565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b602083106103c75780518252601f1990920191602091820191016103a8565b6001836020036101000a038019825116818451168082178552505050505050905001915050604051809103902090505b919050565b60008060008381526002602081905260409091206001015460a060020a900460ff169081111561042857fe5b1415610436575060016103f7565b506000919050565b610446610aac565b151561045157600080fd5b600555600455565b6000338015156104a1576040805160e560020a62461bcd0281526020600482015260166024820152600080516020611214833981519152604482015290519081900360640190fd5b600654600160a060020a031615610502576040805160e560020a62461bcd02815260206004820152601660248201527f6175746841646472657373206973206e6f742030783000000000000000000000604482015290519081900360640190fd5b6006805473ffffffffffffffffffffffffffffffffffffffff191633179055600191505090565b60009081526001602052604090206002015460ff1690565b610549610aac565b151561055457600080fd5b60008054604051600160a060020a03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a36000805473ffffffffffffffffffffffffffffffffffffffff19169055565b6000338015156105f3576040805160e560020a62461bcd0281526020600482015260166024820152600080516020611214833981519152604482015290519081900360640190fd5b600754604080517f23b872dd000000000000000000000000000000000000000000000000000000008152336004820152306024820152604481018790529051600160a060020a03909216916323b872dd916064808201926020929091908290030181600087803b15801561066657600080fd5b505af115801561067a573d6000803e3d6000fd5b505050506040513d602081101561069057600080fd5b505115156106e8576040805160e560020a62461bcd02815260206004820152601a60248201527f546f6b656e207472616e7366657246726f6d206661696c65642e000000000000604482015290519081900360640190fd5b6040805160c081018252338152600160a060020a0387811660208084019182526000848601818152606086018b905242608087015260a086018a90528c82526002928390529590208451815490851673ffffffffffffffffffffffffffffffffffffffff19918216178255925160018201805491909516931692909217808455945193949193929174ff000000000000000000000000000000000000000019169060a060020a90849081111561079a57fe5b0217905550606082015160028201556080820151600382015560a09091015160049091015560408051858152602081018590528151600160a060020a0388169289927fb84982556d7cb15bbbde57cf4d92e7e35098afd173f6b52783916ffd21f49fab929081900390910190a350600195945050505050565b6000818160008281526002602081905260409091206001015460a060020a900460ff169081111561084057fe5b14610895576040805160e560020a62461bcd02815260206004820152601360248201527f5374617465206973206e6f74204c6f636b656400000000000000000000000000604482015290519081900360640190fd5b600654600160a060020a03163314806108ad57503330145b1515610929576040805160e560020a62461bcd02815260206004820152602560248201527f53656e646572206973206e6f7420616e20617574686f72697a656420636f6e7460448201527f726163742e000000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b600083815260026020818152604080842060018101805474ff0000000000000000000000000000000000000000191660a060020a17908190556007549190940154825160e060020a63a9059cbb028152600160a060020a0395861660048201526024810191909152915193169363a9059cbb93604480840194939192918390030190829087803b1580156109bc57600080fd5b505af11580156109d0573d6000803e3d6000fd5b505050506040513d60208110156109e657600080fd5b50511515610a2c576040805160e560020a62461bcd02815260206004820152601660248201526000805160206111f4833981519152604482015290519081900360640190fd5b600083815260026020526040808220600101549051600160a060020a039091169185917f52b6070d69e63ffe5295e46cfc2a5fb7ad893d5eebc4ace196a8e361fcd576259190a3600191505b50919050565b6000908152600160208190526040909120600201805460ff1916905590565b600054600160a060020a031690565b600054600160a060020a0316331490565b600754600160a060020a031681565b6000908152600160208190526040909120015490565b6000818160008281526002602081905260409091206001015460a060020a900460ff1690811115610b0f57fe5b14610b64576040805160e560020a62461bcd02815260206004820152601360248201527f5374617465206973206e6f74204c6f636b656400000000000000000000000000604482015290519081900360640190fd5b600654600160a060020a0316331480610b7c57503330145b1515610bf8576040805160e560020a62461bcd02815260206004820152602560248201527f53656e646572206973206e6f7420616e20617574686f72697a656420636f6e7460448201527f726163742e000000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b600083815260026020818152604080842060018101805474ff000000000000000000000000000000000000000019167402000000000000000000000000000000000000000017905560075481549190940154825160e060020a63a9059cbb028152600160a060020a0392831660048201526024810191909152915193169363a9059cbb93604480840194939192918390030190829087803b158015610c9c57600080fd5b505af1158015610cb0573d6000803e3d6000fd5b505050506040513d6020811015610cc657600080fd5b50511515610d0c576040805160e560020a62461bcd02815260206004820152601660248201526000805160206111f4833981519152604482015290519081900360640190fd5b600083815260026020526040808220549051600160a060020a039091169185917f2182341bbb7a7eb7e21f6cf41027bb46fb2704e3d38c5164aaa0e4fb9b58c22b9190a350600192915050565b600033801515610da1576040805160e560020a62461bcd0281526020600482015260166024820152600080516020611214833981519152604482015290519081900360640190fd5b6005543360009081526003602052604090205401421015610dfd57600554604080519182525133917f6c22ebb2b672ce34c6cedefd90624f1c5bd0a545a363d8d3d51cf9ecadde7426919081900360200190a260009150610a78565b600454831115610f1857600754600480546040805160e060020a63a9059cbb0281523393810193909352602483019190915251600160a060020a039092169163a9059cbb916044808201926020929091908290030181600087803b158015610e6457600080fd5b505af1158015610e78573d6000803e3d6000fd5b505050506040513d6020811015610e8e57600080fd5b50511515610ed4576040805160e560020a62461bcd02815260206004820152601660248201526000805160206111f4833981519152604482015290519081900360640190fd5b600454604080518581526020810192909252805133927fdbea86bddc407a90443b523318c9dbca9f485b1c5246b03e34d812e726c3c0fa92908290030190a2610fdf565b6007546040805160e060020a63a9059cbb028152336004820152602481018690529051600160a060020a039092169163a9059cbb916044808201926020929091908290030181600087803b158015610f6f57600080fd5b505af1158015610f83573d6000803e3d6000fd5b505050506040513d6020811015610f9957600080fd5b50511515610fdf576040805160e560020a62461bcd02815260206004820152601660248201526000805160206111f4833981519152604482015290519081900360640190fd5b505033600090815260036020526040902042905550600190565b611001610aac565b151561100c57600080fd5b61101581611176565b50565b600033801515611060576040805160e560020a62461bcd0281526020600482015260166024820152600080516020611214833981519152604482015290519081900360640190fd5b600084815260016020526040902054600160a060020a0316156110cd576040805160e560020a62461bcd02815260206004820152601960248201527f4f776e65722061646472657373206973206e6f74203078302e00000000000000604482015290519081900360640190fd5b6040805160608101825233808252602080830187815260008486018181528a825260019384905286822095518654600160a060020a039190911673ffffffffffffffffffffffffffffffffffffffff1990911617865591518584015590516002909401805494151560ff1995861617909416909117909255915186917f7b8c7b505365aa1b7f9ce04295e6da7c743d877f121b9debcf6a8a9d1806ce4691a35060019392505050565b600160a060020a038116151561118b57600080fd5b60008054604051600160a060020a03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a36000805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600546f6b656e207472616e73666572206661696c65642e0000000000000000000053656e6465722061646472657373206973203078302e00000000000000000000a165627a7a72305820945a88482fb63262d22de4e2dd77558a0143eb2d63bbce9f191446bd70bc79090029";

    public static final String FUNC_RENOUNCEOWNERSHIP = "renounceOwnership";

    public static final String FUNC_OWNER = "owner";

    public static final String FUNC_ISOWNER = "isOwner";

    public static final String FUNC_MTOKEN = "mToken";

    public static final String FUNC_TRANSFEROWNERSHIP = "transferOwnership";

    public static final String FUNC_REGISTER = "register";

    public static final String FUNC_SENDPAYMENT = "sendPayment";

    public static final String FUNC_RELEASEPAYMENT = "releasePayment";

    public static final String FUNC_REFUNDPAYMENT = "refundPayment";

    public static final String FUNC_VERIFYPAYMENTRECEIVED = "verifyPaymentReceived";

    public static final String FUNC_REQUESTTOKENS = "requestTokens";

    public static final String FUNC_LIMITTOKENREQUEST = "limitTokenRequest";

    public static final String FUNC_DEACTIVATEASSET = "deactivateAsset";

    public static final String FUNC_ADDAUTHADDRESS = "addAuthAddress";

    public static final String FUNC_GENERATEID = "generateId";

    public static final String FUNC_CHECKASSET = "checkAsset";

    public static final String FUNC_GETASSETPRICE = "getAssetPrice";

    public static final Event ASSETREGISTERED_EVENT = new Event("AssetRegistered", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event FREQUENTTOKENREQUEST_EVENT = new Event("FrequentTokenRequest", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Uint256>() {}));
    ;

    public static final Event LIMITTOKENREQUEST_EVENT = new Event("LimitTokenRequest", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}));
    ;

    public static final Event PAYMENTRECEIVED_EVENT = new Event("PaymentReceived", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Address>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}));
    ;

    public static final Event PAYMENTRELEASED_EVENT = new Event("PaymentReleased", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event PAYMENTREFUNDED_EVENT = new Event("PaymentRefunded", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event OWNERSHIPTRANSFERRED_EVENT = new Event("OwnershipTransferred", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Address>(true) {}));
    ;

    protected static final HashMap<String, String> _addresses;

    static {
        _addresses = new HashMap<String, String>();
        _addresses.put("17", "0x5c2d5f9401d0f34d427185f0d0d8f8faee7e4d82");
        _addresses.put("8995", "0x4711875db36b0d4c97fbde153b9222eb5818cdc9");
        _addresses.put("1539856672111", "0xe92d6bb422774e5b59974844cb2a5d73586c3dbe");
    }

    @Deprecated
    protected OceanMarket(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected OceanMarket(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected OceanMarket(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected OceanMarket(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public RemoteCall<TransactionReceipt> renounceOwnership() {
        final Function function = new Function(
                FUNC_RENOUNCEOWNERSHIP, 
                Arrays.<Type>asList(), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<String> owner() {
        final Function function = new Function(FUNC_OWNER, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteCall<Boolean> isOwner() {
        final Function function = new Function(FUNC_ISOWNER, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<String> mToken() {
        final Function function = new Function(FUNC_MTOKEN, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteCall<TransactionReceipt> transferOwnership(String newOwner) {
        final Function function = new Function(
                FUNC_TRANSFEROWNERSHIP, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(newOwner)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public List<AssetRegisteredEventResponse> getAssetRegisteredEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(ASSETREGISTERED_EVENT, transactionReceipt);
        ArrayList<AssetRegisteredEventResponse> responses = new ArrayList<AssetRegisteredEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AssetRegisteredEventResponse typedResponse = new AssetRegisteredEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._assetId = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._owner = (String) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<AssetRegisteredEventResponse> assetRegisteredEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, AssetRegisteredEventResponse>() {
            @Override
            public AssetRegisteredEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ASSETREGISTERED_EVENT, log);
                AssetRegisteredEventResponse typedResponse = new AssetRegisteredEventResponse();
                typedResponse.log = log;
                typedResponse._assetId = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._owner = (String) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<AssetRegisteredEventResponse> assetRegisteredEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ASSETREGISTERED_EVENT));
        return assetRegisteredEventFlowable(filter);
    }

    public List<FrequentTokenRequestEventResponse> getFrequentTokenRequestEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(FREQUENTTOKENREQUEST_EVENT, transactionReceipt);
        ArrayList<FrequentTokenRequestEventResponse> responses = new ArrayList<FrequentTokenRequestEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            FrequentTokenRequestEventResponse typedResponse = new FrequentTokenRequestEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._requester = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._minPeriod = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<FrequentTokenRequestEventResponse> frequentTokenRequestEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, FrequentTokenRequestEventResponse>() {
            @Override
            public FrequentTokenRequestEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(FREQUENTTOKENREQUEST_EVENT, log);
                FrequentTokenRequestEventResponse typedResponse = new FrequentTokenRequestEventResponse();
                typedResponse.log = log;
                typedResponse._requester = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._minPeriod = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<FrequentTokenRequestEventResponse> frequentTokenRequestEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(FREQUENTTOKENREQUEST_EVENT));
        return frequentTokenRequestEventFlowable(filter);
    }

    public List<LimitTokenRequestEventResponse> getLimitTokenRequestEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(LIMITTOKENREQUEST_EVENT, transactionReceipt);
        ArrayList<LimitTokenRequestEventResponse> responses = new ArrayList<LimitTokenRequestEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            LimitTokenRequestEventResponse typedResponse = new LimitTokenRequestEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._requester = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._amount = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse._maxAmount = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<LimitTokenRequestEventResponse> limitTokenRequestEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, LimitTokenRequestEventResponse>() {
            @Override
            public LimitTokenRequestEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(LIMITTOKENREQUEST_EVENT, log);
                LimitTokenRequestEventResponse typedResponse = new LimitTokenRequestEventResponse();
                typedResponse.log = log;
                typedResponse._requester = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._amount = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse._maxAmount = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<LimitTokenRequestEventResponse> limitTokenRequestEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(LIMITTOKENREQUEST_EVENT));
        return limitTokenRequestEventFlowable(filter);
    }

    public List<PaymentReceivedEventResponse> getPaymentReceivedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(PAYMENTRECEIVED_EVENT, transactionReceipt);
        ArrayList<PaymentReceivedEventResponse> responses = new ArrayList<PaymentReceivedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            PaymentReceivedEventResponse typedResponse = new PaymentReceivedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._paymentId = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._receiver = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse._amount = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse._expire = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<PaymentReceivedEventResponse> paymentReceivedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, PaymentReceivedEventResponse>() {
            @Override
            public PaymentReceivedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(PAYMENTRECEIVED_EVENT, log);
                PaymentReceivedEventResponse typedResponse = new PaymentReceivedEventResponse();
                typedResponse.log = log;
                typedResponse._paymentId = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._receiver = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse._amount = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse._expire = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<PaymentReceivedEventResponse> paymentReceivedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(PAYMENTRECEIVED_EVENT));
        return paymentReceivedEventFlowable(filter);
    }

    public List<PaymentReleasedEventResponse> getPaymentReleasedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(PAYMENTRELEASED_EVENT, transactionReceipt);
        ArrayList<PaymentReleasedEventResponse> responses = new ArrayList<PaymentReleasedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            PaymentReleasedEventResponse typedResponse = new PaymentReleasedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._paymentId = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._receiver = (String) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<PaymentReleasedEventResponse> paymentReleasedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, PaymentReleasedEventResponse>() {
            @Override
            public PaymentReleasedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(PAYMENTRELEASED_EVENT, log);
                PaymentReleasedEventResponse typedResponse = new PaymentReleasedEventResponse();
                typedResponse.log = log;
                typedResponse._paymentId = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._receiver = (String) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<PaymentReleasedEventResponse> paymentReleasedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(PAYMENTRELEASED_EVENT));
        return paymentReleasedEventFlowable(filter);
    }

    public List<PaymentRefundedEventResponse> getPaymentRefundedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(PAYMENTREFUNDED_EVENT, transactionReceipt);
        ArrayList<PaymentRefundedEventResponse> responses = new ArrayList<PaymentRefundedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            PaymentRefundedEventResponse typedResponse = new PaymentRefundedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._paymentId = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._sender = (String) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<PaymentRefundedEventResponse> paymentRefundedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, PaymentRefundedEventResponse>() {
            @Override
            public PaymentRefundedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(PAYMENTREFUNDED_EVENT, log);
                PaymentRefundedEventResponse typedResponse = new PaymentRefundedEventResponse();
                typedResponse.log = log;
                typedResponse._paymentId = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._sender = (String) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<PaymentRefundedEventResponse> paymentRefundedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(PAYMENTREFUNDED_EVENT));
        return paymentRefundedEventFlowable(filter);
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

    public RemoteCall<TransactionReceipt> register(byte[] assetId, BigInteger price) {
        final Function function = new Function(
                FUNC_REGISTER, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(assetId), 
                new org.web3j.abi.datatypes.generated.Uint256(price)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> sendPayment(byte[] _paymentId, String _receiver, BigInteger _amount, BigInteger _expire) {
        final Function function = new Function(
                FUNC_SENDPAYMENT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_paymentId), 
                new org.web3j.abi.datatypes.Address(_receiver), 
                new org.web3j.abi.datatypes.generated.Uint256(_amount), 
                new org.web3j.abi.datatypes.generated.Uint256(_expire)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> releasePayment(byte[] _paymentId) {
        final Function function = new Function(
                FUNC_RELEASEPAYMENT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_paymentId)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> refundPayment(byte[] _paymentId) {
        final Function function = new Function(
                FUNC_REFUNDPAYMENT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_paymentId)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<Boolean> verifyPaymentReceived(byte[] _paymentId) {
        final Function function = new Function(FUNC_VERIFYPAYMENTRECEIVED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_paymentId)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<TransactionReceipt> requestTokens(BigInteger amount) {
        final Function function = new Function(
                FUNC_REQUESTTOKENS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(amount)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> limitTokenRequest(BigInteger _amount, BigInteger _period) {
        final Function function = new Function(
                FUNC_LIMITTOKENREQUEST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_amount), 
                new org.web3j.abi.datatypes.generated.Uint256(_period)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> deactivateAsset(byte[] assetId) {
        final Function function = new Function(
                FUNC_DEACTIVATEASSET, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(assetId)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> addAuthAddress() {
        final Function function = new Function(
                FUNC_ADDAUTHADDRESS, 
                Arrays.<Type>asList(), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<byte[]> generateId(byte[] contents) {
        final Function function = new Function(FUNC_GENERATEID, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.DynamicBytes(contents)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>() {}));
        return executeRemoteCallSingleValueReturn(function, byte[].class);
    }

    public RemoteCall<byte[]> generateId(String contents) {
        final Function function = new Function(FUNC_GENERATEID, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Utf8String(contents)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>() {}));
        return executeRemoteCallSingleValueReturn(function, byte[].class);
    }

    public RemoteCall<Boolean> checkAsset(byte[] assetId) {
        final Function function = new Function(FUNC_CHECKASSET, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(assetId)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<BigInteger> getAssetPrice(byte[] assetId) {
        final Function function = new Function(FUNC_GETASSETPRICE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(assetId)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    @Deprecated
    public static OceanMarket load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new OceanMarket(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static OceanMarket load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new OceanMarket(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static OceanMarket load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new OceanMarket(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static OceanMarket load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new OceanMarket(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<OceanMarket> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider, String _tokenAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddress)));
        return deployRemoteCall(OceanMarket.class, web3j, credentials, contractGasProvider, BINARY, encodedConstructor);
    }

    public static RemoteCall<OceanMarket> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider, String _tokenAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddress)));
        return deployRemoteCall(OceanMarket.class, web3j, transactionManager, contractGasProvider, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<OceanMarket> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit, String _tokenAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddress)));
        return deployRemoteCall(OceanMarket.class, web3j, credentials, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<OceanMarket> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit, String _tokenAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddress)));
        return deployRemoteCall(OceanMarket.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    protected String getStaticDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static String getPreviouslyDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static class AssetRegisteredEventResponse {
        public Log log;

        public byte[] _assetId;

        public String _owner;
    }

    public static class FrequentTokenRequestEventResponse {
        public Log log;

        public String _requester;

        public BigInteger _minPeriod;
    }

    public static class LimitTokenRequestEventResponse {
        public Log log;

        public String _requester;

        public BigInteger _amount;

        public BigInteger _maxAmount;
    }

    public static class PaymentReceivedEventResponse {
        public Log log;

        public byte[] _paymentId;

        public String _receiver;

        public BigInteger _amount;

        public BigInteger _expire;
    }

    public static class PaymentReleasedEventResponse {
        public Log log;

        public byte[] _paymentId;

        public String _receiver;
    }

    public static class PaymentRefundedEventResponse {
        public Log log;

        public byte[] _paymentId;

        public String _sender;
    }

    public static class OwnershipTransferredEventResponse {
        public Log log;

        public String previousOwner;

        public String newOwner;
    }
}
