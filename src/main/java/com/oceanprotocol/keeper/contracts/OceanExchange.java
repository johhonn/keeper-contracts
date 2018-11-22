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
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.RemoteCall;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tuples.generated.Tuple4;
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
public class OceanExchange extends Contract {
    private static final String BINARY = "0x608060405234801561001057600080fd5b50604051602080610eba8339810160405251600160a060020a038116151561009957604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601560248201527f546f6b656e2061646472657373206973203078302e0000000000000000000000604482015290519081900360640190fd5b60058054600160a060020a031916600160a060020a0392909216919091179055610df2806100c86000396000f3006080604052600436106100d95763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416627975e781146100f4578063104e99291461011e57806315015022146101455780632d11c58a146101805780633a98ef3914610195578063657aa489146101aa57806393ec7c3d146101c45780639cd441da146101d2578063aa852f56146101e0578063b03a9a05146101fe578063f04da65b14610213578063f16673a414610234578063f88bf15a14610249578063f9935f8f1461026a578063fc0c546a14610275575b3415156100e557600080fd5b6100f233333460016102a6565b005b34801561010057600080fd5b506100f2600435602435604435600160a060020a0360643516610457565b34801561012a57600080fd5b506101336104bb565b60408051918252519081900360200190f35b34801561015157600080fd5b5061015a6104c1565b604080519485526020850193909352838301919091526060830152519081900360800190f35b34801561018c57600080fd5b506101336104d3565b3480156101a157600080fd5b506101336104d9565b6100f2600435602435600160a060020a03604435166104df565b6100f2600435602435610542565b6100f2600435602435610578565b3480156101ec57600080fd5b506100f2600435602435604435610798565b34801561020a57600080fd5b506101336107ca565b34801561021f57600080fd5b50610133600160a060020a03600435166107d0565b34801561024057600080fd5b506101336107eb565b34801561025557600080fd5b506100f26004356024356044356064356107f1565b6100f2600435610a3d565b34801561028157600080fd5b5061028a610b6a565b60408051600160a060020a039092168252519081900360200190f35b6000806000806000806002541180156102c157506000600354115b15156102cc57600080fd5b6102de876101f463ffffffff610b7916565b6000549095506102f4908863ffffffff610b9016565b9350610306848663ffffffff610b9d16565b60025490935061031c908463ffffffff610b7916565b600154909250610332908363ffffffff610b9d16565b905085811015801561034657506001548111155b151561035157600080fd5b6000849055600182905561036b848363ffffffff610baf16565b60025560405181908890600160a060020a038c16907fc2d4406fadcd716ab4a11dd67875462a28108de6a8911747c9ca93c8c3c32c2290600090a4600554604080517fa9059cbb000000000000000000000000000000000000000000000000000000008152600160a060020a038b81166004830152602482018590529151919092169163a9059cbb9160448083019260209291908290030181600087803b15801561041557600080fd5b505af1158015610429573d6000803e3d6000fd5b505050506040513d602081101561043f57600080fd5b5051151561044c57600080fd5b505050505050505050565b6000841180156104675750600083115b801561047257508142105b151561047d57600080fd5b600160a060020a0381161580159061049e5750600160a060020a0381163014155b15156104a957600080fd5b6104b533828686610bd8565b50505050565b60015481565b60005460015460025460035490919293565b6101f481565b60035481565b6000341180156104ef5750600083115b80156104fa57508142105b151561050557600080fd5b600160a060020a038116158015906105265750600160a060020a0381163014155b151561053157600080fd5b61053d338234866102a6565b505050565b6000341180156105525750600082115b801561055d57508042105b151561056857600080fd5b610574333334856102a6565b5050565b600080600080600060025411801561059257506000600354115b151561059d57600080fd5b6000341180156105ad5750600086115b80156105b857508442105b15156105c357600080fd5b6003546000546105d89163ffffffff610b7916565b9350348411156105e757600080fd5b6105f7348563ffffffff610b7916565b92506000831161060657600080fd5b60035460015461061b9163ffffffff610b7916565b915061062d838363ffffffff610baf16565b33600090815260046020526040902054909150610650908463ffffffff610b9016565b33600090815260046020526040902055600354610673908463ffffffff610b9016565b600355600054610689903463ffffffff610b9016565b60005560015461069f908263ffffffff610b9016565b60018190556000546106b69163ffffffff610baf16565b600255604051839033907fbb37879e252460856212dc4e8c6edf174e473df9423e3a7feccd21f8c28d587a90600090a3600554604080517f23b872dd000000000000000000000000000000000000000000000000000000008152336004820152306024820152604481018490529051600160a060020a03909216916323b872dd916064808201926020929091908290030181600087803b15801561075957600080fd5b505af115801561076d573d6000803e3d6000fd5b505050506040513d602081101561078357600080fd5b5051151561079057600080fd5b505050505050565b6000831180156107a85750600082115b80156107b357508042105b15156107be57600080fd5b61053d33338585610bd8565b60025481565b600160a060020a031660009081526004602052604090205490565b60005481565b600080600080600060025411801561080b57506000600354115b151561081657600080fd5b60008811801561082557508442105b151561083057600080fd5b33600090815260046020526040902054610850908963ffffffff610b9d16565b3360009081526004602052604081209190915560035490546108779163ffffffff610b7916565b9350610890600354600154610b7990919063ffffffff16565b92506108a2848963ffffffff610baf16565b91506108b4838963ffffffff610baf16565b90508682101580156108c65750858110155b15156108d157600080fd5b6003546108e4908963ffffffff610b9d16565b6003556000546108fa908363ffffffff610b9d16565b600055600154610910908263ffffffff610b9d16565b600155600354151561092657600060025561093f565b60015460005461093b9163ffffffff610baf16565b6002555b604051889033907fdfdd120ded9b7afc0c23dd5310e93aaa3e1c3b9f75af9b805fab3030842439f290600090a3600554604080517fa9059cbb000000000000000000000000000000000000000000000000000000008152336004820152602481018490529051600160a060020a039092169163a9059cbb916044808201926020929091908290030181600087803b1580156109d957600080fd5b505af11580156109ed573d6000803e3d6000fd5b505050506040513d6020811015610a0357600080fd5b50511515610a1057600080fd5b604051339083156108fc029084906000818181858888f1935050505015801561044c573d6000803e3d6000fd5b600254158015610a4d5750600354155b1515610a5857600080fd5b6127103410158015610a6c57506127108110155b8015610a805750674563918244f400003411155b1515610a8b57600080fd5b3460008190556001829055610aa6908263ffffffff610baf16565b6002553360008181526004602081815260408084206103e89081905560035560055481517f23b872dd000000000000000000000000000000000000000000000000000000008152938401959095523060248401526044830186905251600160a060020a03909416936323b872dd936064808501948390030190829087803b158015610b3057600080fd5b505af1158015610b44573d6000803e3d6000fd5b505050506040513d6020811015610b5a57600080fd5b50511515610b6757600080fd5b50565b600554600160a060020a031681565b60008183811515610b8657fe5b0490505b92915050565b81810182811015610b8a57fe5b600082821115610ba957fe5b50900390565b6000821515610bc057506000610b8a565b50818102818382811515610bd057fe5b0414610b8a57fe5b600080600080600080600254118015610bf357506000600354115b1515610bfe57600080fd5b610c10876101f463ffffffff610b7916565b600154909550610c26908863ffffffff610b9016565b9350610c38848663ffffffff610b9d16565b600254909350610c4e908463ffffffff610b7916565b600054909250610c64908363ffffffff610b9d16565b9050858110158015610c7857506000548111155b1515610c8357600080fd5b60018490556000829055610c9d828563ffffffff610baf16565b60025560405181908890600160a060020a038c16907f7c27598163cc48e7b019ece0015ee6e3ea794251b47ae935d916f0f1cf5ac16d90600090a4600554604080517f23b872dd000000000000000000000000000000000000000000000000000000008152600160a060020a038c81166004830152306024830152604482018b9052915191909216916323b872dd9160648083019260209291908290030181600087803b158015610d4d57600080fd5b505af1158015610d61573d6000803e3d6000fd5b505050506040513d6020811015610d7757600080fd5b50511515610d8457600080fd5b604051600160a060020a0389169082156108fc029083906000818181858888f19350505050158015610dba573d6000803e3d6000fd5b505050505050505050505600a165627a7a723058200a8b82b8f31520f7f0573bc3272e35553f694d1856281d07a35eca4203e2b1210029";

    public static final String FUNC_TOKENPOOL = "tokenPool";

    public static final String FUNC_FEE_RATE = "FEE_RATE";

    public static final String FUNC_TOTALSHARES = "totalShares";

    public static final String FUNC_INVARIANT = "invariant";

    public static final String FUNC_ETHPOOL = "ethPool";

    public static final String FUNC_TOKEN = "token";

    public static final String FUNC_EXCHANGESTATUS = "exchangeStatus";

    public static final String FUNC_INITIALIZEEXCHANGE = "initializeExchange";

    public static final String FUNC_ETHTOTOKENSWAP = "ethToTokenSwap";

    public static final String FUNC_ETHTOTOKENPAYMENT = "ethToTokenPayment";

    public static final String FUNC_TOKENTOETHSWAP = "tokenToEthSwap";

    public static final String FUNC_TOKENTOETHPAYMENT = "tokenToEthPayment";

    public static final String FUNC_ADDLIQUIDITY = "addLiquidity";

    public static final String FUNC_REMOVELIQUIDITY = "removeLiquidity";

    public static final String FUNC_GETSHARES = "getShares";

    public static final Event ETHTOTOKENPURCHASE_EVENT = new Event("EthToTokenPurchase", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Uint256>(true) {}, new TypeReference<Uint256>(true) {}));
    ;

    public static final Event TOKENTOETHPURCHASE_EVENT = new Event("TokenToEthPurchase", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Uint256>(true) {}, new TypeReference<Uint256>(true) {}));
    ;

    public static final Event ADDLIQUIDITY_EVENT = new Event("AddLiquidity", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Uint256>(true) {}));
    ;

    public static final Event REMOVELIQUIDITY_EVENT = new Event("RemoveLiquidity", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Uint256>(true) {}));
    ;

    protected static final HashMap<String, String> _addresses;

    static {
        _addresses = new HashMap<String, String>();
        _addresses.put("1539856672111", "0xbe34398a771e16c8e1442876709523c44795dbdd");
    }

    @Deprecated
    protected OceanExchange(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected OceanExchange(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected OceanExchange(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected OceanExchange(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public RemoteCall<BigInteger> tokenPool() {
        final Function function = new Function(FUNC_TOKENPOOL, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public RemoteCall<BigInteger> FEE_RATE() {
        final Function function = new Function(FUNC_FEE_RATE, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public RemoteCall<BigInteger> totalShares() {
        final Function function = new Function(FUNC_TOTALSHARES, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public RemoteCall<BigInteger> invariant() {
        final Function function = new Function(FUNC_INVARIANT, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public RemoteCall<BigInteger> ethPool() {
        final Function function = new Function(FUNC_ETHPOOL, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public RemoteCall<String> token() {
        final Function function = new Function(FUNC_TOKEN, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public List<EthToTokenPurchaseEventResponse> getEthToTokenPurchaseEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(ETHTOTOKENPURCHASE_EVENT, transactionReceipt);
        ArrayList<EthToTokenPurchaseEventResponse> responses = new ArrayList<EthToTokenPurchaseEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            EthToTokenPurchaseEventResponse typedResponse = new EthToTokenPurchaseEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.buyer = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.ethIn = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.tokensOut = (BigInteger) eventValues.getIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<EthToTokenPurchaseEventResponse> ethToTokenPurchaseEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, EthToTokenPurchaseEventResponse>() {
            @Override
            public EthToTokenPurchaseEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ETHTOTOKENPURCHASE_EVENT, log);
                EthToTokenPurchaseEventResponse typedResponse = new EthToTokenPurchaseEventResponse();
                typedResponse.log = log;
                typedResponse.buyer = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.ethIn = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.tokensOut = (BigInteger) eventValues.getIndexedValues().get(2).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<EthToTokenPurchaseEventResponse> ethToTokenPurchaseEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ETHTOTOKENPURCHASE_EVENT));
        return ethToTokenPurchaseEventFlowable(filter);
    }

    public List<TokenToEthPurchaseEventResponse> getTokenToEthPurchaseEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(TOKENTOETHPURCHASE_EVENT, transactionReceipt);
        ArrayList<TokenToEthPurchaseEventResponse> responses = new ArrayList<TokenToEthPurchaseEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            TokenToEthPurchaseEventResponse typedResponse = new TokenToEthPurchaseEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.buyer = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.tokensIn = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.ethOut = (BigInteger) eventValues.getIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<TokenToEthPurchaseEventResponse> tokenToEthPurchaseEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, TokenToEthPurchaseEventResponse>() {
            @Override
            public TokenToEthPurchaseEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(TOKENTOETHPURCHASE_EVENT, log);
                TokenToEthPurchaseEventResponse typedResponse = new TokenToEthPurchaseEventResponse();
                typedResponse.log = log;
                typedResponse.buyer = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.tokensIn = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.ethOut = (BigInteger) eventValues.getIndexedValues().get(2).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<TokenToEthPurchaseEventResponse> tokenToEthPurchaseEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(TOKENTOETHPURCHASE_EVENT));
        return tokenToEthPurchaseEventFlowable(filter);
    }

    public List<AddLiquidityEventResponse> getAddLiquidityEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(ADDLIQUIDITY_EVENT, transactionReceipt);
        ArrayList<AddLiquidityEventResponse> responses = new ArrayList<AddLiquidityEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AddLiquidityEventResponse typedResponse = new AddLiquidityEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.liquidityProvider = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.sharesPurchased = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<AddLiquidityEventResponse> addLiquidityEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, AddLiquidityEventResponse>() {
            @Override
            public AddLiquidityEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ADDLIQUIDITY_EVENT, log);
                AddLiquidityEventResponse typedResponse = new AddLiquidityEventResponse();
                typedResponse.log = log;
                typedResponse.liquidityProvider = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.sharesPurchased = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<AddLiquidityEventResponse> addLiquidityEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ADDLIQUIDITY_EVENT));
        return addLiquidityEventFlowable(filter);
    }

    public List<RemoveLiquidityEventResponse> getRemoveLiquidityEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(REMOVELIQUIDITY_EVENT, transactionReceipt);
        ArrayList<RemoveLiquidityEventResponse> responses = new ArrayList<RemoveLiquidityEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            RemoveLiquidityEventResponse typedResponse = new RemoveLiquidityEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.liquidityProvider = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.sharesBurned = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<RemoveLiquidityEventResponse> removeLiquidityEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, RemoveLiquidityEventResponse>() {
            @Override
            public RemoveLiquidityEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(REMOVELIQUIDITY_EVENT, log);
                RemoveLiquidityEventResponse typedResponse = new RemoveLiquidityEventResponse();
                typedResponse.log = log;
                typedResponse.liquidityProvider = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.sharesBurned = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<RemoveLiquidityEventResponse> removeLiquidityEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(REMOVELIQUIDITY_EVENT));
        return removeLiquidityEventFlowable(filter);
    }

    public RemoteCall<Tuple4<BigInteger, BigInteger, BigInteger, BigInteger>> exchangeStatus() {
        final Function function = new Function(FUNC_EXCHANGESTATUS, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}));
        return new RemoteCall<Tuple4<BigInteger, BigInteger, BigInteger, BigInteger>>(
                new Callable<Tuple4<BigInteger, BigInteger, BigInteger, BigInteger>>() {
                    @Override
                    public Tuple4<BigInteger, BigInteger, BigInteger, BigInteger> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple4<BigInteger, BigInteger, BigInteger, BigInteger>(
                                (BigInteger) results.get(0).getValue(), 
                                (BigInteger) results.get(1).getValue(), 
                                (BigInteger) results.get(2).getValue(), 
                                (BigInteger) results.get(3).getValue());
                    }
                });
    }

    public RemoteCall<TransactionReceipt> initializeExchange(BigInteger _tokenAmount, BigInteger weiValue) {
        final Function function = new Function(
                FUNC_INITIALIZEEXCHANGE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_tokenAmount)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function, weiValue);
    }

    public RemoteCall<TransactionReceipt> ethToTokenSwap(BigInteger _minTokens, BigInteger _timeout, BigInteger weiValue) {
        final Function function = new Function(
                FUNC_ETHTOTOKENSWAP, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_minTokens), 
                new org.web3j.abi.datatypes.generated.Uint256(_timeout)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function, weiValue);
    }

    public RemoteCall<TransactionReceipt> ethToTokenPayment(BigInteger _minTokens, BigInteger _timeout, String _recipient, BigInteger weiValue) {
        final Function function = new Function(
                FUNC_ETHTOTOKENPAYMENT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_minTokens), 
                new org.web3j.abi.datatypes.generated.Uint256(_timeout), 
                new org.web3j.abi.datatypes.Address(_recipient)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function, weiValue);
    }

    public RemoteCall<TransactionReceipt> tokenToEthSwap(BigInteger _tokenAmount, BigInteger _minEth, BigInteger _timeout) {
        final Function function = new Function(
                FUNC_TOKENTOETHSWAP, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_tokenAmount), 
                new org.web3j.abi.datatypes.generated.Uint256(_minEth), 
                new org.web3j.abi.datatypes.generated.Uint256(_timeout)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> tokenToEthPayment(BigInteger _tokenAmount, BigInteger _minEth, BigInteger _timeout, String _recipient) {
        final Function function = new Function(
                FUNC_TOKENTOETHPAYMENT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_tokenAmount), 
                new org.web3j.abi.datatypes.generated.Uint256(_minEth), 
                new org.web3j.abi.datatypes.generated.Uint256(_timeout), 
                new org.web3j.abi.datatypes.Address(_recipient)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> addLiquidity(BigInteger min_amount, BigInteger _timeout, BigInteger weiValue) {
        final Function function = new Function(
                FUNC_ADDLIQUIDITY, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(min_amount), 
                new org.web3j.abi.datatypes.generated.Uint256(_timeout)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function, weiValue);
    }

    public RemoteCall<TransactionReceipt> removeLiquidity(BigInteger _sharesBurned, BigInteger _minEth, BigInteger _minTokens, BigInteger _timeout) {
        final Function function = new Function(
                FUNC_REMOVELIQUIDITY, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_sharesBurned), 
                new org.web3j.abi.datatypes.generated.Uint256(_minEth), 
                new org.web3j.abi.datatypes.generated.Uint256(_minTokens), 
                new org.web3j.abi.datatypes.generated.Uint256(_timeout)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<BigInteger> getShares(String _provider) {
        final Function function = new Function(FUNC_GETSHARES, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_provider)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    @Deprecated
    public static OceanExchange load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new OceanExchange(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static OceanExchange load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new OceanExchange(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static OceanExchange load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new OceanExchange(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static OceanExchange load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new OceanExchange(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<OceanExchange> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider, String _tokenAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddress)));
        return deployRemoteCall(OceanExchange.class, web3j, credentials, contractGasProvider, BINARY, encodedConstructor);
    }

    public static RemoteCall<OceanExchange> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider, String _tokenAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddress)));
        return deployRemoteCall(OceanExchange.class, web3j, transactionManager, contractGasProvider, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<OceanExchange> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit, String _tokenAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddress)));
        return deployRemoteCall(OceanExchange.class, web3j, credentials, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<OceanExchange> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit, String _tokenAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddress)));
        return deployRemoteCall(OceanExchange.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    protected String getStaticDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static String getPreviouslyDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static class EthToTokenPurchaseEventResponse {
        public Log log;

        public String buyer;

        public BigInteger ethIn;

        public BigInteger tokensOut;
    }

    public static class TokenToEthPurchaseEventResponse {
        public Log log;

        public String buyer;

        public BigInteger tokensIn;

        public BigInteger ethOut;
    }

    public static class AddLiquidityEventResponse {
        public Log log;

        public String liquidityProvider;

        public BigInteger sharesPurchased;
    }

    public static class RemoveLiquidityEventResponse {
        public Log log;

        public String liquidityProvider;

        public BigInteger sharesBurned;
    }
}
