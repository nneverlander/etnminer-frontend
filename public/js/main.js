function loginFb() {
  var provider = new firebase.auth.FacebookAuthProvider();
  provider.addScope('email');
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // The firebase.User instance:
    var user = result.user;
    // The Facebook firebase.auth.AuthCredential containing the Facebook
    // access token:
    var credential = result.credential;
  }, function(error) {
    console.log(JSON.stringify(error));
  });
}

function loginGoogle() {
  // Using a popup.
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('email');
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
  }, function(error) {
    console.log(JSON.stringify(error));
  });
}

function signUpEmailAndPass(email, password) {
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("email sign up failed with code: " + errorCode + " and message " + errorMessage);

  });
}

function loginEmail(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("email login failed with code: " + errorCode + " and message " + errorMessage);

  });
}

function signOut() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
}
