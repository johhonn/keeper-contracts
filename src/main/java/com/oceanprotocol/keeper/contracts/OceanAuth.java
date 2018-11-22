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
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.DynamicBytes;
import org.web3j.abi.datatypes.Event;
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
public class OceanAuth extends Contract {
    private static final String BINARY = "0x608060405234801561001057600080fd5b50604051602080611c838339810160405251600160a060020a038116151561009957604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601c60248201527f4d61726b657420616464726573732063616e6e6f742062652030783000000000604482015290519081900360640190fd5b60008054600160a060020a031916600160a060020a0383811691909117808355604080517f37e13cf7000000000000000000000000000000000000000000000000000000008152905191909216926337e13cf792600480820193602093909283900390910190829087803b15801561011057600080fd5b505af1158015610124573d6000803e3d6000fd5b505050506040513d602081101561013a57600080fd5b505050611b378061014c6000396000f3006080604052600436106100985763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166302bf9e7f811461009d5780633147ce3e146100e15780635990f9b814610114578063640f32551461017f578063a57d9dcd146101dd578063bb5ed785146102fc578063ce3e07c514610389578063d232ee49146103a3578063e60ae21e146103cd575b600080fd5b3480156100a957600080fd5b506100cd600160a060020a036004351660243560ff604435166064356084356103e5565b604080519115158252519081900360200190f35b3480156100ed57600080fd5b506100cd600435600160a060020a036024351660443560ff6064351660843560a43561046a565b34801561012057600080fd5b50604080516020600460443581810135601f81018490048402850184019095528484526100cd9482359460248035600160a060020a03169536959460649492019190819084018382808284375094975050933594506108f69350505050565b34801561018b57600080fd5b5060408051602060046024803582810135601f81018590048502860185019096528585526100cd958335953695604494919390910191908190840183828082843750949750610d549650505050505050565b3480156101e957600080fd5b50604080516020601f6064356004818101359283018490048402850184019095528184526100cd9480359460248035151595604435953695608494930191819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a99988101979196509182019450925082915084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a99988101979196509182019450925082915084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750610f139650505050505050565b34801561030857600080fd5b506103146004356112cb565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561034e578181015183820152602001610336565b50505050905090810190601f16801561037b5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561039557600080fd5b506103a1600435611548565b005b3480156103af57600080fd5b506103bb60043561187d565b60408051918252519081900360200190f35b3480156103d957600080fd5b506103146004356118a3565b604080516000808252602080830180855288905260ff871683850152606083018690526080830185905292519092600160a060020a0389169260019260a08083019392601f19830192908190039091019087865af115801561044b573d6000803e3d6000fd5b50505060206040510351600160a060020a031614905095945050505050565b6000868152600160208190526040822001548790600160a060020a031633146104cb576040805160e560020a62461bcd0281526020600482015260176024820152600080516020611aec833981519152604482015290519081900360640190fd5b60008054604080517f24d468d8000000000000000000000000000000000000000000000000000000008152600481018c905290518b93600160a060020a03909316926324d468d892602480820193602093909283900390910190829087803b15801561053657600080fd5b505af115801561054a573d6000803e3d6000fd5b505050506040513d602081101561056057600080fd5b505115156105b8576040805160e560020a62461bcd02815260206004820152601460248201527f7061796d656e74206e6f74207265636569766564000000000000000000000000604482015290519081900360640190fd5b60026000828152600160205260409020600e015460ff1660048111156105da57fe5b1461062f576040805160e560020a62461bcd02815260206004820152601560248201527f537461747573206e6f742044656c6976657265642e0000000000000000000000604482015290519081900360640190fd5b61063c88888888886103e5565b156107915760008054604080517f7aa1ed58000000000000000000000000000000000000000000000000000000008152600481018d90529051600160a060020a0390921692637aa1ed58926024808401936020939083900390910190829087803b1580156106a957600080fd5b505af11580156106bd573d6000803e3d6000fd5b505050506040513d60208110156106d357600080fd5b5051151561072b576040805160e560020a62461bcd02815260206004820152601760248201527f52656c65617365207061796d656e74206661696c65642e000000000000000000604482015290519081900360640190fd5b6000898152600160208190526040808320600e8101805460ff1916600317905591820154915490518c93600160a060020a0393841693909216917fc2f1f84bab73acd6f89d8781452c110213fe99a0b193f8308363eec3f2f613f191a4600192506108ea565b6000898152600160209081526040808320600e01805460ff19166004908117909155835482517fde8f8b3f0000000000000000000000000000000000000000000000000000000081529182018e90529151600160a060020a039092169363de8f8b3f9360248084019491939192918390030190829087803b15801561081557600080fd5b505af1158015610829573d6000803e3d6000fd5b505050506040513d602081101561083f57600080fd5b50511515610897576040805160e560020a62461bcd02815260206004820152601660248201527f526566756e64207061796d656e74206661696c65642e00000000000000000000604482015290519081900360640190fd5b600089815260016020819052604080832091820154915490518c93600160a060020a0393841693909216917fac0e73405c1b8ec644662c5bc17fc0cccea554dfc7c3a6424f75b37aff13c09c91a4600092505b50509695505050505050565b6000806109016119ed565b610909611a04565b8733888860405160200180856000191660001916815260200184600160a060020a0316600160a060020a03166c0100000000000000000000000002815260140183600160a060020a0316600160a060020a03166c0100000000000000000000000002815260140182805190602001908083835b6020831061099b5780518252601f19909201916020918201910161097c565b6001836020036101000a0380198251168184511680821785525050505050509050019450505050506040516020818303038152906040526040518082805190602001908083835b60208310610a015780518252601f1990920191602091820191016109e2565b5181516020939093036101000a6000190180199091169216919091179052604080519190930181900381206000828501818152606084019095529098509094508493509050508152604080516000808252602082810190935291909201919050905260408051610100810182528a815281516000808252602082810190945293955090929183019150815260208082018590526000604080840182905260608401829052608084018290528051828152928301905260a09092019150815260209081018790526040805160e081018252338152600160a060020a038b16818401528082018c905260608101849052608081018a90528151600080825293810190925292935060a08301915081526020016000905260008481526001602081815260409283902084518154600160a060020a0391821673ffffffffffffffffffffffffffffffffffffffff19918216178355868401519483018054959092169416939093179092559183015160028201556060830151805160038301908155818401518051939492939192610b9d92600487019290910190611a50565b506040820151805180516002840191610bbb91839160200190611a50565b506020828101518051610bd49260018501920190611a50565b505050606082015160048201805460ff19169115159190911790556080820151600582015560a0820151600682015560c08201518051610c1e916007840191602090910190611a50565b5060e082015181600801555050608082015181600c019080519060200190610c47929190611a50565b5060a08201518051610c6391600d840191602090910190611a50565b5060c0820151600e8201805460ff19166001836004811115610c8157fe5b02179055505060408051858152602080820189905260609282018381528a519383019390935289518c9450600160a060020a038c169333937fd637e2a082042f01aeb59ac7807b1d3c75148f2627f90373e3f69a790a905e6a938a938d938f93929091608084019185019080838360005b83811015610d0a578181015183820152602001610cf2565b50505050905090810190601f168015610d375780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a4506001979650505050505050565b6000828152600160208190526040822001548390600160a060020a03163314610db5576040805160e560020a62461bcd0281526020600482015260176024820152600080516020611aec833981519152604482015290519081900360640190fd5b8360016000828152600160205260409020600e015460ff166004811115610dd857fe5b14610e2d576040805160e560020a62461bcd02815260206004820152601560248201527f537461747573206e6f7420436f6d6d69747465642e0000000000000000000000604482015290519081900360640190fd5b60008581526001602090815260409091208551610e5292600d90920191870190611a50565b506000858152600160209081526040808320600e01805460ff191660021790558051828152875181840152875189947fa41aa0d239d232f3014c6a0d5dc139a704d67c743b5a232c147f30ffd3708575948a94849390840192918601918190849084905b83811015610ece578181015183820152602001610eb6565b50505050905090810190601f168015610efb5780820380516001836020036101000a031916815260200191505b509250505060405180910390a2506001949350505050565b6000610f1d6119ed565b600089815260016020819052604090912001548990600160a060020a03163314610f7f576040805160e560020a62461bcd0281526020600482015260176024820152600080516020611aec833981519152604482015290519081900360640190fd5b89600080828152600160205260409020600e015460ff166004811115610fa157fe5b14610ff6576040805160e560020a62461bcd02815260206004820152601560248201527f537461747573206e6f74207265717565737465642e0000000000000000000000604482015290519081900360640190fd5b89801561100257508842105b1561125b5760008b815260016020908152604090912060078101805460ff19168d1515179055600981018b9055426008820155895161104992600a909201918b0190611a50565b5060008b8152600160209081526040909120885161106f926004909201918a0190611a50565b5060008b8152600160208181526040808420600e8101805460ff19168517905581518083019092528a82528183018a9052938f9052918152815180519296508693600501926110c19284920190611a50565b5060208281015180516110da9260018501920190611a50565b509050508a600019167f4a19b1540dcffc4a78cc4d7969ff8434f451a23e334003221fe8637b7cd862e88a8a8a8a60405180858152602001806020018060200180602001848103845287818151815260200191508051906020019080838360005b8381101561115357818101518382015260200161113b565b50505050905090810190601f1680156111805780820380516001836020036101000a031916815260200191505b50848103835286518152865160209182019188019080838360005b838110156111b357818101518382015260200161119b565b50505050905090810190601f1680156111e05780820380516001836020036101000a031916815260200191505b50848103825285518152855160209182019187019080838360005b838110156112135781810151838201526020016111fb565b50505050905090810190601f1680156112405780820380516001836020036101000a031916815260200191505b5097505050505050505060405180910390a2600193506112bd565b60008b8152600160208190526040808320600e8101805460ff1916600417905591820154915490518e93600160a060020a0393841693909216917ffe7a55be2c5a41992082bac0c0292895b1b448705d94413e1c444b57c004587f91a4600093505b505050979650505050505050565b6000818152600160205260409020546060908290600160a060020a0316331461133e576040805160e560020a62461bcd02815260206004820152601760248201527f53656e646572206973206e6f7420636f6e73756d65722e000000000000000000604482015290519081900360640190fd5b60008054604080517f24d468d80000000000000000000000000000000000000000000000000000000081526004810187905290518693600160a060020a03909316926324d468d892602480820193602093909283900390910190829087803b1580156113a957600080fd5b505af11580156113bd573d6000803e3d6000fd5b505050506040513d60208110156113d357600080fd5b5051151561142b576040805160e560020a62461bcd02815260206004820152601460248201527f7061796d656e74206e6f74207265636569766564000000000000000000000000604482015290519081900360640190fd5b60026000828152600160205260409020600e015460ff16600481111561144d57fe5b146114a2576040805160e560020a62461bcd02815260206004820152601560248201527f537461747573206e6f742044656c6976657265642e0000000000000000000000604482015290519081900360640190fd5b600084815260016020818152604092839020600d0180548451600260001995831615610100029590950190911693909304601f810183900483028401830190945283835291929083018282801561153a5780601f1061150f5761010080835404028352916020019161153a565b820191906000526020600020905b81548152906001019060200180831161151d57829003601f168201915b505050505092505050919050565b8060016000828152600160205260409020600e015460ff16600481111561156b57fe5b146115c0576040805160e560020a62461bcd02815260206004820152601560248201527f537461747573206e6f7420436f6d6d69747465642e0000000000000000000000604482015290519081900360640190fd5b6000828152600160205260409020548290600160a060020a03163314611630576040805160e560020a62461bcd02815260206004820152601760248201527f53656e646572206973206e6f7420636f6e73756d65722e000000000000000000604482015290519081900360640190fd5b6000838152600160205260409020600b01544211611698576040805160e560020a62461bcd02815260206004820152601560248201527f54696d656f7574206e6f742065786365656465642e0000000000000000000000604482015290519081900360640190fd5b60008054604080517f24d468d8000000000000000000000000000000000000000000000000000000008152600481018790529051600160a060020a03909216926324d468d8926024808401936020939083900390910190829087803b15801561170057600080fd5b505af1158015611714573d6000803e3d6000fd5b505050506040513d602081101561172a57600080fd5b50511561181b5760008054604080517fde8f8b3f000000000000000000000000000000000000000000000000000000008152600481018790529051600160a060020a039092169263de8f8b3f926024808401936020939083900390910190829087803b15801561179957600080fd5b505af11580156117ad573d6000803e3d6000fd5b505050506040513d60208110156117c357600080fd5b5051151561181b576040805160e560020a62461bcd02815260206004820152601660248201527f526566756e64207061796d656e74206661696c65642e00000000000000000000604482015290519081900360640190fd5b6000838152600160208190526040808320600e8101805460ff1916600417905591820154915490518693600160a060020a0393841693909216917fac0e73405c1b8ec644662c5bc17fc0cccea554dfc7c3a6424f75b37aff13c09c91a4505050565b6000818152600160205260408120600e015460ff16600481111561189d57fe5b92915050565b600081815260016020819052604090912001546060908290600160a060020a03163314611908576040805160e560020a62461bcd0281526020600482015260176024820152600080516020611aec833981519152604482015290519081900360640190fd5b8260016000828152600160205260409020600e015460ff16600481111561192b57fe5b14611980576040805160e560020a62461bcd02815260206004820152601560248201527f537461747573206e6f7420436f6d6d69747465642e0000000000000000000000604482015290519081900360640190fd5b600084815260016020818152604092839020600c0180548451600260001995831615610100029590950190911693909304601f810183900483028401830190945283835291929083018282801561153a5780601f1061150f5761010080835404028352916020019161153a565b604080518082019091526060808252602082015290565b60408051610120810182526000815260606020820152908101611a256119ed565b8152602001600015158152602001600081526020016000815260200160608152602001600081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10611a9157805160ff1916838001178555611abe565b82800160010185558215611abe579182015b82811115611abe578251825591602001919060010190611aa3565b50611aca929150611ace565b5090565b611ae891905b80821115611aca5760008155600101611ad4565b90560053656e646572206973206e6f742050726f76696465722e000000000000000000a165627a7a72305820bd5da0c9161a65ee302c101e6bb7f4557bf37b7e28df6a635e8afa145b4fa9300029";

    public static final String FUNC_INITIATEACCESSREQUEST = "initiateAccessRequest";

    public static final String FUNC_COMMITACCESSREQUEST = "commitAccessRequest";

    public static final String FUNC_CANCELACCESSREQUEST = "cancelAccessRequest";

    public static final String FUNC_DELIVERACCESSTOKEN = "deliverAccessToken";

    public static final String FUNC_GETTEMPPUBKEY = "getTempPubKey";

    public static final String FUNC_GETENCRYPTEDACCESSTOKEN = "getEncryptedAccessToken";

    public static final String FUNC_VERIFYSIGNATURE = "verifySignature";

    public static final String FUNC_VERIFYACCESSTOKENDELIVERY = "verifyAccessTokenDelivery";

    public static final String FUNC_STATUSOFACCESSREQUEST = "statusOfAccessRequest";

    public static final Event ACCESSCONSENTREQUESTED_EVENT = new Event("AccessConsentRequested", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>() {}, new TypeReference<Address>(true) {}, new TypeReference<Address>(true) {}, new TypeReference<Bytes32>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Utf8String>() {}));
    ;

    public static final Event ACCESSREQUESTCOMMITTED_EVENT = new Event("AccessRequestCommitted", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {}));
    ;

    public static final Event ACCESSREQUESTREJECTED_EVENT = new Event("AccessRequestRejected", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Address>(true) {}, new TypeReference<Bytes32>(true) {}));
    ;

    public static final Event ACCESSREQUESTREVOKED_EVENT = new Event("AccessRequestRevoked", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Address>(true) {}, new TypeReference<Bytes32>(true) {}));
    ;

    public static final Event ENCRYPTEDTOKENPUBLISHED_EVENT = new Event("EncryptedTokenPublished", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<DynamicBytes>() {}));
    ;

    public static final Event ACCESSREQUESTDELIVERED_EVENT = new Event("AccessRequestDelivered", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Address>(true) {}, new TypeReference<Bytes32>(true) {}));
    ;

    protected static final HashMap<String, String> _addresses;

    static {
        _addresses = new HashMap<String, String>();
        _addresses.put("8995", "0x251afd5e9cb1108c17745b522c930f97b3874880");
        _addresses.put("1539856672111", "0xb4b23b7cf454d634907ce5519e0cc56ada458191");
    }

    @Deprecated
    protected OceanAuth(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected OceanAuth(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected OceanAuth(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected OceanAuth(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public List<AccessConsentRequestedEventResponse> getAccessConsentRequestedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(ACCESSCONSENTREQUESTED_EVENT, transactionReceipt);
        ArrayList<AccessConsentRequestedEventResponse> responses = new ArrayList<AccessConsentRequestedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AccessConsentRequestedEventResponse typedResponse = new AccessConsentRequestedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._consumer = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._provider = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse._resourceId = (byte[]) eventValues.getIndexedValues().get(2).getValue();
            typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse._timeout = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse._pubKey = (String) eventValues.getNonIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<AccessConsentRequestedEventResponse> accessConsentRequestedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, AccessConsentRequestedEventResponse>() {
            @Override
            public AccessConsentRequestedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ACCESSCONSENTREQUESTED_EVENT, log);
                AccessConsentRequestedEventResponse typedResponse = new AccessConsentRequestedEventResponse();
                typedResponse.log = log;
                typedResponse._consumer = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._provider = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse._resourceId = (byte[]) eventValues.getIndexedValues().get(2).getValue();
                typedResponse._id = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse._timeout = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
                typedResponse._pubKey = (String) eventValues.getNonIndexedValues().get(2).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<AccessConsentRequestedEventResponse> accessConsentRequestedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ACCESSCONSENTREQUESTED_EVENT));
        return accessConsentRequestedEventFlowable(filter);
    }

    public List<AccessRequestCommittedEventResponse> getAccessRequestCommittedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(ACCESSREQUESTCOMMITTED_EVENT, transactionReceipt);
        ArrayList<AccessRequestCommittedEventResponse> responses = new ArrayList<AccessRequestCommittedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AccessRequestCommittedEventResponse typedResponse = new AccessRequestCommittedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._id = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._expirationDate = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse._discovery = (String) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse._permissions = (String) eventValues.getNonIndexedValues().get(2).getValue();
            typedResponse._accessAgreementRef = (String) eventValues.getNonIndexedValues().get(3).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<AccessRequestCommittedEventResponse> accessRequestCommittedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, AccessRequestCommittedEventResponse>() {
            @Override
            public AccessRequestCommittedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ACCESSREQUESTCOMMITTED_EVENT, log);
                AccessRequestCommittedEventResponse typedResponse = new AccessRequestCommittedEventResponse();
                typedResponse.log = log;
                typedResponse._id = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._expirationDate = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse._discovery = (String) eventValues.getNonIndexedValues().get(1).getValue();
                typedResponse._permissions = (String) eventValues.getNonIndexedValues().get(2).getValue();
                typedResponse._accessAgreementRef = (String) eventValues.getNonIndexedValues().get(3).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<AccessRequestCommittedEventResponse> accessRequestCommittedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ACCESSREQUESTCOMMITTED_EVENT));
        return accessRequestCommittedEventFlowable(filter);
    }

    public List<AccessRequestRejectedEventResponse> getAccessRequestRejectedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(ACCESSREQUESTREJECTED_EVENT, transactionReceipt);
        ArrayList<AccessRequestRejectedEventResponse> responses = new ArrayList<AccessRequestRejectedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AccessRequestRejectedEventResponse typedResponse = new AccessRequestRejectedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._consumer = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._provider = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse._id = (byte[]) eventValues.getIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<AccessRequestRejectedEventResponse> accessRequestRejectedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, AccessRequestRejectedEventResponse>() {
            @Override
            public AccessRequestRejectedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ACCESSREQUESTREJECTED_EVENT, log);
                AccessRequestRejectedEventResponse typedResponse = new AccessRequestRejectedEventResponse();
                typedResponse.log = log;
                typedResponse._consumer = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._provider = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse._id = (byte[]) eventValues.getIndexedValues().get(2).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<AccessRequestRejectedEventResponse> accessRequestRejectedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ACCESSREQUESTREJECTED_EVENT));
        return accessRequestRejectedEventFlowable(filter);
    }

    public List<AccessRequestRevokedEventResponse> getAccessRequestRevokedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(ACCESSREQUESTREVOKED_EVENT, transactionReceipt);
        ArrayList<AccessRequestRevokedEventResponse> responses = new ArrayList<AccessRequestRevokedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AccessRequestRevokedEventResponse typedResponse = new AccessRequestRevokedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._consumer = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._provider = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse._id = (byte[]) eventValues.getIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<AccessRequestRevokedEventResponse> accessRequestRevokedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, AccessRequestRevokedEventResponse>() {
            @Override
            public AccessRequestRevokedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ACCESSREQUESTREVOKED_EVENT, log);
                AccessRequestRevokedEventResponse typedResponse = new AccessRequestRevokedEventResponse();
                typedResponse.log = log;
                typedResponse._consumer = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._provider = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse._id = (byte[]) eventValues.getIndexedValues().get(2).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<AccessRequestRevokedEventResponse> accessRequestRevokedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ACCESSREQUESTREVOKED_EVENT));
        return accessRequestRevokedEventFlowable(filter);
    }

    public List<EncryptedTokenPublishedEventResponse> getEncryptedTokenPublishedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(ENCRYPTEDTOKENPUBLISHED_EVENT, transactionReceipt);
        ArrayList<EncryptedTokenPublishedEventResponse> responses = new ArrayList<EncryptedTokenPublishedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            EncryptedTokenPublishedEventResponse typedResponse = new EncryptedTokenPublishedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._id = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._encryptedAccessToken = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<EncryptedTokenPublishedEventResponse> encryptedTokenPublishedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, EncryptedTokenPublishedEventResponse>() {
            @Override
            public EncryptedTokenPublishedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ENCRYPTEDTOKENPUBLISHED_EVENT, log);
                EncryptedTokenPublishedEventResponse typedResponse = new EncryptedTokenPublishedEventResponse();
                typedResponse.log = log;
                typedResponse._id = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._encryptedAccessToken = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<EncryptedTokenPublishedEventResponse> encryptedTokenPublishedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ENCRYPTEDTOKENPUBLISHED_EVENT));
        return encryptedTokenPublishedEventFlowable(filter);
    }

    public List<AccessRequestDeliveredEventResponse> getAccessRequestDeliveredEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(ACCESSREQUESTDELIVERED_EVENT, transactionReceipt);
        ArrayList<AccessRequestDeliveredEventResponse> responses = new ArrayList<AccessRequestDeliveredEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AccessRequestDeliveredEventResponse typedResponse = new AccessRequestDeliveredEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._consumer = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._provider = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse._id = (byte[]) eventValues.getIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<AccessRequestDeliveredEventResponse> accessRequestDeliveredEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, AccessRequestDeliveredEventResponse>() {
            @Override
            public AccessRequestDeliveredEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ACCESSREQUESTDELIVERED_EVENT, log);
                AccessRequestDeliveredEventResponse typedResponse = new AccessRequestDeliveredEventResponse();
                typedResponse.log = log;
                typedResponse._consumer = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._provider = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse._id = (byte[]) eventValues.getIndexedValues().get(2).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<AccessRequestDeliveredEventResponse> accessRequestDeliveredEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ACCESSREQUESTDELIVERED_EVENT));
        return accessRequestDeliveredEventFlowable(filter);
    }

    public RemoteCall<TransactionReceipt> initiateAccessRequest(byte[] resourceId, String provider, String pubKey, BigInteger timeout) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_INITIATEACCESSREQUEST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(resourceId), 
                new org.web3j.abi.datatypes.Address(provider), 
                new org.web3j.abi.datatypes.Utf8String(pubKey), 
                new org.web3j.abi.datatypes.generated.Uint256(timeout)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> commitAccessRequest(byte[] id, Boolean isAvailable, BigInteger expirationDate, String discovery, String permissions, String accessAgreementRef, String accessAgreementType) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_COMMITACCESSREQUEST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id), 
                new org.web3j.abi.datatypes.Bool(isAvailable), 
                new org.web3j.abi.datatypes.generated.Uint256(expirationDate), 
                new org.web3j.abi.datatypes.Utf8String(discovery), 
                new org.web3j.abi.datatypes.Utf8String(permissions), 
                new org.web3j.abi.datatypes.Utf8String(accessAgreementRef), 
                new org.web3j.abi.datatypes.Utf8String(accessAgreementType)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> cancelAccessRequest(byte[] id) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_CANCELACCESSREQUEST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> deliverAccessToken(byte[] id, byte[] encryptedAccessToken) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_DELIVERACCESSTOKEN, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id), 
                new org.web3j.abi.datatypes.DynamicBytes(encryptedAccessToken)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<String> getTempPubKey(byte[] id) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_GETTEMPPUBKEY, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Utf8String>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteCall<byte[]> getEncryptedAccessToken(byte[] id) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_GETENCRYPTEDACCESSTOKEN, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<DynamicBytes>() {}));
        return executeRemoteCallSingleValueReturn(function, byte[].class);
    }

    public RemoteCall<Boolean> verifySignature(String _addr, byte[] msgHash, BigInteger v, byte[] r, byte[] s) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_VERIFYSIGNATURE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_addr), 
                new org.web3j.abi.datatypes.generated.Bytes32(msgHash), 
                new org.web3j.abi.datatypes.generated.Uint8(v), 
                new org.web3j.abi.datatypes.generated.Bytes32(r), 
                new org.web3j.abi.datatypes.generated.Bytes32(s)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<TransactionReceipt> verifyAccessTokenDelivery(byte[] id, String _addr, byte[] msgHash, BigInteger v, byte[] r, byte[] s) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
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

    public RemoteCall<BigInteger> statusOfAccessRequest(byte[] id) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_STATUSOFACCESSREQUEST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(id)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    @Deprecated
    public static OceanAuth load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new OceanAuth(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static OceanAuth load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new OceanAuth(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static OceanAuth load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new OceanAuth(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static OceanAuth load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new OceanAuth(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<OceanAuth> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider, String _marketAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddress)));
        return deployRemoteCall(OceanAuth.class, web3j, credentials, contractGasProvider, BINARY, encodedConstructor);
    }

    public static RemoteCall<OceanAuth> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider, String _marketAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddress)));
        return deployRemoteCall(OceanAuth.class, web3j, transactionManager, contractGasProvider, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<OceanAuth> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit, String _marketAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddress)));
        return deployRemoteCall(OceanAuth.class, web3j, credentials, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<OceanAuth> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit, String _marketAddress) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_marketAddress)));
        return deployRemoteCall(OceanAuth.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    protected String getStaticDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static String getPreviouslyDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static class AccessConsentRequestedEventResponse {
        public Log log;

        public String _consumer;

        public String _provider;

        public byte[] _resourceId;

        public byte[] _id;

        public BigInteger _timeout;

        public String _pubKey;
    }

    public static class AccessRequestCommittedEventResponse {
        public Log log;

        public byte[] _id;

        public BigInteger _expirationDate;

        public String _discovery;

        public String _permissions;

        public String _accessAgreementRef;
    }

    public static class AccessRequestRejectedEventResponse {
        public Log log;

        public String _consumer;

        public String _provider;

        public byte[] _id;
    }

    public static class AccessRequestRevokedEventResponse {
        public Log log;

        public String _consumer;

        public String _provider;

        public byte[] _id;
    }

    public static class EncryptedTokenPublishedEventResponse {
        public Log log;

        public byte[] _id;

        public byte[] _encryptedAccessToken;
    }

    public static class AccessRequestDeliveredEventResponse {
        public Log log;

        public String _consumer;

        public String _provider;

        public byte[] _id;
    }
}
