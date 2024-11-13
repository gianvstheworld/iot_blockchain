// hardhat.config.js

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    ganache: {
      url: "http://ganache:8545",
    },
  },
};
