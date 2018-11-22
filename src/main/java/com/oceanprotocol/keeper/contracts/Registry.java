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
import org.web3j.tuples.generated.Tuple5;
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
public class Registry extends Contract {
    private static final String BINARY = "0x608060405234801561001057600080fd5b506040516040806118e883398101604052805160209091015160028054600160a060020a03938416600160a060020a03199182161790915560038054939092169216919091179055611881806100676000396000f3006080604052600436106101065763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166301a5e3fe811461010b578063040cf020146101375780630ca36263146101545780631b7bbecb1461016c5780631de26e161461018457806343cffefe1461019f578063691a38ab146101d557806377609a41146101ed57806386bb8f371461020557806389bb55c7146102205780638a59eb56146102485780638cf8151f146102605780638f1d377614610278578063a5ba3b1e146102c3578063a7aad3db146102e7578063c18b8db41461030e578063c8187cf114610359578063fc0c546a14610371578063fce1ccca146103a2575b600080fd5b34801561011757600080fd5b506101236004356103b7565b604080519115158252519081900360200190f35b34801561014357600080fd5b506101526004356024356103d3565b005b34801561016057600080fd5b50610152600435610508565b34801561017857600080fd5b506101236004356105bb565b34801561019057600080fd5b506101526004356024356105fe565b3480156101ab57600080fd5b506101c3600480359060248035908101910135610727565b60408051918252519081900360200190f35b3480156101e157600080fd5b50610123600435610aff565b3480156101f957600080fd5b50610123600435610b8d565b34801561021157600080fd5b50610152600435602435610c4d565b34801561022c57600080fd5b5061015260048035906024803591604435918201910135610e50565b34801561025457600080fd5b50610152600435610ff5565b34801561026c57600080fd5b5061012360043561102b565b34801561028457600080fd5b5061029060043561103e565b60408051958652600160a060020a0390941660208601529115158484015260608401526080830152519081900360a00190f35b3480156102cf57600080fd5b50610123600435600160a060020a036024351661107a565b3480156102f357600080fd5b506101c3600160a060020a03600435166024356044356110a7565b34801561031a57600080fd5b50610326600435611176565b604080519586529315156020860152600160a060020a039092168484015260608401526080830152519081900360a00190f35b34801561036557600080fd5b506101c36004356111b1565b34801561037d57600080fd5b50610386611346565b60408051600160a060020a039092168252519081900360200190f35b3480156103ae57600080fd5b50610386611355565b6000818152600160208190526040909120015460ff165b919050565b6000828152600160208190526040909120908101546101009004600160a060020a0316331461040157600080fd5b600281015482111561041257600080fd5b600a828260020154031015151561042857600080fd5b600280820180548490039055546040805160e060020a63a9059cbb028152336004820152602481018590529051600160a060020a039092169163a9059cbb916044808201926020929091908290030181600087803b15801561048957600080fd5b505af115801561049d573d6000803e3d6000fd5b505050506040513d60208110156104b357600080fd5b505115156104c057600080fd5b60028101546040805184815260208101929092528051339286927f9d9ed58779badf90c56d72f3b54def9f73dc875d8f86416c8334b55328c6c10692918290030190a3505050565b6000818152600160208190526040909120908101546101009004600160a060020a0316331461053657600080fd5b61053f826103b7565b151561054a57600080fd5b600381015415806105785750600381015460009081526020819052604090206001015460a060020a900460ff165b151561058357600080fd5b61058c82611364565b60405182907f8a51904a50ce4451be09dc08242bd2d5565b05cf0f4f5aa88c77f96fdf538b4290600090a25050565b60008181526001602052604081206003015481811180156105f5575060008181526020819052604090206001015460a060020a900460ff16155b91505b50919050565b6000828152600160208190526040909120908101546101009004600160a060020a0316331461062c57600080fd5b600280820180548401905554604080517f23b872dd000000000000000000000000000000000000000000000000000000008152336004820152306024820152604481018590529051600160a060020a03909216916323b872dd916064808201926020929091908290030181600087803b1580156106a857600080fd5b505af11580156106bc573d6000803e3d6000fd5b505050506040513d60208110156106d257600080fd5b505115156106df57600080fd5b60028101546040805184815260208101929092528051339286927ff63fcfb210c709154f0260502b2586fcee5550d17dc828be3127ccdedec620ab92918290030190a3505050565b6000838152600160205260408120600a8280806107438961102b565b806107525750600185015460ff165b151561075d57600080fd5b6003850154158061078b5750600385015460009081526020819052604090206001015460a060020a900460ff165b151561079657600080fd5b83856002015410156107df576107ab89611364565b60405189907f4a9ee335af9e32f32f2229943dc7a0d3b5adf7e4c5c4062b372eae8c476d928690600090a260009550610af3565b600354604080517f32ed3d6000000000000000000000000000000000000000000000000000000000815260326004820152600a6024820181905260448201529051600160a060020a03909216916332ed3d60916064808201926020929091908290030181600087803b15801561085457600080fd5b505af1158015610868573d6000803e3d6000fd5b505050506040513d602081101561087e57600080fd5b50516040805160a08101825260646032880281900482523360208084018281526000858701818152606087018d8152608088018381528a8452838652898420985189559351600189018054935173ffffffffffffffffffffffffffffffffffffffff19909416600160a060020a039283161774ff0000000000000000000000000000000000000000191660a060020a9415159490940293909317909255516002808901919091559251600397880155958d018890558c820180548d90039055905486517f23b872dd0000000000000000000000000000000000000000000000000000000081526004810194909452306024850152604484018c9052955196995094909316946323b872dd948284019493919283900390910190829087803b1580156109a857600080fd5b505af11580156109bc573d6000803e3d6000fd5b505050506040513d60208110156109d257600080fd5b505115156109df57600080fd5b600354604080517f6148fed5000000000000000000000000000000000000000000000000000000008152600481018690529051600160a060020a0390921691636148fed59160248082019260a0929091908290030181600087803b158015610a4657600080fd5b505af1158015610a5a573d6000803e3d6000fd5b505050506040513d60a0811015610a7057600080fd5b508051602091820151604080518781529081018390526060810182905260809381018481529381018b9052919450925033918b917ff98a08756a3603420a080d66764f73deb1e30896c315cfed03e17f88f5eb30f79187918d918d91899189919060a0820186868082843760405192018290039850909650505050505050a38295505b50505050509392505050565b600081815260016020526040812060030154610b1a8361102b565b8015610b33575060008381526001602052604090205442115b8015610b455750610b43836103b7565b155b8015610b765750801580610b765750600081815260208190526040902060019081015460a060020a900460ff161515145b15610b8457600191506105f8565b50600092915050565b600081815260016020526040812060030154610ba8836105bb565b1515610bb357600080fd5b600354604080517fee684830000000000000000000000000000000000000000000000000000000008152600481018490529051600160a060020a039092169163ee684830916024808201926020929091908290030181600087803b158015610c1a57600080fd5b505af1158015610c2e573d6000803e3d6000fd5b505050506040513d6020811015610c4457600080fd5b50519392505050565b600082815260208181526040808320338452600401909152812054819060ff1615610c7757600080fd5b600084815260208190526040902060019081015460a060020a900460ff16151514610ca157600080fd5b600354604080517fb43bd06900000000000000000000000000000000000000000000000000000000815233600482015260248101879052604481018690529051600160a060020a039092169163b43bd069916064808201926020929091908290030181600087803b158015610d1557600080fd5b505af1158015610d29573d6000803e3d6000fd5b505050506040513d6020811015610d3f57600080fd5b50519150610d4e3385856110a7565b6000858152602081815260408083206003810180548890039055805485900381553380855260049182018452828520805460ff19166001179055600254835160e060020a63a9059cbb02815292830191909152602482018690529151949550600160a060020a039091169363a9059cbb93604480840194938390030190829087803b158015610ddc57600080fd5b505af1158015610df0573d6000803e3d6000fd5b505050506040513d6020811015610e0657600080fd5b50511515610e1357600080fd5b604080518281529051339186917f6f4c982acc31b0af2cf1dc1556f21c0325d893782d65e83c68a5534a33f599579181900360200190a350505050565b6000610e5b856103b7565b15610e6557600080fd5b610e6e8561102b565b15610e7857600080fd5b600a841015610e8657600080fd5b506000848152600160208190526040909120908101805474ffffffffffffffffffffffffffffffffffffffff0019163361010002179055610ec842603c6114db565b81556002808201859055546001820154604080517f23b872dd000000000000000000000000000000000000000000000000000000008152610100909204600160a060020a0390811660048401523060248401526044830188905290519216916323b872dd916064808201926020929091908290030181600087803b158015610f4f57600080fd5b505af1158015610f63573d6000803e3d6000fd5b505050506040513d6020811015610f7957600080fd5b50511515610f8657600080fd5b805460408051868152602081018390526060918101828152918101859052339288927fa27f550c3c7a7c6d8369e5383fdc7a3b4850d8ce9e20066f9d496f6989f00864928992918991899160808201848480828437604051920182900397509095505050505050a35050505050565b610ffe81610aff565b156110115761100c816114f1565b611028565b61101a81610b8d565b156101065761100c81611559565b50565b6000908152600160205260408120541190565b60006020819052908152604090208054600182015460028301546003909301549192600160a060020a0382169260a060020a90920460ff169185565b600082815260208181526040808320600160a060020a038516845260040190915290205460ff1692915050565b6000828152602081815260408083206003808201549154905483517fb43bd069000000000000000000000000000000000000000000000000000000008152600160a060020a038a81166004830152602482018a905260448201899052945193959294879492169263b43bd0699260648084019382900301818787803b15801561112f57600080fd5b505af1158015611143573d6000803e3d6000fd5b505050506040513d602081101561115957600080fd5b505190508282820281151561116a57fe5b04979650505050505050565b6001602081905260009182526040909120805491810154600282015460039092015460ff821692610100909204600160a060020a0316919085565b60008181526020819052604081206001015460a060020a900460ff161580156112695750600354604080517fee684830000000000000000000000000000000000000000000000000000000008152600481018590529051600160a060020a039092169163ee684830916024808201926020929091908290030181600087803b15801561123c57600080fd5b505af1158015611250573d6000803e3d6000fd5b505050506040513d602081101561126657600080fd5b50515b151561127457600080fd5b600354604080517f053e71a6000000000000000000000000000000000000000000000000000000008152600481018590529051600160a060020a039092169163053e71a6916024808201926020929091908290030181600087803b1580156112db57600080fd5b505af11580156112ef573d6000803e3d6000fd5b505050506040513d602081101561130557600080fd5b5051151561132857506000818152602081905260409020600290810154026103ce565b50600090815260208190526040902080546002918201549091020390565b600254600160a060020a031681565b600354600160a060020a031681565b6000818152600160208190526040822090810154909190819060ff16156113b55760405184907fd1ffb796b7108387b2f02adf47b4b81a1690cf2a190422c87a4f670780103e6390600090a26113e1565b60405184907f2e5ec035f6eac8ff1cf7cdf36cfeca7c85413f9f67652dc2c13d20f337204a2690600090a25b50506001818101546002808401546000868152602085905260408120818155948501805474ffffffffffffffffffffffffffffffffffffffffff191690559184018290556003909301819055610100909104600160a060020a031691908111156114d5576002546040805160e060020a63a9059cbb028152600160a060020a038581166004830152602482018590529151919092169163a9059cbb9160448083019260209291908290030181600087803b15801561149e57600080fd5b505af11580156114b2573d6000803e3d6000fd5b505050506040513d60208110156114c857600080fd5b505115156114d557600080fd5b50505050565b6000828201838110156114ea57fe5b9392505050565b6000818152600160208190526040909120015460ff1615156115395760405181907fa7bc1d57d9006d9d248707c7b6828c1bab8c51719cc06d78c82a3ee891ef967c90600090a25b60009081526001602081905260409091208101805460ff19169091179055565b60008181526001602052604081206003015490611575826111b1565b600083815260208181526040808320600101805474ff0000000000000000000000000000000000000000191660a060020a17905560035481517f053e71a6000000000000000000000000000000000000000000000000000000008152600481018890529151949550600160a060020a03169363053e71a693602480840194938390030190829087803b15801561160a57600080fd5b505af115801561161e573d6000803e3d6000fd5b505050506040513d602081101561163457600080fd5b5051600083815260208181526040808320600390810194909455925483517f49403183000000000000000000000000000000000000000000000000000000008152600481018790529351600160a060020a039091169363494031839360248083019493928390030190829087803b1580156116ae57600080fd5b505af11580156116c2573d6000803e3d6000fd5b505050506040513d60208110156116d857600080fd5b505115611756576116e8836114f1565b60008381526001602090815260408083206002018054850190558483528282529182902080546003909101548351918252918101919091528151849286927fc4497224aa78dd50c9b3e344aab02596201ca1e6dca4057a91a6c02f83f4f6c1929081900390910190a3611850565b61175f83611364565b60025460008381526020818152604080832060010154815160e060020a63a9059cbb028152600160a060020a03918216600482015260248101879052915194169363a9059cbb93604480840194938390030190829087803b1580156117c357600080fd5b505af11580156117d7573d6000803e3d6000fd5b505050506040513d60208110156117ed57600080fd5b505115156117fa57600080fd5b6000828152602081815260409182902080546003909101548351918252918101919091528151849286927f362a12431f779a2baff4f77f75ba7960ae993a5c41b425df11f7fd0af2b9cbe6929081900390910190a35b5050505600a165627a7a7230582069ea224f3732ea49e3c777561c4620ef361af58a041c2c0f554b69189be225880029";

    public static final String FUNC_CHALLENGES = "challenges";

    public static final String FUNC_LISTINGS = "listings";

    public static final String FUNC_TOKEN = "token";

    public static final String FUNC_VOTING = "voting";

    public static final String FUNC_APPLY = "apply";

    public static final String FUNC_DEPOSIT = "deposit";

    public static final String FUNC_WITHDRAW = "withdraw";

    public static final String FUNC_EXIT = "exit";

    public static final String FUNC_CHALLENGE = "challenge";

    public static final String FUNC_UPDATESTATUS = "updateStatus";

    public static final String FUNC_CLAIMREWARD = "claimReward";

    public static final String FUNC_VOTERREWARD = "voterReward";

    public static final String FUNC_CANBEWHITELISTED = "canBeWhitelisted";

    public static final String FUNC_ISWHITELISTED = "isWhitelisted";

    public static final String FUNC_APPWASMADE = "appWasMade";

    public static final String FUNC_CHALLENGEEXISTS = "challengeExists";

    public static final String FUNC_CHALLENGECANBERESOLVED = "challengeCanBeResolved";

    public static final String FUNC_DETERMINEREWARD = "determineReward";

    public static final String FUNC_TOKENCLAIMS = "tokenClaims";

    public static final Event _APPLICATION_EVENT = new Event("_Application", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event _CHALLENGE_EVENT = new Event("_Challenge", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event _DEPOSIT_EVENT = new Event("_Deposit", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event _WITHDRAWAL_EVENT = new Event("_Withdrawal", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event _APPLICATIONWHITELISTED_EVENT = new Event("_ApplicationWhitelisted", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}));
    ;

    public static final Event _APPLICATIONREMOVED_EVENT = new Event("_ApplicationRemoved", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}));
    ;

    public static final Event _LISTINGREMOVED_EVENT = new Event("_ListingRemoved", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}));
    ;

    public static final Event _LISTINGWITHDRAWN_EVENT = new Event("_ListingWithdrawn", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}));
    ;

    public static final Event _TOUCHANDREMOVED_EVENT = new Event("_TouchAndRemoved", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}));
    ;

    public static final Event _CHALLENGEFAILED_EVENT = new Event("_ChallengeFailed", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Uint256>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}));
    ;

    public static final Event _CHALLENGESUCCEEDED_EVENT = new Event("_ChallengeSucceeded", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Uint256>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}));
    ;

    public static final Event _REWARDCLAIMED_EVENT = new Event("_RewardClaimed", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>(true) {}, new TypeReference<Uint256>() {}, new TypeReference<Address>(true) {}));
    ;

    protected static final HashMap<String, String> _addresses;

    static {
        _addresses = new HashMap<String, String>();
        _addresses.put("1528723162197", "0x66fc0941581b37037f37c3981a018ea2cfe0beb1");
        _addresses.put("1530006110174", "0xc1d9ff159d8ea247e98c19748c5f99800db7403b");
        _addresses.put("1533040880765", "0x78a26a85289e695de0721469704f96244c425c48");
    }

    @Deprecated
    protected Registry(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected Registry(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected Registry(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected Registry(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public RemoteCall<Tuple5<BigInteger, String, Boolean, BigInteger, BigInteger>> challenges(BigInteger param0) {
        final Function function = new Function(FUNC_CHALLENGES, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}, new TypeReference<Address>() {}, new TypeReference<Bool>() {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}));
        return new RemoteCall<Tuple5<BigInteger, String, Boolean, BigInteger, BigInteger>>(
                new Callable<Tuple5<BigInteger, String, Boolean, BigInteger, BigInteger>>() {
                    @Override
                    public Tuple5<BigInteger, String, Boolean, BigInteger, BigInteger> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple5<BigInteger, String, Boolean, BigInteger, BigInteger>(
                                (BigInteger) results.get(0).getValue(), 
                                (String) results.get(1).getValue(), 
                                (Boolean) results.get(2).getValue(), 
                                (BigInteger) results.get(3).getValue(), 
                                (BigInteger) results.get(4).getValue());
                    }
                });
    }

    public RemoteCall<Tuple5<BigInteger, Boolean, String, BigInteger, BigInteger>> listings(byte[] param0) {
        final Function function = new Function(FUNC_LISTINGS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}, new TypeReference<Bool>() {}, new TypeReference<Address>() {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}));
        return new RemoteCall<Tuple5<BigInteger, Boolean, String, BigInteger, BigInteger>>(
                new Callable<Tuple5<BigInteger, Boolean, String, BigInteger, BigInteger>>() {
                    @Override
                    public Tuple5<BigInteger, Boolean, String, BigInteger, BigInteger> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple5<BigInteger, Boolean, String, BigInteger, BigInteger>(
                                (BigInteger) results.get(0).getValue(), 
                                (Boolean) results.get(1).getValue(), 
                                (String) results.get(2).getValue(), 
                                (BigInteger) results.get(3).getValue(), 
                                (BigInteger) results.get(4).getValue());
                    }
                });
    }

    public RemoteCall<String> token() {
        final Function function = new Function(FUNC_TOKEN, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteCall<String> voting() {
        final Function function = new Function(FUNC_VOTING, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public List<_ApplicationEventResponse> get_ApplicationEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_APPLICATION_EVENT, transactionReceipt);
        ArrayList<_ApplicationEventResponse> responses = new ArrayList<_ApplicationEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _ApplicationEventResponse typedResponse = new _ApplicationEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.applicant = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.deposit = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.appEndDate = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse.data = (String) eventValues.getNonIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_ApplicationEventResponse> _ApplicationEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _ApplicationEventResponse>() {
            @Override
            public _ApplicationEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_APPLICATION_EVENT, log);
                _ApplicationEventResponse typedResponse = new _ApplicationEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.applicant = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.deposit = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse.appEndDate = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
                typedResponse.data = (String) eventValues.getNonIndexedValues().get(2).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_ApplicationEventResponse> _ApplicationEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_APPLICATION_EVENT));
        return _ApplicationEventFlowable(filter);
    }

    public List<_ChallengeEventResponse> get_ChallengeEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_CHALLENGE_EVENT, transactionReceipt);
        ArrayList<_ChallengeEventResponse> responses = new ArrayList<_ChallengeEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _ChallengeEventResponse typedResponse = new _ChallengeEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.challenger = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.challengeID = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.data = (String) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse.commitEndDate = (BigInteger) eventValues.getNonIndexedValues().get(2).getValue();
            typedResponse.revealEndDate = (BigInteger) eventValues.getNonIndexedValues().get(3).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_ChallengeEventResponse> _ChallengeEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _ChallengeEventResponse>() {
            @Override
            public _ChallengeEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_CHALLENGE_EVENT, log);
                _ChallengeEventResponse typedResponse = new _ChallengeEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.challenger = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.challengeID = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse.data = (String) eventValues.getNonIndexedValues().get(1).getValue();
                typedResponse.commitEndDate = (BigInteger) eventValues.getNonIndexedValues().get(2).getValue();
                typedResponse.revealEndDate = (BigInteger) eventValues.getNonIndexedValues().get(3).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_ChallengeEventResponse> _ChallengeEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_CHALLENGE_EVENT));
        return _ChallengeEventFlowable(filter);
    }

    public List<_DepositEventResponse> get_DepositEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_DEPOSIT_EVENT, transactionReceipt);
        ArrayList<_DepositEventResponse> responses = new ArrayList<_DepositEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _DepositEventResponse typedResponse = new _DepositEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.owner = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.added = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.newTotal = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_DepositEventResponse> _DepositEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _DepositEventResponse>() {
            @Override
            public _DepositEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_DEPOSIT_EVENT, log);
                _DepositEventResponse typedResponse = new _DepositEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.owner = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.added = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse.newTotal = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_DepositEventResponse> _DepositEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_DEPOSIT_EVENT));
        return _DepositEventFlowable(filter);
    }

    public List<_WithdrawalEventResponse> get_WithdrawalEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_WITHDRAWAL_EVENT, transactionReceipt);
        ArrayList<_WithdrawalEventResponse> responses = new ArrayList<_WithdrawalEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _WithdrawalEventResponse typedResponse = new _WithdrawalEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.owner = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.withdrew = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.newTotal = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_WithdrawalEventResponse> _WithdrawalEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _WithdrawalEventResponse>() {
            @Override
            public _WithdrawalEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_WITHDRAWAL_EVENT, log);
                _WithdrawalEventResponse typedResponse = new _WithdrawalEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.owner = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.withdrew = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse.newTotal = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_WithdrawalEventResponse> _WithdrawalEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_WITHDRAWAL_EVENT));
        return _WithdrawalEventFlowable(filter);
    }

    public List<_ApplicationWhitelistedEventResponse> get_ApplicationWhitelistedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_APPLICATIONWHITELISTED_EVENT, transactionReceipt);
        ArrayList<_ApplicationWhitelistedEventResponse> responses = new ArrayList<_ApplicationWhitelistedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _ApplicationWhitelistedEventResponse typedResponse = new _ApplicationWhitelistedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_ApplicationWhitelistedEventResponse> _ApplicationWhitelistedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _ApplicationWhitelistedEventResponse>() {
            @Override
            public _ApplicationWhitelistedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_APPLICATIONWHITELISTED_EVENT, log);
                _ApplicationWhitelistedEventResponse typedResponse = new _ApplicationWhitelistedEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_ApplicationWhitelistedEventResponse> _ApplicationWhitelistedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_APPLICATIONWHITELISTED_EVENT));
        return _ApplicationWhitelistedEventFlowable(filter);
    }

    public List<_ApplicationRemovedEventResponse> get_ApplicationRemovedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_APPLICATIONREMOVED_EVENT, transactionReceipt);
        ArrayList<_ApplicationRemovedEventResponse> responses = new ArrayList<_ApplicationRemovedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _ApplicationRemovedEventResponse typedResponse = new _ApplicationRemovedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_ApplicationRemovedEventResponse> _ApplicationRemovedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _ApplicationRemovedEventResponse>() {
            @Override
            public _ApplicationRemovedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_APPLICATIONREMOVED_EVENT, log);
                _ApplicationRemovedEventResponse typedResponse = new _ApplicationRemovedEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_ApplicationRemovedEventResponse> _ApplicationRemovedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_APPLICATIONREMOVED_EVENT));
        return _ApplicationRemovedEventFlowable(filter);
    }

    public List<_ListingRemovedEventResponse> get_ListingRemovedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_LISTINGREMOVED_EVENT, transactionReceipt);
        ArrayList<_ListingRemovedEventResponse> responses = new ArrayList<_ListingRemovedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _ListingRemovedEventResponse typedResponse = new _ListingRemovedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_ListingRemovedEventResponse> _ListingRemovedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _ListingRemovedEventResponse>() {
            @Override
            public _ListingRemovedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_LISTINGREMOVED_EVENT, log);
                _ListingRemovedEventResponse typedResponse = new _ListingRemovedEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_ListingRemovedEventResponse> _ListingRemovedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_LISTINGREMOVED_EVENT));
        return _ListingRemovedEventFlowable(filter);
    }

    public List<_ListingWithdrawnEventResponse> get_ListingWithdrawnEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_LISTINGWITHDRAWN_EVENT, transactionReceipt);
        ArrayList<_ListingWithdrawnEventResponse> responses = new ArrayList<_ListingWithdrawnEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _ListingWithdrawnEventResponse typedResponse = new _ListingWithdrawnEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_ListingWithdrawnEventResponse> _ListingWithdrawnEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _ListingWithdrawnEventResponse>() {
            @Override
            public _ListingWithdrawnEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_LISTINGWITHDRAWN_EVENT, log);
                _ListingWithdrawnEventResponse typedResponse = new _ListingWithdrawnEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_ListingWithdrawnEventResponse> _ListingWithdrawnEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_LISTINGWITHDRAWN_EVENT));
        return _ListingWithdrawnEventFlowable(filter);
    }

    public List<_TouchAndRemovedEventResponse> get_TouchAndRemovedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_TOUCHANDREMOVED_EVENT, transactionReceipt);
        ArrayList<_TouchAndRemovedEventResponse> responses = new ArrayList<_TouchAndRemovedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _TouchAndRemovedEventResponse typedResponse = new _TouchAndRemovedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_TouchAndRemovedEventResponse> _TouchAndRemovedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _TouchAndRemovedEventResponse>() {
            @Override
            public _TouchAndRemovedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_TOUCHANDREMOVED_EVENT, log);
                _TouchAndRemovedEventResponse typedResponse = new _TouchAndRemovedEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_TouchAndRemovedEventResponse> _TouchAndRemovedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_TOUCHANDREMOVED_EVENT));
        return _TouchAndRemovedEventFlowable(filter);
    }

    public List<_ChallengeFailedEventResponse> get_ChallengeFailedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_CHALLENGEFAILED_EVENT, transactionReceipt);
        ArrayList<_ChallengeFailedEventResponse> responses = new ArrayList<_ChallengeFailedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _ChallengeFailedEventResponse typedResponse = new _ChallengeFailedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.challengeID = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.rewardPool = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.totalTokens = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_ChallengeFailedEventResponse> _ChallengeFailedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _ChallengeFailedEventResponse>() {
            @Override
            public _ChallengeFailedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_CHALLENGEFAILED_EVENT, log);
                _ChallengeFailedEventResponse typedResponse = new _ChallengeFailedEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.challengeID = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.rewardPool = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse.totalTokens = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_ChallengeFailedEventResponse> _ChallengeFailedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_CHALLENGEFAILED_EVENT));
        return _ChallengeFailedEventFlowable(filter);
    }

    public List<_ChallengeSucceededEventResponse> get_ChallengeSucceededEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_CHALLENGESUCCEEDED_EVENT, transactionReceipt);
        ArrayList<_ChallengeSucceededEventResponse> responses = new ArrayList<_ChallengeSucceededEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _ChallengeSucceededEventResponse typedResponse = new _ChallengeSucceededEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.challengeID = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.rewardPool = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.totalTokens = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_ChallengeSucceededEventResponse> _ChallengeSucceededEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _ChallengeSucceededEventResponse>() {
            @Override
            public _ChallengeSucceededEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_CHALLENGESUCCEEDED_EVENT, log);
                _ChallengeSucceededEventResponse typedResponse = new _ChallengeSucceededEventResponse();
                typedResponse.log = log;
                typedResponse.listingHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.challengeID = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.rewardPool = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse.totalTokens = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_ChallengeSucceededEventResponse> _ChallengeSucceededEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_CHALLENGESUCCEEDED_EVENT));
        return _ChallengeSucceededEventFlowable(filter);
    }

    public List<_RewardClaimedEventResponse> get_RewardClaimedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(_REWARDCLAIMED_EVENT, transactionReceipt);
        ArrayList<_RewardClaimedEventResponse> responses = new ArrayList<_RewardClaimedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            _RewardClaimedEventResponse typedResponse = new _RewardClaimedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.challengeID = (BigInteger) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.voter = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.reward = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<_RewardClaimedEventResponse> _RewardClaimedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, _RewardClaimedEventResponse>() {
            @Override
            public _RewardClaimedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(_REWARDCLAIMED_EVENT, log);
                _RewardClaimedEventResponse typedResponse = new _RewardClaimedEventResponse();
                typedResponse.log = log;
                typedResponse.challengeID = (BigInteger) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.voter = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.reward = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<_RewardClaimedEventResponse> _RewardClaimedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(_REWARDCLAIMED_EVENT));
        return _RewardClaimedEventFlowable(filter);
    }

    public RemoteCall<TransactionReceipt> apply(byte[] _listingHash, BigInteger _amount, String _data) {
        final Function function = new Function(
                FUNC_APPLY, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash), 
                new org.web3j.abi.datatypes.generated.Uint256(_amount), 
                new org.web3j.abi.datatypes.Utf8String(_data)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> deposit(byte[] _listingHash, BigInteger _amount) {
        final Function function = new Function(
                FUNC_DEPOSIT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash), 
                new org.web3j.abi.datatypes.generated.Uint256(_amount)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> withdraw(byte[] _listingHash, BigInteger _amount) {
        final Function function = new Function(
                FUNC_WITHDRAW, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash), 
                new org.web3j.abi.datatypes.generated.Uint256(_amount)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> exit(byte[] _listingHash) {
        final Function function = new Function(
                FUNC_EXIT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> challenge(byte[] _listingHash, String _data) {
        final Function function = new Function(
                FUNC_CHALLENGE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash), 
                new org.web3j.abi.datatypes.Utf8String(_data)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> updateStatus(byte[] _listingHash) {
        final Function function = new Function(
                FUNC_UPDATESTATUS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> claimReward(BigInteger _challengeID, BigInteger _salt) {
        final Function function = new Function(
                FUNC_CLAIMREWARD, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_challengeID), 
                new org.web3j.abi.datatypes.generated.Uint256(_salt)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<BigInteger> voterReward(String _voter, BigInteger _challengeID, BigInteger _salt) {
        final Function function = new Function(FUNC_VOTERREWARD, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_voter), 
                new org.web3j.abi.datatypes.generated.Uint256(_challengeID), 
                new org.web3j.abi.datatypes.generated.Uint256(_salt)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public RemoteCall<Boolean> canBeWhitelisted(byte[] _listingHash) {
        final Function function = new Function(FUNC_CANBEWHITELISTED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<Boolean> isWhitelisted(byte[] _listingHash) {
        final Function function = new Function(FUNC_ISWHITELISTED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<Boolean> appWasMade(byte[] _listingHash) {
        final Function function = new Function(FUNC_APPWASMADE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<Boolean> challengeExists(byte[] _listingHash) {
        final Function function = new Function(FUNC_CHALLENGEEXISTS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<Boolean> challengeCanBeResolved(byte[] _listingHash) {
        final Function function = new Function(FUNC_CHALLENGECANBERESOLVED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteCall<BigInteger> determineReward(BigInteger _challengeID) {
        final Function function = new Function(FUNC_DETERMINEREWARD, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_challengeID)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public RemoteCall<Boolean> tokenClaims(BigInteger _challengeID, String _voter) {
        final Function function = new Function(FUNC_TOKENCLAIMS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_challengeID), 
                new org.web3j.abi.datatypes.Address(_voter)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    @Deprecated
    public static Registry load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new Registry(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static Registry load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new Registry(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static Registry load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new Registry(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static Registry load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new Registry(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<Registry> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider, String _tokenAddr, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddr), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(Registry.class, web3j, credentials, contractGasProvider, BINARY, encodedConstructor);
    }

    public static RemoteCall<Registry> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider, String _tokenAddr, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddr), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(Registry.class, web3j, transactionManager, contractGasProvider, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<Registry> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit, String _tokenAddr, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddr), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(Registry.class, web3j, credentials, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<Registry> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit, String _tokenAddr, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddr), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(Registry.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    protected String getStaticDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static String getPreviouslyDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static class _ApplicationEventResponse {
        public Log log;

        public byte[] listingHash;

        public String applicant;

        public BigInteger deposit;

        public BigInteger appEndDate;

        public String data;
    }

    public static class _ChallengeEventResponse {
        public Log log;

        public byte[] listingHash;

        public String challenger;

        public BigInteger challengeID;

        public String data;

        public BigInteger commitEndDate;

        public BigInteger revealEndDate;
    }

    public static class _DepositEventResponse {
        public Log log;

        public byte[] listingHash;

        public String owner;

        public BigInteger added;

        public BigInteger newTotal;
    }

    public static class _WithdrawalEventResponse {
        public Log log;

        public byte[] listingHash;

        public String owner;

        public BigInteger withdrew;

        public BigInteger newTotal;
    }

    public static class _ApplicationWhitelistedEventResponse {
        public Log log;

        public byte[] listingHash;
    }

    public static class _ApplicationRemovedEventResponse {
        public Log log;

        public byte[] listingHash;
    }

    public static class _ListingRemovedEventResponse {
        public Log log;

        public byte[] listingHash;
    }

    public static class _ListingWithdrawnEventResponse {
        public Log log;

        public byte[] listingHash;
    }

    public static class _TouchAndRemovedEventResponse {
        public Log log;

        public byte[] listingHash;
    }

    public static class _ChallengeFailedEventResponse {
        public Log log;

        public byte[] listingHash;

        public BigInteger challengeID;

        public BigInteger rewardPool;

        public BigInteger totalTokens;
    }

    public static class _ChallengeSucceededEventResponse {
        public Log log;

        public byte[] listingHash;

        public BigInteger challengeID;

        public BigInteger rewardPool;

        public BigInteger totalTokens;
    }

    public static class _RewardClaimedEventResponse {
        public Log log;

        public BigInteger challengeID;

        public String voter;

        public BigInteger reward;
    }
}
