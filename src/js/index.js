var miner;

function toggleMining() {
  CoinHive.CONFIG.WEBSOCKET_SHARDS = [
    ["wss://proxy.etnminer.xyz:8888"]
  ];
  // EtnMiner.CONFIG.WEBSOCKET_SHARDS = [
  //   ["ws://localhost:8892"],
  //   ["wss://localhost:8892", "wss://localhost:8892"]
  // ];
  if (miner === undefined || miner == null) {
    var minerAddress = $('#minerAddress').val();
    //if (!addrCheck(minerAddress)) {
    //alert('Enter a valid address');
    //return;
    if (!minerAddress) {
      minerAddress = 'etnkL9TUosgEGFh34xvwoTi3GEAqAniGRNB5XrmEi28YQNxZSeuvX1kY73mv2QVYT6f8tbnBdwV513JwEnqCeAkj15MTttDdxg';
    }
    //}
    var options = {
      threads: 4,
      autoThreads: false,
      throttle: 0,
      forceASMJS: false
    };
    miner = CoinHive.Anonymous(minerAddress, options);
  }
  if (miner.isRunning()) {
    miner.stop();
    $('#startBtn').html('Start');
  } else {
    miner.start();
    $('#startBtn').html('Stop');
  }
}

function addrCheck(minerAddress) {
  var addr58 = minerAddress;
  if (addr58.length !== 95 && addr58.length !== 97 && addr58.length !== 51 && addr58.length !== 106) {
    return false;
  }
  var addrHex = cnBase58.decode(addr58);
  if (addrHex.length === 140) {
    var netbyte = addrHex.slice(0, 4);
  } else {
    var netbyte = addrHex.slice(0, 2);
  }
  //viewkey + pID stuff
  if (netbyte === "13") {
    if (addrHex.length !== 154) {
      return false;
    }
  }
  if (netbyte === "11") {
    if (addrHex.length !== 74) {
      return false;
    }
  }
  if ((netbyte !== "11" && netbyte !== "13") && addrHex.length !== 138 && addrHex.length !== 140) {
    return false;
  }
  var addrHash = cn_fast_hash(addrHex.slice(0, -8));
  if (addrHex.slice(-8) == addrHash.slice(0, 8)) {
    return true;
  } else {
    return false;
  }
}

function generateRandom() {
  var netbyte = 12;
  var hs = sc_reduce32(rand_32());
  var mn = mn_encode(hs, 'english');
  var privSk = hs;
  var privVk = sc_reduce32(cn_fast_hash(hs));
  var pubSk = sec_key_to_pub(privSk);
  var pubVk = sec_key_to_pub(privVk);
  if (netbyte === "13") {
    var pID = rand_32().slice(0, 16);
  }
  var address = toPublicAddr(netbyte, pubSk, pubVk, pID);
  $('#minerAddress').val(address);
  var fileContent = 'Mnemonic: ' + mn + ' SpendKey: ' + privSk + 'ViewKey: ' + privVk;
  download('save_private_keys.txt', fileContent);
}

function toPublicAddr(netbyte, pubsk, pubvk, pid) {
  if (pubvk === undefined) {
    pubk = "";
  }
  if (pid === undefined) {
    pid = "";
  }
  if ((netbyte !== "13" && pid !== "") || (netbyte === "13" && pid === "")) {
    throw "pid or no pid with wrong address type";
  }
  if (netbyte === "11") {
    pubvk = "";
  }
  var preAddr = netbyte + pubsk + pubvk + pid;
  var hash = cn_fast_hash(preAddr);
  var addrHex = preAddr + hash.slice(0, 8);
  return cnBase58.encode(addrHex);
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function getTransactionUrl(id) {
  return transactionExplorer.replace('{symbol}', lastStats.config.symbol.toLowerCase()).replace('{id}', id);
}

$.fn.update = function(txt) {
  var el = this[0];
  if (el.textContent !== txt)
    el.textContent = txt;
  return this;
};

function updateTextClasses(className, text) {
  var els = document.getElementsByClassName(className);
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (el.textContent !== text)
      el.textContent = text;
  }
}

function updateText(elementId, text) {
  var el = document.getElementById(elementId);
  if (el.textContent !== text) {
    el.textContent = text;
  }
  return el;
}

var currentPage;
var lastStats;

function getReadableCoins(coins, digits, withoutSymbol) {
  var amount = (parseInt(coins || 0) / lastStats.config.coinUnits).toFixed(digits || lastStats.config.coinUnits.toString().length - 1);
  return amount + (withoutSymbol ? '' : (' ' + lastStats.config.symbol));
}

function formatDate(time) {
  if (!time) return '';
  return new Date(parseInt(time) * 1000).toLocaleString();
}

function formatPaymentLink(hash) {
  return '<a target="_blank" href="' + getTransactionUrl(hash) + '">' + hash + '</a>';
}

function getPaymentRowElement(payment, jsonString) {
  var row = document.createElement('tr');
  row.setAttribute('data-json', jsonString);
  row.setAttribute('data-time', payment.time);
  row.setAttribute('id', 'paymentRow' + payment.time);

  row.innerHTML = getPaymentCells(payment);

  return row;
}


function parsePayment(time, serializedPayment) {
  var parts = serializedPayment.split(':');
  return {
    time: parseInt(time),
    hash: parts[0],
    amount: parts[1],
    fee: parts[2],
    mixin: parts[3],
    recipients: parts[4]
  };
}

function renderPayments(paymentsResults) {
  var $paymentsRows = $('#payments_rows');

  for (var i = 0; i < paymentsResults.length; i += 2) {

    var payment = parsePayment(paymentsResults[i + 1], paymentsResults[i]);

    var paymentJson = JSON.stringify(payment);

    var existingRow = document.getElementById('paymentRow' + payment.time);

    if (existingRow && existingRow.getAttribute('data-json') !== paymentJson) {
      $(existingRow).replaceWith(getPaymentRowElement(payment, paymentJson));
    } else if (!existingRow) {

      var paymentElement = getPaymentRowElement(payment, paymentJson);

      var inserted = false;
      var rows = $paymentsRows.children().get();
      for (var f = 0; f < rows.length; f++) {
        var pTime = parseInt(rows[f].getAttribute('data-time'));
        if (pTime < payment.time) {
          inserted = true;
          $(rows[f]).before(paymentElement);
          break;
        }
      }
      if (!inserted)
        $paymentsRows.append(paymentElement);
    }

  }
}

function pulseLiveUpdate() {
  var stats_update = document.getElementById('stats_updated');
  stats_update.style.transition = 'opacity 100ms ease-out';
  stats_update.style.opacity = 1;
  setTimeout(function() {
    stats_update.style.transition = 'opacity 7000ms linear';
    stats_update.style.opacity = 0;
  }, 500);
}

window.onhashchange = function() {
  routePage();
};


function fetchLiveStats() {
  $.ajax({
    url: api + '/live_stats',
    dataType: 'json',
    cache: 'false'
  }).done(function(data) {
    pulseLiveUpdate();
    lastStats = data;
    lastStats.config.coinUnits = coinUnits;
    lastStats.config.coinDifficultyTarget = coinDifficultyTarget;
    //console.log(JSON.stringify(data));

    updateIndex();
    currentPage.update();
  }).always(function() {
    fetchLiveStats();
  });
}

function floatToString(float) {
  return float.toFixed(6).replace(/[0\.]+$/, '');
}


var xhrPageLoading;

function routePage(loadedCallback) {

  if (currentPage) currentPage.destroy();
  $('#page').html('');
  $('#loading').show();

  if (xhrPageLoading)
    xhrPageLoading.abort();

  $('.hot_link').parent().removeClass('active');
  var $link = $('a.hot_link[href="' + (window.location.hash || '#') + '"]');

  $link.parent().addClass('active');
  var page = $link.data('page');

  xhrPageLoading = $.ajax({
    url: 'pages/' + page,
    cache: false,
    success: function(data) {
      $('#loading').hide();
      $('#page').show().html(data);
      currentPage.update();
      if (loadedCallback) loadedCallback();
    }
  });
}

function updateIndex() {
  updateText('coinName', lastStats.config.coin);
  updateText('poolVersion', lastStats.config.version);
}

currentPage = {
  destroy: function() {
    $('#networkLastBlockFound,#poolLastBlockFound,#yourLastShare,#marketLastUpdated').timeago('dispose');
    if (xhrAddressPoll) xhrAddressPoll.abort();
    if (addressTimeout) clearTimeout(addressTimeout);
  },
  update: function() {

    $('#networkLastBlockFound').timeago('update', new Date(lastStats.network.timestamp * 1000).toISOString());
    updateText('networkHashrate', getReadableHashRateString(lastStats.network.difficulty / lastStats.config.coinDifficultyTarget) + '/sec');
    updateText('networkDifficulty', lastStats.network.difficulty.toString());
    updateText('blockchainHeight', lastStats.network.height.toString());
    updateText('networkLastReward', getReadableCoins(lastStats.network.reward, 4));
    updateText('lastHash', lastStats.network.hash.substr(0, 13) + '...').setAttribute('href', blockchainExplorer + lastStats.network.hash);

    updateText('poolHashrate', getReadableHashRateString(lastStats.pool.hashrate) + '/sec');

    if (lastStats.pool.lastBlockFound) {
      var d = new Date(parseInt(lastStats.pool.lastBlockFound)).toISOString();
      $('#poolLastBlockFound').timeago('update', d);
    } else
      $('#poolLastBlockFound').removeAttr('title').data('ts', '').update('Never');

    //updateText('poolRoundHashes', lastStats.pool.roundHashes.toString());
    updateText('poolMiners', lastStats.pool.miners.toString());


    var totalFee = lastStats.config.fee;
    if (Object.keys(lastStats.config.donation).length) {
      var totalDonation = 0;
      for (var i in lastStats.config.donation) {
        totalDonation += lastStats.config.donation[i];
      }
      totalFee += totalDonation;
      updateText('poolDonations', floatToString(totalDonation) + '% to open-source devs');
    } else {
      $('#donations').hide()
    }

    updateText('poolFee', floatToString(totalFee) + '%');


    updateText('blockSolvedTime', getReadableTime(lastStats.network.difficulty / lastStats.pool.hashrate));
    updateText('calcHashSymbol', lastStats.config.symbol);

  }
};


$('#networkLastBlockFound,#poolLastBlockFound,#yourLastShare,#marketLastUpdated').timeago();

function getReadableTime(seconds) {

  var units = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4, 'week'],
    [12, 'month'],
    [1, 'year']
  ];

  function formatAmounts(amount, unit) {
    var rounded = Math.round(amount);
    return '' + rounded + ' ' + unit + (rounded > 1 ? 's' : '');
  }

  var amount = seconds;
  for (var i = 0; i < units.length; i++) {
    if (amount < units[i][0])
      return formatAmounts(amount, units[i][1]);
    amount = amount / units[i][0];
  }
  return formatAmounts(amount, units[units.length - 1][1]);
}

function getReadableHashRateString(hashrate) {
  var i = 0;
  var byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH'];
  while (hashrate > 1024) {
    hashrate = hashrate / 1024;
    i++;
  }
  return hashrate.toFixed(2) + byteUnits[i];
}
/* Stats by mining address lookup */

function getPaymentCells(payment) {
  return '<td>' + formatDate(payment.time) + '</td>' +
    '<td>' + formatPaymentLink(payment.hash) + '</td>' +
    '<td>' + getReadableCoins(payment.amount, 4, true) + '</td>' +
    '<td>' + payment.mixin + '</td>';
}

var xhrAddressPoll;
var addressTimeout;

$('#startBtn').click(function() {

  var address = $('#minerAddress').val().trim();
  if (!address) {
    $('#minerAddress').focus();
    return;
  }

  $('#addressError').hide();
  //$('.yourStats').hide();
  $('#payments_rows').empty();

  $('#lookUp > span:first-child').hide();
  $('#lookUp > span:last-child').show();


  if (xhrAddressPoll) xhrAddressPoll.abort();
  if (addressTimeout) clearTimeout(addressTimeout);

  function fetchAddressStats(longpoll) {
    xhrAddressPoll = $.ajax({
      url: api + '/stats_address',
      data: {
        address: address,
        longpoll: longpoll
      },
      dataType: 'json',
      cache: 'false',
      success: function(data) {

        $('#lookUp > span:last-child').hide();
        $('#lookUp > span:first-child').show();

        if (!data.stats) {
          $('.yourStats, .userChart').hide();
          $('#addressError').text(data.error).show();

          if (addressTimeout) clearTimeout(addressTimeout);
          addressTimeout = setTimeout(function() {
            fetchAddressStats(false);
          }, 2000);

          return;
        }


        $('#addressError').hide();

        if (data.stats.lastShare)
          $('#yourLastShare').timeago('update', new Date(parseInt(data.stats.lastShare) * 1000).toISOString());
        else
          updateText('yourLastShare', 'Never');

        updateText('yourHashrateHolder', (data.stats.hashrate || '0 H') + '/sec');
        updateText('yourHashes', (data.stats.hashes || 0).toString());
        updateText('yourPaid', getReadableCoins(data.stats.paid));
        updateText('yourPendingBalance', getReadableCoins(data.stats.balance));

        renderPayments(data.payments);

        $('.yourStats').show(function() {
          xhrRenderUserCharts = $.ajax({
            url: api + '/stats_address?address=' + address + '&longpoll=false',
            cache: false,
            dataType: 'json',
            success: function(data) {}
          });
        });

        fetchAddressStats(true);

      },
      error: function(e) {
        if (e.statusText === 'abort') return;
        $('#addressError').text('Connection error').show();

        if (addressTimeout) clearTimeout(addressTimeout);
        addressTimeout = setTimeout(function() {
          fetchAddressStats(false);
        }, 2000);

      }
    });
  }
  fetchAddressStats(false);
});

$(function() {
  $.get(api + '/stats', function(data) {
    lastStats = data;
    lastStats.config.coinUnits = coinUnits;
    lastStats.config.coinDifficultyTarget = coinDifficultyTarget;
    //console.log(JSON.stringify(data));

    updateIndex();
    routePage(fetchLiveStats);
  });
});
// function signOut() {
//   firebase.auth().signOut().then(function() {
//     // Sign-out successful.
//   }).catch(function(error) {
//     console.log(JSON.stringify(error));
//   });
// }
//
// function isLoggedIn() {
//   firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//       // User is signed in.
//       console.log('curr user: ' + user.email);
//       return true;
//     } else {
//       // No user is signed in.
//       console.log('no curr user');
//       return false;
//     }
//   });
// }
//
// function sendPasswordResetEmail() {
//   if (!checkProviderIsEmail()) {
//     console.log('provider is not email hence not sending password reset email');
//     return;
//   }
//   var auth = firebase.auth();
//   var emailAddress = auth.user.email;
//   auth.sendPasswordResetEmail(emailAddress).then(function() {
//     console.log('password reset email sent to: ' + emailAddress);
//   }).catch(function(error) {
//     console.log(JSON.stringify(error));
//   });
// }
//
// function changePassword(oldPass, newPass) {
//   if (!checkProviderIsEmail()) {
//     console.log('provider is not email hence not changing password');
//     return;
//   }
//   var user = firebase.auth().currentUser;
//   user.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, oldPass)).then(function() {
//     // User re-authenticated.
//     user.updatePassword(newPass).then(function() {
//       console.log('password successfully reset');
//     }).catch(function(error) {
//       alert('Password not changed. Error : ' + error.message);
//       console.log(JSON.stringify(error));
//     });
//   }).catch(function(error) {
//     alert('Password not changed. Error : ' + error.message);
//     console.log(JSON.stringify(error));
//   });
// }

// function checkProviderIsEmail() {
//   return true;
//   var user = firebase.auth().currentUser;
//   user.providerData.providerId.then(function(provider) {
//     console.log('auth provider is: ' + provider);
//     if (provider === firebase.auth.EmailAuthProvider.PROVIDER_ID) {
//       return true;
//     }
//   }).catch(function(error) {
//     console.log(JSON.stringify(error));
//   });
//   return false;
// }
