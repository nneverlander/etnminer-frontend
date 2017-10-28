function signOut() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    console.log(JSON.stringify(error));
  });
}

function isLoggedIn() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      console.log('curr user: ' + user.email);
      return true;
    } else {
      // No user is signed in.
      console.log('no curr user');
      return false;
    }
  });
}

function sendPasswordResetEmail() {
  if (!checkProviderIsEmail()) {
    console.log('provider is not email hence not sending password reset email');
    return;
  }
  var auth = firebase.auth();
  var emailAddress = auth.user.email;
  auth.sendPasswordResetEmail(emailAddress).then(function() {
    console.log('password reset email sent to: ' + emailAddress);
  }).catch(function(error) {
    console.log(JSON.stringify(error));
  });
}

function changePassword(oldPass, newPass) {
  if (!checkProviderIsEmail()) {
    console.log('provider is not email hence not changing password');
    return;
  }
  var user = firebase.auth().currentUser;
  user.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, oldPass)).then(function() {
    // User re-authenticated.
    user.updatePassword(newPass).then(function() {
      console.log('password successfully reset');
    }).catch(function(error) {
      alert('Password not changed. Error : ' + error.message);
      console.log(JSON.stringify(error));
    });
  }).catch(function(error) {
    alert('Password not changed. Error : ' + error.message);
    console.log(JSON.stringify(error));
  });
}

function checkProviderIsEmail() {
  return true;
  // var user = firebase.auth().currentUser;
  // user.providerData.providerId.then(function(provider) {
  //   console.log('auth provider is: ' + provider);
  //   if (provider === firebase.auth.EmailAuthProvider.PROVIDER_ID) {
  //     return true;
  //   }
  // }).catch(function(error) {
  //   console.log(JSON.stringify(error));
  // });
  // return false;
}
