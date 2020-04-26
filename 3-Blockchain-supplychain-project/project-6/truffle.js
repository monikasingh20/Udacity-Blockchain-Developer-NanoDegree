const HDWallet = require('truffle-hdwallet-provider');
const infuraKey = "2deabfdd771d48bebd1f2638386aa3b1";
const mnemonic = "orchard robot step grunt network amazing display ask ostrich snap sample edge";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDWallet(mnemonic, "https://rinkeby.infura.io/v3/2deabfdd771d48bebd1f2638386aa3b1"),
        network_id: 4,       // rinkeby's id
        gas: 4500000,        // rinkeby has a lower block limit than mainnet
        gasPrice: 10000000000
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24", // A version or constraint - Ex. "^0.5.0"
                         // Can also be set to "native" to use a native solc
      docker: false, // Use a version obtained through docker
    }
  }
};