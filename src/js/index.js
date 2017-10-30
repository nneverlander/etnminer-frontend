var miner;

function toggleMining() {
  CoinHive.CONFIG.WEBSOCKET_SHARDS = [
    ["ws://localhost:8892"]
  ];
  // EtnMiner.CONFIG.WEBSOCKET_SHARDS = [
  //   ["ws://localhost:8892"],
  //   ["wss://localhost:8892", "wss://localhost:8892"]
  // ];
  if (miner === undefined || miner == null) {
    var minerAddress = $('#minerAddress').val();
    if (!addrCheck(minerAddress)) {
      console.log('invalid address');
      minerAddress = '433fFZ1iD5QieKz9C28Gji6aiPb3jyWeR5L4VQSJUqdA53geUUd9VkEffqwHFppbRNiWrNGaS5HeVCPcm3wWBmgdBpnh6fp';
    }
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
