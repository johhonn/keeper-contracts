package com.oceanprotocol.keeper.contracts;

import io.reactivex.Flowable;
import io.reactivex.functions.Function;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Bytes32;
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
public class AccessConditions extends Contract {
    private static final String BINARY = "0x608060405234801561001057600080fd5b5060405160208061075c8339810160405251600160a060020a038116151561009957604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f696e76616c696420636f6e747261637420616464726573730000000000000000604482015290519081900360640190fd5b60018054600160a060020a031916600160a060020a0392909216919091179055610694806100c86000396000f3006080604052600436106100325763ffffffff60e060020a60003504166325bfdd8a8114610037578063b36a9a7c14610069575b600080fd5b34801561004357600080fd5b5061005560043560243560443561008d565b604080519115158252519081900360200190f35b34801561007557600080fd5b50610055600160a060020a0360043516602435610640565b600154604080517f9ed4858a00000000000000000000000000000000000000000000000000000000815260048101869052905160009283928392839283928a9233928392600160a060020a0390911691639ed4858a9160248082019260209290919082900301818a87803b15801561010457600080fd5b505af1158015610118573d6000803e3d6000fd5b505050506040513d602081101561012e57600080fd5b5051600160a060020a0316146101cb57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f5265737472696374656420616363657373202d206f6e6c7920534c412070756260448201527f6c69736865720000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b600154604080517ffbb7f209000000000000000000000000000000000000000000000000000000008152600481018d90523060248201527f25bfdd8a0000000000000000000000000000000000000000000000000000000060448201529051600160a060020a039092169163fbb7f209916064808201926020929091908290030181600087803b15801561025e57600080fd5b505af1158015610272573d6000803e3d6000fd5b505050506040513d602081101561028857600080fd5b5051600154604080517f5f9766f5000000000000000000000000000000000000000000000000000000008152600481018e9052602481018490529051929850600160a060020a0390911691635f9766f5916044808201926020929091908290030181600087803b1580156102fb57600080fd5b505af115801561030f573d6000803e3d6000fd5b505050506040513d602081101561032557600080fd5b50511594508461033457610633565b6040805160208082018c90528183018b9052825180830384018152606090920192839052815191929182918401908083835b602083106103855780518252601f199092019160209182019101610366565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390209350600160009054906101000a9004600160a060020a0316600160a060020a031663ed25e7c98b6325bfdd8a60e060020a02876040518463ffffffff1660e060020a028152600401808460001916600019168152602001837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200182600019166000191681526020019350505050602060405180830381600087803b15801561047a57600080fd5b505af115801561048e573d6000803e3d6000fd5b505050506040513d60208110156104a457600080fd5b5051151561053857604080517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f43616e6e6f742066756c66696c6c206772616e7441636365737320636f6e646960448201527f74696f6e00000000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b600154604080517f5349a8ae000000000000000000000000000000000000000000000000000000008152600481018d90529051600160a060020a0390921691635349a8ae916024808201926020929091908290030181600087803b15801561059f57600080fd5b505af11580156105b3573d6000803e3d6000fd5b505050506040513d60208110156105c957600080fd5b5051600089815260208181526040808320600160a060020a0385168452825291829020805460ff1916600117905581518d81529081018c905281519295507f9113fefc36a3e92ce32c2be2892f5aaef70dd7e38d945141b24666935f5c4373929081900390910190a15b5050505050509392505050565b600090815260208181526040808320600160a060020a03949094168352929052205460ff16905600a165627a7a723058203dad075043ef73723f6aa3544cb174b8bcc2b1506d025ffb5a1fa070f2595f3a0029";

    public static final String FUNC_CHECKPERMISSIONS = "checkPermissions";

    public static final String FUNC_GRANTACCESS = "grantAccess";

    public static final Event ACCESSGRANTED_EVENT = new Event("AccessGranted", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>() {}, new TypeReference<Bytes32>() {}));
    ;

    protected static final HashMap<String, String> _addresses;

    static {
        _addresses = new HashMap<String, String>();
        _addresses.put("8995", "0x26266022715722dfdb36c4fe90dfcb025cf34bc8");
    }

    @Deprecated
    protected AccessConditions(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected AccessConditions(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected AccessConditions(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected AccessConditions(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public List<AccessGrantedEventResponse> getAccessGrantedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(ACCESSGRANTED_EVENT, transactionReceipt);
        ArrayList<AccessGrantedEventResponse> responses = new ArrayList<AccessGrantedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AccessGrantedEventResponse typedResponse = new AccessGrantedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.serviceId = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.asset = (byte[]) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<AccessGrantedEventResponse> accessGrantedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, AccessGrantedEventResponse>() {
            @Override
            public AccessGrantedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ACCESSGRANTED_EVENT, log);
                AccessGrantedEventResponse typedResponse = new AccessGrantedEventResponse();
                typedResponse.log = log;
                typedResponse.serviceId = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse.asset = (byte[]) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<AccessGrantedEventResponse> accessGrantedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ACCESSGRANTED_EVENT));
        return accessGrantedEventFlowable(filter);
    }

    public RemoteCall<Boolean> checkPermissions(String consumer, byte[] documentKeyId) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_CHECKPERMISSIONS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(consumer), 
                new org.web3j.abi.datatypes.generated.Bytes32(documentKeyId)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<TransactionReceipt> grantAccess(byte[] serviceId, byte[] assetId, byte[] documentKeyId) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_GRANTACCESS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(serviceId), 
                new org.web3j.abi.datatypes.generated.Bytes32(assetId), 
                new org.web3j.abi.datatypes.generated.Bytes32(documentKeyId)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    @Deprecated
    public static AccessConditions load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new AccessConditions(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static AccessConditions load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new AccessConditions(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static AccessConditions load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new AccessConditions(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static AccessConditions load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new AccessConditions(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<AccessConditions> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider, String _serviceAgreementAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_serviceAgreementAddress)));
        return deployRemoteCall(AccessConditions.class, web3j, credentials, contractGasProvider, BINARY, encodedConstructor);
    }

    public static RemoteCall<AccessConditions> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider, String _serviceAgreementAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_serviceAgreementAddress)));
        return deployRemoteCall(AccessConditions.class, web3j, transactionManager, contractGasProvider, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<AccessConditions> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit, String _serviceAgreementAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_serviceAgreementAddress)));
        return deployRemoteCall(AccessConditions.class, web3j, credentials, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<AccessConditions> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit, String _serviceAgreementAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_serviceAgreementAddress)));
        return deployRemoteCall(AccessConditions.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    protected String getStaticDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static String getPreviouslyDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static class AccessGrantedEventResponse {
        public Log log;

        public byte[] serviceId;

        public byte[] asset;
    }
}
