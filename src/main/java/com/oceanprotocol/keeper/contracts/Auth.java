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
import org.web3j.abi.datatypes.Utf8String;
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
public class Auth extends Contract {
    private static final String BINARY = "0x608060405234801561001057600080fd5b506040516020806117418339810160405251600160a060020a038116151561003757600080fd5b60008054600160a060020a03909216600160a060020a03199092169190911790556116da806100676000396000f3006080604052600436106100a35763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416632302797881146100a85780633147ce3e1461011a5780635990f9b81461014d578063740568ca146101b857806380f55605146101d35780638677ebe8146102045780639248adb3146102345780639c4129b3146102c1578063a57d9dcd146102db578063e60ae21e146103fa575b600080fd5b3480156100b457600080fd5b5060408051602060046024803582810135601f81018590048502860185019096528585526101069583359536956044949193909101919081908401838280828437509497506104129650505050505050565b604080519115158252519081900360200190f35b34801561012657600080fd5b50610106600435600160a060020a036024351660443560ff6064351660843560a43561053b565b34801561015957600080fd5b50604080516020600460443581810135601f81018490048402850184019095528484526101069482359460248035600160a060020a03169536959460649492019190819084018382808284375094975050933594506108399350505050565b3480156101c457600080fd5b50610106600435602435610c9f565b3480156101df57600080fd5b506101e8610d97565b60408051600160a060020a039092168252519081900360200190f35b34801561021057600080fd5b50610106600160a060020a036004351660243560ff60443516606435608435610da6565b34801561024057600080fd5b5061024c600435610e2b565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561028657818101518382015260200161026e565b50505050905090810190601f1680156102b35780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156102cd57600080fd5b506102d9600435610f26565b005b3480156102e757600080fd5b50604080516020601f6064356004818101359283018490048402850184019095528184526101069480359460248035151595604435953695608494930191819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a99988101979196509182019450925082915084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a99988101979196509182019450925082915084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a9998810197919650918201945092508291508401838280828437509497506110899650505050505050565b34801561040657600080fd5b5061024c60043561148e565b6000828152600160208190526040822001548390600160a060020a0316331461043a57600080fd5b8360016000828152600160205260409020600e015460ff16600381111561045d57fe5b1461046757600080fd5b6000858152600160209081526040909120855161048c92600d90920191870190611554565b5060408051868152602080820183815287519383019390935286517f4cc7c1011f1965b24a5f65b9fbe8dcb8308f60338c90184c2b9cbf443b92457893899389939092606084019185019080838360005b838110156104f55781810151838201526020016104dd565b50505050905090810190601f1680156105225780820380516001836020036101000a031916815260200191505b50935050505060405180910390a1506001949350505050565b6000868152600160208190526040822001548790600160a060020a0316331461056357600080fd5b8760016000828152600160205260409020600e015460ff16600381111561058657fe5b1461059057600080fd5b6000898152600160205260409020600901544211156106d6576000898152600160208190526040909120600e01805460039260ff1990911690835b021790555060008054604080517fde8f8b3f000000000000000000000000000000000000000000000000000000008152600481018d90529051600160a060020a039092169263de8f8b3f926024808401936020939083900390910190829087803b15801561063857600080fd5b505af115801561064c573d6000803e3d6000fd5b505050506040513d602081101561066257600080fd5b5051151561066f57600080fd5b60008981526001602081815260409283902080549201548351600160a060020a0393841681529216908201528082018b905290517f30fdc741be401eecd75afa7b0b6ef213c7480e452539972bd2e4300fb9b3f6019181900360600190a16000925061082d565b6106e38888888888610da6565b15610807576000898152600160209081526040808320600e01805460ff19166002179055825481517f7aa1ed58000000000000000000000000000000000000000000000000000000008152600481018e90529151600160a060020a0390911693637aa1ed5893602480850194919392918390030190829087803b15801561076957600080fd5b505af115801561077d573d6000803e3d6000fd5b505050506040513d602081101561079357600080fd5b505115156107a057600080fd5b60008981526001602081815260409283902080549201548351600160a060020a0393841681529216908201528082018b905290517f0eb9ac3000e9fb1fc61b6b965d61ce1f567bb5f8315a4fd4324c0df43da882cb9181900360600190a16001925061082d565b6000898152600160208190526040909120600e01805460039260ff1990911690836105cb565b50509695505050505050565b6000806108446115d2565b61084c6115e9565b6108546115fb565b61085c611647565b89338a8a60405180856000191660001916815260200184600160a060020a0316600160a060020a03166c0100000000000000000000000002815260140183600160a060020a0316600160a060020a03166c0100000000000000000000000002815260140182805190602001908083835b602083106108eb5780518252601f1990920191602091820191016108cc565b5181516020939093036101000a600019018019909116921691909117905260408051919093018190038120600082850181815260608401909552909d5090975087965091945090925061093c915050565b5081526040805160008082526020828101909352919092019190509052604080516000602082018181528284019093529296509182919050905260408051610100810182528c815281516000808252602082810190945293965090929183019150815260208082018790526000604080840182905260608401829052608084018290528051828152928301905260a09092019150815260209081018990526040805160e081018252338152600160a060020a038d169281019290925281018c905260608101829052608081018a905260a0810185905290925060c081016000905260008681526001602081815260409283902084518154600160a060020a0391821673ffffffffffffffffffffffffffffffffffffffff199182161783558387015194830180549590921694169390931790925591830151600282015560608301518051600383019081558184015180519596508695939492939192610aaa92600487019290910190611554565b506040820151805180516002840191610ac891839160200190611554565b506020828101518051610ae19260018501920190611554565b505050606082015160048201805460ff19169115159190911790556080820151600582015560a0820151600682015560c08201518051610b2b916007840191602090910190611554565b5060e082015181600801555050608082015181600c019080519060200190610b54929190611554565b5060a082015180518051600d840191610b7291839160200190611554565b50505060c0820151600e8201805460ff19166001836003811115610b9257fe5b02179055509050507f6b5c61f0a6dc28363722a8117b173395c51d3db451d2a1dcf754323e780c16d685338b8d8b8d60405180876000191660001916815260200186600160a060020a0316600160a060020a0316815260200185600160a060020a0316600160a060020a03168152602001846000191660001916815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015610c50578181015183820152602001610c38565b50505050905090810190601f168015610c7d5780820380516001836020036101000a031916815260200191505b5097505050505050505060405180910390a15060019998505050505050505050565b600081158015610ccc57506000838152600160205260408120600e015460ff166003811115610cca57fe5b145b15610cd957506001610d91565b816001148015610d08575060016000848152600160205260409020600e015460ff166003811115610d0657fe5b145b15610d1557506001610d91565b816002148015610d44575060026000848152600160205260409020600e015460ff166003811115610d4257fe5b145b15610d5157506001610d91565b816003148015610d80575060036000848152600160205260409020600e015460ff166003811115610d7e57fe5b145b15610d8d57506001610d91565b5060005b92915050565b600054600160a060020a031681565b604080516000808252602080830180855288905260ff871683850152606083018690526080830185905292519092600160a060020a0389169260019260a08083019392601f19830192908190039091019087865af1158015610e0c573d6000803e3d6000fd5b50505060206040510351600160a060020a031614905095945050505050565b6000818152600160205260409020546060908290600160a060020a03163314610e5357600080fd5b8260016000828152600160205260409020600e015460ff166003811115610e7657fe5b14610e8057600080fd5b600084815260016020818152604092839020600d0180548451600260001995831615610100029590950190911693909304601f8101839004830284018301909452838352919290830182828015610f185780601f10610eed57610100808354040283529160200191610f18565b820191906000526020600020905b815481529060010190602001808311610efb57829003601f168201915b505050505092505050919050565b80600080828152600160205260409020600e015460ff166003811115610f4857fe5b14610f5257600080fd5b6000828152600160205260409020600b01544211610f6f57600080fd5b6000828152600160209081526040808320600e01805460ff19166003179055825481517fde8f8b3f000000000000000000000000000000000000000000000000000000008152600481018790529151600160a060020a039091169363de8f8b3f93602480850194919392918390030190829087803b158015610ff057600080fd5b505af1158015611004573d6000803e3d6000fd5b505050506040513d602081101561101a57600080fd5b5051151561102757600080fd5b60008281526001602081815260409283902080549201548351600160a060020a03938416815292169082015280820184905290517f30fdc741be401eecd75afa7b0b6ef213c7480e452539972bd2e4300fb9b3f6019181900360600190a15050565b60006110936115d2565b600089815260016020819052604090912001548990600160a060020a031633146110bc57600080fd5b89600080828152600160205260409020600e015460ff1660038111156110de57fe5b146110e857600080fd5b8980156110f457508842105b156113585760008b815260016020908152604090912060078101805460ff19168d1515179055600981018b9055426008820155895161113b92600a909201918b0190611554565b5060008b81526001602090815260409091208851611161926004909201918a0190611554565b5060008b8152600160208181526040808420600e8101805460ff19168517905581518083019092528a82528183018a9052938f9052918152815180519296508693600501926111b39284920190611554565b5060208281015180516111cc9260018501920190611554565b509050507fb87e20faf268cbee7a5e0f111d33e8afdd470be15ffa86e804bacc576d7b38578b8a8a8a8a604051808660001916600019168152602001858152602001806020018060200180602001848103845287818151815260200191508051906020019080838360005b8381101561124f578181015183820152602001611237565b50505050905090810190601f16801561127c5780820380516001836020036101000a031916815260200191505b50848103835286518152865160209182019188019080838360005b838110156112af578181015183820152602001611297565b50505050905090810190601f1680156112dc5780820380516001836020036101000a031916815260200191505b50848103825285518152855160209182019187019080838360005b8381101561130f5781810151838201526020016112f7565b50505050905090810190601f16801561133c5780820380516001836020036101000a031916815260200191505b509850505050505050505060405180910390a160019350611480565b60008b8152600160208190526040909120600e01805460039260ff199091169083021790555060008054604080517fde8f8b3f000000000000000000000000000000000000000000000000000000008152600481018f90529051600160a060020a039092169263de8f8b3f926024808401936020939083900390910190829087803b1580156113e657600080fd5b505af11580156113fa573d6000803e3d6000fd5b505050506040513d602081101561141057600080fd5b5051151561141d57600080fd5b60008b81526001602081815260409283902080549201548351600160a060020a0393841681529216908201528082018d905290517f30fdc741be401eecd75afa7b0b6ef213c7480e452539972bd2e4300fb9b3f6019181900360600190a1600093505b505050979650505050505050565b600081815260016020819052604090912001546060908290600160a060020a031633146114ba57600080fd5b8260016000828152600160205260409020600e015460ff1660038111156114dd57fe5b146114e757600080fd5b600084815260016020818152604092839020600c0180548451600260001995831615610100029590950190911693909304601f8101839004830284018301909452838352919290830182828015610f185780601f10610eed57610100808354040283529160200191610f18565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061159557805160ff19168380011785556115c2565b828001600101855582156115c2579182015b828111156115c25782518255916020019190600101906115a7565b506115ce929150611691565b5090565b604080518082019091526060808252602082015290565b60408051602081019091526060815290565b6040805161012081018252600081526060602082015290810161161c6115d2565b8152602001600015158152602001600081526020016000815260200160608152602001600081525090565b604080516101e08101825260008082526020820181905291810191909152606081016116716115fb565b8152602001606081526020016116856115e9565b81526020016000905290565b6116ab91905b808211156115ce5760008155600101611697565b905600a165627a7a72305820d680c6944dc7e85eeb379d609d7ddc6def399851b170252261906dba7dfe52b30029";

    public static final String FUNC_MARKET = "market";

    public static final String FUNC_INITIATEACCESSREQUEST = "initiateAccessRequest";

    public static final String FUNC_COMMITACCESSREQUEST = "commitAccessRequest";

    public static final String FUNC_CANCELCONSENT = "cancelConsent";

    public static final String FUNC_DELIVERACCESSTOKEN = "deliverAccessToken";

    public static final String FUNC_GETTEMPPUBKEY = "getTempPubKey";

    public static final String FUNC_GETENCJWT = "getEncJWT";

    public static final String FUNC_ISSIGNED = "isSigned";

    public static final String FUNC_VERIFYACCESSTOKENDELIVERY = "verifyAccessTokenDelivery";

    public static final String FUNC_VERIFYCOMMITTED = "verifyCommitted";

    public static final Event REQUESTACCESSCONSENT_EVENT = new Event("RequestAccessConsent", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>() {}, new TypeReference<Address>() {}, new TypeReference<Address>() {}, new TypeReference<Bytes32>() {}, new TypeReference<Uint256>() {}, new TypeReference<Utf8String>() {}));
    ;

    public static final Event COMMITCONSENT_EVENT = new Event("CommitConsent", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>() {}, new TypeReference<Uint256>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {}));
    ;

    public static final Event REFUNDPAYMENT_EVENT = new Event("RefundPayment", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}, new TypeReference<Address>() {}, new TypeReference<Bytes32>() {}));
    ;

    public static final Event PUBLISHENCRYPTEDTOKEN_EVENT = new Event("PublishEncryptedToken", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>() {}, new TypeReference<Utf8String>() {}));
    ;

    public static final Event RELEASEPAYMENT_EVENT = new Event("ReleasePayment", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}, new TypeReference<Address>() {}, new TypeReference<Bytes32>() {}));
    ;

    protected static final HashMap<String, String> _addresses;

    static {
        _addresses = new HashMap<String, String>();
        _addresses.put("1533040880765", "0xeeb8a7aca02c7ceafba6b1eccba849dbebd4879c");
    }

    @Deprecated
    protected Auth(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected Auth(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected Auth(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected Auth(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public RemoteCall<String> market() {
        final Function function = new Function(FUNC_MARKET, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public List<RequestAccessConsentEventResponse> getRequestAccessConsentEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(REQUESTACCESSCONSENT_EVENT, transactionReceipt);
        ArrayList<RequestAccessConsentEventResponse> responses = new ArrayList<RequestAccessConsentEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            RequestAccessConsentEventResponse typedResponse = new RequestAccessConsentEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse._consumer = (String) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse._provider = (String) eventValues.getNonIndexedValues().get(2).getValue();
            typedResponse._resource = (byte[]) eventValues.getNonIndexedValues().get(3).getValue();
            typedResponse._timeout = (BigInteger) eventValues.getNonIndexedValues().get(4).getValue();
            typedResponse._pubKey = (String) eventValues.getNonIndexedValues().get(5).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<RequestAccessConsentEventResponse> requestAccessConsentEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, RequestAccessConsentEventResponse>() {
            @Override
            public RequestAccessConsentEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(REQUESTACCESSCONSENT_EVENT, log);
                RequestAccessConsentEventResponse typedResponse = new RequestAccessConsentEventResponse();
                typedResponse.log = log;
                typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse._consumer = (String) eventValues.getNonIndexedValues().get(1).getValue();
                typedResponse._provider = (String) eventValues.getNonIndexedValues().get(2).getValue();
                typedResponse._resource = (byte[]) eventValues.getNonIndexedValues().get(3).getValue();
                typedResponse._timeout = (BigInteger) eventValues.getNonIndexedValues().get(4).getValue();
                typedResponse._pubKey = (String) eventValues.getNonIndexedValues().get(5).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<RequestAccessConsentEventResponse> requestAccessConsentEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(REQUESTACCESSCONSENT_EVENT));
        return requestAccessConsentEventFlowable(filter);
    }

    public List<CommitConsentEventResponse> getCommitConsentEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(COMMITCONSENT_EVENT, transactionReceipt);
        ArrayList<CommitConsentEventResponse> responses = new ArrayList<CommitConsentEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            CommitConsentEventResponse typedResponse = new CommitConsentEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse._expire = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse._discovery = (String) eventValues.getNonIndexedValues().get(2).getValue();
            typedResponse._permissions = (String) eventValues.getNonIndexedValues().get(3).getValue();
            typedResponse.slaLink = (String) eventValues.getNonIndexedValues().get(4).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<CommitConsentEventResponse> commitConsentEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, CommitConsentEventResponse>() {
            @Override
            public CommitConsentEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(COMMITCONSENT_EVENT, log);
                CommitConsentEventResponse typedResponse = new CommitConsentEventResponse();
                typedResponse.log = log;
                typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse._expire = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
                typedResponse._discovery = (String) eventValues.getNonIndexedValues().get(2).getValue();
                typedResponse._permissions = (String) eventValues.getNonIndexedValues().get(3).getValue();
                typedResponse.slaLink = (String) eventValues.getNonIndexedValues().get(4).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<CommitConsentEventResponse> commitConsentEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(COMMITCONSENT_EVENT));
        return commitConsentEventFlowable(filter);
    }

    public List<RefundPaymentEventResponse> getRefundPaymentEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(REFUNDPAYMENT_EVENT, transactionReceipt);
        ArrayList<RefundPaymentEventResponse> responses = new ArrayList<RefundPaymentEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            RefundPaymentEventResponse typedResponse = new RefundPaymentEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._consumer = (String) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse._provider = (String) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<RefundPaymentEventResponse> refundPaymentEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, RefundPaymentEventResponse>() {
            @Override
            public RefundPaymentEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(REFUNDPAYMENT_EVENT, log);
                RefundPaymentEventResponse typedResponse = new RefundPaymentEventResponse();
                typedResponse.log = log;
                typedResponse._consumer = (String) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse._provider = (String) eventValues.getNonIndexedValues().get(1).getValue();
                typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(2).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<RefundPaymentEventResponse> refundPaymentEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(REFUNDPAYMENT_EVENT));
        return refundPaymentEventFlowable(filter);
    }

    public List<PublishEncryptedTokenEventResponse> getPublishEncryptedTokenEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(PUBLISHENCRYPTEDTOKEN_EVENT, transactionReceipt);
        ArrayList<PublishEncryptedTokenEventResponse> responses = new ArrayList<PublishEncryptedTokenEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            PublishEncryptedTokenEventResponse typedResponse = new PublishEncryptedTokenEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.encJWT = (String) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<PublishEncryptedTokenEventResponse> publishEncryptedTokenEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, PublishEncryptedTokenEventResponse>() {
            @Override
            public PublishEncryptedTokenEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(PUBLISHENCRYPTEDTOKEN_EVENT, log);
                PublishEncryptedTokenEventResponse typedResponse = new PublishEncryptedTokenEventResponse();
                typedResponse.log = log;
                typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse.encJWT = (String) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<PublishEncryptedTokenEventResponse> publishEncryptedTokenEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(PUBLISHENCRYPTEDTOKEN_EVENT));
        return publishEncryptedTokenEventFlowable(filter);
    }

    public List<ReleasePaymentEventResponse> getReleasePaymentEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(RELEASEPAYMENT_EVENT, transactionReceipt);
        ArrayList<ReleasePaymentEventResponse> responses = new ArrayList<ReleasePaymentEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            ReleasePaymentEventResponse typedResponse = new ReleasePaymentEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._consumer = (String) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse._provider = (String) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<ReleasePaymentEventResponse> releasePaymentEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, ReleasePaymentEventResponse>() {
            @Override
            public ReleasePaymentEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(RELEASEPAYMENT_EVENT, log);
                ReleasePaymentEventResponse typedResponse = new ReleasePaymentEventResponse();
                typedResponse.log = log;
                typedResponse._consumer = (String) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse._provider = (String) eventValues.getNonIndexedValues().get(1).getValue();
                typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(2).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<ReleasePaymentEventResponse> releasePaymentEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(RELEASEPAYMENT_EVENT));
        return releasePaymentEventFlowable(filter);
    }

    public RemoteCall<TransactionReceipt> initiateAccessRequest(byte[] resourceId, String provider, String pubKey, BigInteger timeout) {
        final Function function = new Function(
                FUNC_INITIATEACCESSREQUEST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(resourceId), 
                new org.web3j.abi.datatypes.Address(provider), 
                new org.web3j.abi.datatypes.Utf8String(pubKey), 
                new org.web3j.abi.datatypes.generated.Uint256(timeout)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> commitAccessRequest(byte[] id, Boolean available, BigInteger expire, String discovery, String permissions, String slaLink, String slaType) {
        final Function function = new Function(
                FUNC_COMMITACCESSREQUEST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id), 
                new org.web3j.abi.datatypes.Bool(available), 
                new org.web3j.abi.datatypes.generated.Uint256(expire), 
                new org.web3j.abi.datatypes.Utf8String(discovery), 
                new org.web3j.abi.datatypes.Utf8String(permissions), 
                new org.web3j.abi.datatypes.Utf8String(slaLink), 
                new org.web3j.abi.datatypes.Utf8String(slaType)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> cancelConsent(byte[] id) {
        final Function function = new Function(
                FUNC_CANCELCONSENT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> deliverAccessToken(byte[] id, String encryptedJWT) {
        final Function function = new Function(
                FUNC_DELIVERACCESSTOKEN, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id), 
                new org.web3j.abi.datatypes.Utf8String(encryptedJWT)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<String> getTempPubKey(byte[] id) {
        final Function function = new Function(FUNC_GETTEMPPUBKEY, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Utf8String>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteCall<String> getEncJWT(byte[] id) {
        final Function function = new Function(FUNC_GETENCJWT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Utf8String>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteCall<Boolean> isSigned(String _addr, byte[] msgHash, BigInteger v, byte[] r, byte[] s) {
        final Function function = new Function(FUNC_ISSIGNED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_addr), 
                new org.web3j.abi.datatypes.generated.Bytes32(msgHash), 
                new org.web3j.abi.datatypes.generated.Uint8(v), 
                new org.web3j.abi.datatypes.generated.Bytes32(r), 
                new org.web3j.abi.datatypes.generated.Bytes32(s)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<TransactionReceipt> verifyAccessTokenDelivery(byte[] id, String _addr, byte[] msgHash, BigInteger v, byte[] r, byte[] s) {
        final Function function = new Function(
                FUNC_VERIFYACCESSTOKENDELIVERY, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id), 
                new org.web3j.abi.datatypes.Address(_addr), 
                new org.web3j.abi.datatypes.generated.Bytes32(msgHash), 
                new org.web3j.abi.datatypes.generated.Uint8(v), 
                new org.web3j.abi.datatypes.generated.Bytes32(r), 
                new org.web3j.abi.datatypes.generated.Bytes32(s)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<Boolean> verifyCommitted(byte[] id, BigInteger status) {
        final Function function = new Function(FUNC_VERIFYCOMMITTED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id), 
                new org.web3j.abi.datatypes.generated.Uint256(status)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    @Deprecated
    public static Auth load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new Auth(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static Auth load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new Auth(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static Auth load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new Auth(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static Auth load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new Auth(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<Auth> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider, String _marketAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddress)));
        return deployRemoteCall(Auth.class, web3j, credentials, contractGasProvider, BINARY, encodedConstructor);
    }

    public static RemoteCall<Auth> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider, String _marketAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddress)));
        return deployRemoteCall(Auth.class, web3j, transactionManager, contractGasProvider, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<Auth> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit, String _marketAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddress)));
        return deployRemoteCall(Auth.class, web3j, credentials, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<Auth> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit, String _marketAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddress)));
        return deployRemoteCall(Auth.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    protected String getStaticDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static String getPreviouslyDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static class RequestAccessConsentEventResponse {
        public Log log;

        public byte[] _id;

        public String _consumer;

        public String _provider;

        public byte[] _resource;

        public BigInteger _timeout;

        public String _pubKey;
    }

    public static class CommitConsentEventResponse {
        public Log log;

        public byte[] _id;

        public BigInteger _expire;

        public String _discovery;

        public String _permissions;

        public String slaLink;
    }

    public static class RefundPaymentEventResponse {
        public Log log;

        public String _consumer;

        public String _provider;

        public byte[] _id;
    }

    public static class PublishEncryptedTokenEventResponse {
        public Log log;

        public byte[] _id;

        public String encJWT;
    }

    public static class ReleasePaymentEventResponse {
        public Log log;

        public String _consumer;

        public String _provider;

        public byte[] _id;
    }
}
