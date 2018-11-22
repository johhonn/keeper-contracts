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
import org.web3j.tuples.generated.Tuple6;
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
public class OceanRegistry extends Contract {
    private static final String BINARY = "0x6080604052600c805460ff1916600117905534801561001d57600080fd5b506040516040806125d183398101604052805160209091015160008054600160a060020a03191633179055600160a060020a038216158015906100695750600454600160a060020a0316155b15156100fc57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f546f6b656e20636f6e7472616374206164647265737320697320696e76616c6960448201527f642e000000000000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b600160a060020a0381161580159061011d5750600554600160a060020a0316155b15156101b057604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f566f74696e6720636f6e7472616374206164647265737320697320696e76616c60448201527f69642e0000000000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b60048054600160a060020a03938416600160a060020a03199182161790915560058054929093169116179055678ac7230489e80000600655610e10600781905560088190556009556032600a819055600b556123c0806102116000396000f3006080604052600436106101275763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166301a5e3fe811461012c578063040cf020146101585780630ca36263146101755780631b7bbecb1461018d5780631de26e16146101a557806343cffefe146101c05780634de49e39146101f6578063691a38ab14610222578063715018a61461023a57806377609a411461024f57806386bb8f37146102675780638a59eb56146102825780638cf8151f1461029a5780638da5cb5b146102b257806390412295146102e3578063a5ba3b1e1461030a578063a5ea11da1461032e578063a7aad3db14610376578063ad90f7891461039d578063c8187cf1146103be578063ef960041146103d6578063f2fde38b146103ee575b600080fd5b34801561013857600080fd5b5061014460043561040f565b604080519115158252519081900360200190f35b34801561016457600080fd5b5061017360043560243561042a565b005b34801561018157600080fd5b506101736004356106ac565b34801561019957600080fd5b5061014460043561083f565b3480156101b157600080fd5b50610173600435602435610883565b3480156101cc57600080fd5b506101e4600480359060248035908101910135610a3c565b60408051918252519081900360200190f35b34801561020257600080fd5b506101736004803590602480359160443591606435908101910135610f39565b34801561022e57600080fd5b50610144600435611224565b34801561024657600080fd5b506101736112b2565b34801561025b57600080fd5b5061014460043561131e565b34801561027357600080fd5b50610173600435602435611429565b34801561028e57600080fd5b506101736004356116fe565b3480156102a657600080fd5b50610144600435611784565b3480156102be57600080fd5b506102c7611797565b60408051600160a060020a039092168252519081900360200190f35b3480156102ef57600080fd5b5061017360043560243560443560643560843560a4356117a6565b34801561031657600080fd5b50610144600435600160a060020a03602435166117fd565b34801561033a57600080fd5b5061034361182d565b604080519687526020870195909552858501939093526060850191909152608084015260a0830152519081900360c00190f35b34801561038257600080fd5b506101e4600160a060020a0360043516602435604435611871565b3480156103a957600080fd5b50610144600160a060020a0360043516611948565b3480156103ca57600080fd5b506101e4600435611a31565b3480156103e257600080fd5b50610173600435611c37565b3480156103fa57600080fd5b50610173600160a060020a0360043516611cf7565b60008181526002602052604090206001015460ff165b919050565b600082815260026020526040902060018101546101009004600160a060020a031633146104a1576040805160e560020a62461bcd02815260206004820181905260248201527f63616c6c6572206e65656473206f74206265206c697374696e67206f776e6572604482015290519081900360640190fd5b60028101548211156104fd576040805160e560020a62461bcd02815260206004820152601760248201527f776974686472617720616d6f756e7420746f2068696768000000000000000000604482015290519081900360640190fd5b6006546002820154610515908463ffffffff611d1716565b1015610591576040805160e560020a62461bcd02815260206004820152602360248201527f776974686472617720776f756c6420676f2062656c6f77206d696e206465706f60448201527f7369740000000000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b6002810180548390039055600480546040805160e060020a63a9059cbb02815233938101939093526024830185905251600160a060020a039091169163a9059cbb9160448083019260209291908290030181600087803b1580156105f457600080fd5b505af1158015610608573d6000803e3d6000fd5b505050506040513d602081101561061e57600080fd5b50511515610664576040805160e560020a62461bcd0281526020600482015260166024820152600080516020612375833981519152604482015290519081900360640190fd5b60028101546040805184815260208101929092528051339286927f9d9ed58779badf90c56d72f3b54def9f73dc875d8f86416c8334b55328c6c10692918290030190a3505050565b600081815260026020526040902060018101546101009004600160a060020a03163314610723576040805160e560020a62461bcd02815260206004820181905260248201527f63616c6c6572206e65656473206f74206265206c697374696e67206f776e6572604482015290519081900360640190fd5b61072c8261040f565b1515610782576040805160e560020a62461bcd02815260206004820152600f60248201527f6e6f742077686974656c69737465640000000000000000000000000000000000604482015290519081900360640190fd5b600381015415806107b1575060038101546000908152600160208190526040909120015460a060020a900460ff165b1515610807576040805160e560020a62461bcd02815260206004820152601a60248201527f6368616c6c656e6765206e6f7420796574207265736f6c766564000000000000604482015290519081900360640190fd5b61081082611d29565b60405182907f8a51904a50ce4451be09dc08242bd2d5565b05cf0f4f5aa88c77f96fdf538b4290600090a25050565b600081815260026020526040812060030154818111801561087a57506000818152600160208190526040909120015460a060020a900460ff16155b91505b50919050565b600082815260026020526040902060018101546101009004600160a060020a031633146108fa576040805160e560020a62461bcd02815260206004820181905260248201527f63616c6c6572206e65656473206f74206265206c697374696e67206f776e6572604482015290519081900360640190fd5b600281015461090f908363ffffffff611f0416565b5060048054604080517f23b872dd00000000000000000000000000000000000000000000000000000000815233938101939093523060248401526044830185905251600160a060020a03909116916323b872dd9160648083019260209291908290030181600087803b15801561098457600080fd5b505af1158015610998573d6000803e3d6000fd5b505050506040513d60208110156109ae57600080fd5b505115156109f4576040805160e560020a62461bcd0281526020600482015260166024820152600080516020612375833981519152604482015290519081900360640190fd5b60028101546040805184815260208101929092528051339286927ff63fcfb210c709154f0260502b2586fcee5550d17dc828be3127ccdedec620ab92918290030190a3505050565b600083815260026020526040812081808080610a5789611784565b80610a665750600185015460ff165b1515610abc576040805160e560020a62461bcd02815260206004820152600f60248201527f6e6f742077686974656c69737465640000000000000000000000000000000000604482015290519081900360640190fd5b60038501541580610aeb575060038501546000908152600160208190526040909120015460a060020a900460ff165b1515610b41576040805160e560020a62461bcd02815260206004820152601a60248201527f6368616c6c656e6765206e6f7420796574207265736f6c766564000000000000604482015290519081900360640190fd5b60065485600201541015610b8c57610b5889611d29565b60405189907f4a9ee335af9e32f32f2229943dc7a0d3b5adf7e4c5c4062b372eae8c476d928690600090a260009550610f2d565b600554600b54600854600954604080517f32ed3d6000000000000000000000000000000000000000000000000000000000815260048101949094526024840192909252604483015251600160a060020a03909216916332ed3d60916064808201926020929091908290030181600087803b158015610c0957600080fd5b505af1158015610c1d573d6000803e3d6000fd5b505050506040513d6020811015610c3357600080fd5b50516040805160a08101909152600654600a549296506064955090918291610c84918791610c7891610c6c90849063ffffffff611d1716565b9063ffffffff611f1116565b9063ffffffff611f3a16565b8152326020808301829052600060408085018290526006805460608088019190915260809687018490528b84526001808652838520895181558987015191810180548b87015173ffffffffffffffffffffffffffffffffffffffff19909116600160a060020a039485161774ff0000000000000000000000000000000000000000191660a060020a911515919091021790559189015160028084019190915598909701516003918201558c018b90558054968c0180549790970390965560048054965482517f23b872dd0000000000000000000000000000000000000000000000000000000081529182019590955230602482015260448101949094525194909316936323b872dd936064808501948390030190829087803b158015610da957600080fd5b505af1158015610dbd573d6000803e3d6000fd5b505050506040513d6020811015610dd357600080fd5b50511515610e19576040805160e560020a62461bcd0281526020600482015260166024820152600080516020612375833981519152604482015290519081900360640190fd5b600554604080517f6148fed5000000000000000000000000000000000000000000000000000000008152600481018790529051600160a060020a0390921691636148fed59160248082019260c0929091908290030181600087803b158015610e8057600080fd5b505af1158015610e94573d6000803e3d6000fd5b505050506040513d60c0811015610eaa57600080fd5b508051602091820151604080518881529081018390526060810182905260809381018481529381018b9052919450925032918b917ff98a08756a3603420a080d66764f73deb1e30896c315cfed03e17f88f5eb30f79188918d918d91899189919060a0820186868082843760405192018290039850909650505050505050a38395505b50505050509392505050565b6000610f448661040f565b15610f99576040805160e560020a62461bcd02815260206004820152601360248201527f616c72656164792077686974656c697374656400000000000000000000000000604482015290519081900360640190fd5b610fa286611784565b15610ff7576040805160e560020a62461bcd02815260206004820152601560248201527f6c697374696e6720616c72656164792061646465640000000000000000000000604482015290519081900360640190fd5b600654851015611051576040805160e560020a62461bcd02815260206004820152601460248201527f6d696e207374616b652073697a65206973203130000000000000000000000000604482015290519081900360640190fd5b50600085815260026020526040902060018101805474ffffffffffffffffffffffffffffffffffffffff0019163361010002179055600754611094904290611f04565b8155600281018590558360018111156110a957fe5b60048201805460ff1916600183818111156110c057fe5b0217905550600480546001830154604080517f23b872dd000000000000000000000000000000000000000000000000000000008152600160a060020a0361010090930483169481019490945230602485015260448401899052519116916323b872dd9160648083019260209291908290030181600087803b15801561114457600080fd5b505af1158015611158573d6000803e3d6000fd5b505050506040513d602081101561116e57600080fd5b505115156111b4576040805160e560020a62461bcd0281526020600482015260166024820152600080516020612375833981519152604482015290519081900360640190fd5b805460408051878152602081018390526060918101828152918101859052339289927fa27f550c3c7a7c6d8369e5383fdc7a3b4850d8ce9e20066f9d496f6989f00864928a92918991899160808201848480828437604051920182900397509095505050505050a3505050505050565b60008181526002602052604081206003015461123f83611784565b8015611258575060008381526002602052604090205442115b801561126a57506112688361040f565b155b801561129b575080158061129b5750600081815260016020819052604090912081015460a060020a900460ff161515145b156112a9576001915061087d565b50600092915050565b600054600160a060020a031633146112c957600080fd5b60008054604051600160a060020a03909116917ff8df31144d9c2f0f6b59d69b8b98abd5459d07f2742c4df920b25aae33c6482091a26000805473ffffffffffffffffffffffffffffffffffffffff19169055565b6000818152600260205260408120600301546113398361083f565b151561138f576040805160e560020a62461bcd02815260206004820152601860248201527f6368616c6c656e676520646f6573206e6f742065786973740000000000000000604482015290519081900360640190fd5b600554604080517fee684830000000000000000000000000000000000000000000000000000000008152600481018490529051600160a060020a039092169163ee684830916024808201926020929091908290030181600087803b1580156113f657600080fd5b505af115801561140a573d6000803e3d6000fd5b505050506040513d602081101561142057600080fd5b50519392505050565b6000828152600160209081526040808320338452600401909152812054819060ff16156114a0576040805160e560020a62461bcd02815260206004820152601660248201527f746f6b656e7320616c726561647920636c61696d656400000000000000000000604482015290519081900360640190fd5b600084815260016020819052604090912081015460a060020a900460ff16151514611515576040805160e560020a62461bcd02815260206004820152601660248201527f6368616c6c656e6765206e6f74207265736f6c76656400000000000000000000604482015290519081900360640190fd5b600554604080517fb43bd06900000000000000000000000000000000000000000000000000000000815233600482015260248101879052604481018690529051600160a060020a039092169163b43bd069916064808201926020929091908290030181600087803b15801561158957600080fd5b505af115801561159d573d6000803e3d6000fd5b505050506040513d60208110156115b357600080fd5b505191506115c2338585611871565b60008581526001602081815260408084206003810180548990039055805486900381553380865260049182018452828620805460ff19169095179094558054825160e060020a63a9059cbb02815291820194909452602481018690529051949550600160a060020a039092169363a9059cbb936044808501948390030190829087803b15801561165157600080fd5b505af1158015611665573d6000803e3d6000fd5b505050506040513d602081101561167b57600080fd5b505115156116c1576040805160e560020a62461bcd0281526020600482015260166024820152600080516020612375833981519152604482015290519081900360640190fd5b604080518281529051339186917f6f4c982acc31b0af2cf1dc1556f21c0325d893782d65e83c68a5534a33f599579181900360200190a350505050565b61170781611224565b1561171a5761171581611f4f565b611781565b6117238161131e565b156117315761171581611fb6565b6040805160e560020a62461bcd02815260206004820152601860248201527f7374617475732063616e6e6f7420626520757064617465640000000000000000604482015290519081900360640190fd5b50565b6000908152600260205260408120541190565b600054600160a060020a031681565b600054600160a060020a031633146117bd57600080fd5b60648211806117cc5750606481115b156117d6576117f5565b6006869055600785905560088490556009839055600a829055600b8190555b505050505050565b6000828152600160209081526040808320600160a060020a038516845260040190915290205460ff165b92915050565b6000805481908190819081908190600160a060020a0316331461184f57600080fd5b5050600654600754600854600954600a54600b54949993985091965094509250565b60008281526001602090815260408083206003810154905460055483517fb43bd069000000000000000000000000000000000000000000000000000000008152600160a060020a038a81166004830152602482018a905260448201899052945193959294879492169263b43bd0699260648084019382900301818787803b1580156118fb57600080fd5b505af115801561190f573d6000803e3d6000fd5b505050506040513d602081101561192557600080fd5b5051905061193d83610c78838563ffffffff611f1116565b979650505050505050565b6000600160a060020a0382161580159061196b5750600354600160a060020a0316155b80156119795750600c5460ff165b15156119f5576040805160e560020a62461bcd02815260206004820152602860248201527f4d61726b6574706c61636520636f6e747261637420616464726573732069732060448201527f696e76616c69642e000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b5060038054600160a060020a03831673ffffffffffffffffffffffffffffffffffffffff19909116179055600c805460ff191690556001919050565b60008181526001602081905260408220015460a060020a900460ff16158015611ae95750600554604080517fee684830000000000000000000000000000000000000000000000000000000008152600481018590529051600160a060020a039092169163ee684830916024808201926020929091908290030181600087803b158015611abc57600080fd5b505af1158015611ad0573d6000803e3d6000fd5b505050506040513d6020811015611ae657600080fd5b50515b1515611b65576040805160e560020a62461bcd02815260206004820152602c60248201527f6368616c6c656e6765206e6f74207265736f6c766564206f7220706f6c6c206e60448201527f6f7420656e646564207965740000000000000000000000000000000000000000606482015290519081900360840190fd5b600554604080517f053e71a6000000000000000000000000000000000000000000000000000000008152600481018590529051600160a060020a039092169163053e71a6916024808201926020929091908290030181600087803b158015611bcc57600080fd5b505af1158015611be0573d6000803e3d6000fd5b505050506040513d6020811015611bf657600080fd5b50511515611c195750600081815260016020526040902060029081015402610425565b50600090815260016020526040902080546002918201549091020390565b600081815260026020526040812090600482015460ff166001811115611c5957fe5b1415611cf357600354604080517f88a8c598000000000000000000000000000000000000000000000000000000008152600481018590529051600160a060020a03909216916388a8c598916024808201926020929091908290030181600087803b158015611cc657600080fd5b505af1158015611cda573d6000803e3d6000fd5b505050506040513d6020811015611cf057600080fd5b50505b5050565b600054600160a060020a03163314611d0e57600080fd5b611781816122f7565b600082821115611d2357fe5b50900390565b60008181526002602052604081206001810154909190819060ff1615611d795760405184907fd1ffb796b7108387b2f02adf47b4b81a1690cf2a190422c87a4f670780103e6390600090a2611da5565b60405184907f2e5ec035f6eac8ff1cf7cdf36cfeca7c85413f9f67652dc2c13d20f337204a2690600090a25b6000848152600260205260409020600101805460ff19169055611dc784611c37565b50506001818101546002808401546000868152602083905260408120818155948501805474ffffffffffffffffffffffffffffffffffffffffff19169055918401829055600384018290556004909301805460ff19169055610100909104600160a060020a03169190811115611cf057600480546040805160e060020a63a9059cbb028152600160a060020a0386811694820194909452602481018590529051929091169163a9059cbb916044808201926020929091908290030181600087803b158015611e9457600080fd5b505af1158015611ea8573d6000803e3d6000fd5b505050506040513d6020811015611ebe57600080fd5b50511515611cf0576040805160e560020a62461bcd0281526020600482015260166024820152600080516020612375833981519152604482015290519081900360640190fd5b8181018281101561182757fe5b6000821515611f2257506000611827565b50818102818382811515611f3257fe5b041461182757fe5b60008183811515611f4757fe5b049392505050565b60008181526002602052604090206001015460ff161515611f965760405181907fa7bc1d57d9006d9d248707c7b6828c1bab8c51719cc06d78c82a3ee891ef967c90600090a25b60009081526002602052604090206001908101805460ff19169091179055565b60008181526002602052604081206003015490611fd282611a31565b6000838152600160208181526040808420909201805474ff0000000000000000000000000000000000000000191660a060020a17905560055482517f053e71a6000000000000000000000000000000000000000000000000000000008152600481018890529251949550600160a060020a03169363053e71a6936024808501948390030190829087803b15801561206857600080fd5b505af115801561207c573d6000803e3d6000fd5b505050506040513d602081101561209257600080fd5b505160008381526001602090815260408083206003019390935560055483517f49403183000000000000000000000000000000000000000000000000000000008152600481018790529351600160a060020a039091169363494031839360248083019493928390030190829087803b15801561210d57600080fd5b505af1158015612121573d6000803e3d6000fd5b505050506040513d602081101561213757600080fd5b5051156121b45761214783611f4f565b6000838152600260208181526040808420909201805485019055848352600181529181902080546003909101548251918252928101929092528051849286927fc4497224aa78dd50c9b3e344aab02596201ca1e6dca4057a91a6c02f83f4f6c192918290030190a36122f2565b6121bd83611d29565b60048054600084815260016020818152604080842090920154825160e060020a63a9059cbb028152600160a060020a0391821696810196909652602486018790529151919093169363a9059cbb936044808301949193928390030190829087803b15801561222a57600080fd5b505af115801561223e573d6000803e3d6000fd5b505050506040513d602081101561225457600080fd5b5051151561229a576040805160e560020a62461bcd0281526020600482015260166024820152600080516020612375833981519152604482015290519081900360640190fd5b60008281526001602090815260409182902080546003909101548351918252918101919091528151849286927f362a12431f779a2baff4f77f75ba7960ae993a5c41b425df11f7fd0af2b9cbe6929081900390910190a35b505050565b600160a060020a038116151561230c57600080fd5b60008054604051600160a060020a03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a36000805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600746f6b656e73206e6f74207472616e7366657272656400000000000000000000a165627a7a723058202ee18c4176996670646b2fd93d9ebcabce089df0b229d8e2991af77dd4f41f890029";

    public static final String FUNC_RENOUNCEOWNERSHIP = "renounceOwnership";

    public static final String FUNC_OWNER = "owner";

    public static final String FUNC_TRANSFEROWNERSHIP = "transferOwnership";

    public static final String FUNC_SETMARKETINSTANCE = "setMarketInstance";

    public static final String FUNC_UPDATEPARAMETERS = "updateParameters";

    public static final String FUNC_GETPARAMETERS = "getParameters";

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

    public static final String FUNC_CHANGELISTINGSTATUS = "changeListingStatus";

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

    public static final Event OWNERSHIPRENOUNCED_EVENT = new Event("OwnershipRenounced", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}));
    ;

    public static final Event OWNERSHIPTRANSFERRED_EVENT = new Event("OwnershipTransferred", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Address>(true) {}));
    ;

    protected static final HashMap<String, String> _addresses;

    static {
        _addresses = new HashMap<String, String>();
        _addresses.put("17", "0x7a0d30234e146a88cd65f0714ab7603b0568b16a");
        _addresses.put("1539856672111", "0x3eb744342d3e626fd1ec979c4c3f3de620280c41");
    }

    @Deprecated
    protected OceanRegistry(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected OceanRegistry(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected OceanRegistry(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected OceanRegistry(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
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

    public RemoteCall<TransactionReceipt> transferOwnership(String _newOwner) {
        final Function function = new Function(
                FUNC_TRANSFEROWNERSHIP, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_newOwner)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
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

    public RemoteCall<TransactionReceipt> setMarketInstance(String _market) {
        final Function function = new Function(
                FUNC_SETMARKETINSTANCE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_market)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<TransactionReceipt> updateParameters(BigInteger _mDeposit, BigInteger _applyTime, BigInteger _commitTime, BigInteger _revealTime, BigInteger _dispPct, BigInteger _voteQ) {
        final Function function = new Function(
                FUNC_UPDATEPARAMETERS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_mDeposit), 
                new org.web3j.abi.datatypes.generated.Uint256(_applyTime), 
                new org.web3j.abi.datatypes.generated.Uint256(_commitTime), 
                new org.web3j.abi.datatypes.generated.Uint256(_revealTime), 
                new org.web3j.abi.datatypes.generated.Uint256(_dispPct), 
                new org.web3j.abi.datatypes.generated.Uint256(_voteQ)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteCall<Tuple6<BigInteger, BigInteger, BigInteger, BigInteger, BigInteger, BigInteger>> getParameters() {
        final Function function = new Function(FUNC_GETPARAMETERS, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}, new TypeReference<Uint256>() {}));
        return new RemoteCall<Tuple6<BigInteger, BigInteger, BigInteger, BigInteger, BigInteger, BigInteger>>(
                new Callable<Tuple6<BigInteger, BigInteger, BigInteger, BigInteger, BigInteger, BigInteger>>() {
                    @Override
                    public Tuple6<BigInteger, BigInteger, BigInteger, BigInteger, BigInteger, BigInteger> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple6<BigInteger, BigInteger, BigInteger, BigInteger, BigInteger, BigInteger>(
                                (BigInteger) results.get(0).getValue(), 
                                (BigInteger) results.get(1).getValue(), 
                                (BigInteger) results.get(2).getValue(), 
                                (BigInteger) results.get(3).getValue(), 
                                (BigInteger) results.get(4).getValue(), 
                                (BigInteger) results.get(5).getValue());
                    }
                });
    }

    public RemoteCall<TransactionReceipt> apply(byte[] _listingHash, BigInteger _amount, BigInteger _type, String _data) {
        final Function function = new Function(
                FUNC_APPLY, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash), 
                new org.web3j.abi.datatypes.generated.Uint256(_amount), 
                new org.web3j.abi.datatypes.generated.Uint256(_type), 
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

    public RemoteCall<TransactionReceipt> changeListingStatus(byte[] _listingHash) {
        final Function function = new Function(
                FUNC_CHANGELISTINGSTATUS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_listingHash)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    @Deprecated
    public static OceanRegistry load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new OceanRegistry(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static OceanRegistry load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new OceanRegistry(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static OceanRegistry load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new OceanRegistry(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static OceanRegistry load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new OceanRegistry(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<OceanRegistry> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider, String _tokenAddr, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddr), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(OceanRegistry.class, web3j, credentials, contractGasProvider, BINARY, encodedConstructor);
    }

    public static RemoteCall<OceanRegistry> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider, String _tokenAddr, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddr), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(OceanRegistry.class, web3j, transactionManager, contractGasProvider, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<OceanRegistry> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit, String _tokenAddr, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddr), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(OceanRegistry.class, web3j, credentials, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<OceanRegistry> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit, String _tokenAddr, String _plcrAddr) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_tokenAddr), 
                new org.web3j.abi.datatypes.Address(_plcrAddr)));
        return deployRemoteCall(OceanRegistry.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, encodedConstructor);
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
