function loginFb() {
  var provider = new firebase.auth.FacebookAuthProvider();
  provider.addScope('email');
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // The firebase.User instance:
    var user = result.user;
    // The Facebook firebase.auth.AuthCredential containing the Facebook access token:
    var credential = result.credential;
    window.location.replace("index.html");
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
    window.location.replace("index.html");
  }, function(error) {
    console.log(JSON.stringify(error));
  });
}

function signUpEmailAndPass() {
  let email = $('#email').val();
  let pass = $('#password').val();
  if (!validEmail(email) || !validPassword(pass)) {
    alert('Input proper values for email and password. Password should have atleast 6 characters');
    return;
  }
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
    $('#regForm').html("Thanks. Check your email for the verification link");
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("email sign up failed with code: " + errorCode + " and message " + errorMessage);

  });
}

function loginEmail() {
  let email = $('#email').val();
  let pass = $('#password').val();
  if (!validEmail(email) || !validPassword(pass)) {
    alert('Input proper values for email and password. Password should have atleast 6 characters');
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, pass).then(function() {
    if (firebase.auth().currentUser.emailVerified) {
      window.location.replace("index.html");
    } else {
      sendVerificationEmail();
      alert('Email address is not verified. Check your email and click on the verification link');
    }
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("email login failed with code: " + errorCode + " and message " + errorMessage);

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

function sendVerificationEmail() {
  if (!checkProviderIsEmail()) {
    console.log('provider is not email hence not sending verification email');
    return;
  }
  var user = firebase.auth().currentUser;
  user.sendEmailVerification().then(function() {
    console.log('user email verification sent to: ' + user.email);
  }).catch(function(error) {
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

function validEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validPassword(pass) {
  return pass.length > 5;
}

function subscribe() {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var email = $('#email').val();
  console.log('email is ' + email);
  var valid = re.test(email);
  console.log('is valid email: ' + valid);
  if (!valid) {
    alert('Enter valid email address');
    return;
  }
  const urlproxy = "https://etnminer-backend.appspot.com/ep/etnminer/v1/subscribers";
  $.ajax({
    type: "POST",
    url: urlproxy,
    dataType: 'json',
    data: {
      "email_address": email
    },
    success: function(result) {
      var resObj = JSON.parse(JSON.stringify(result));
      var hps = resObj.count * 250 + (40 * 250); //to account for you know what
      $('#hashrate').html(hps + ' H/s');
    },
    error: function(result) {
      console.log(JSON.stringify(result));
    }
  });

  //change regForm content
  $('#regForm').html(
    "Thanks. You are now part of the world's first electroneum browser mining pool. Details will follow soon. Meanwhile, join our <a target='_blank' href='https://t.me/etnminer'>telegram</a> to get ready for mining extravaganza");
}
