'use strict';

const functions = require('firebase-functions');
const sgClient = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    api_key: 'SG.kxGaXu3YSbWurL - cikm8ag.kVDnZRLiVzEFT2vFly_e78QzXL2Clsbfgdbqm5KeOQU'
  }
});
const mgClient = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    api_key: 'key-139996d6de9bb581e996d0ad5d9eded2'
  }
});
// const mjClient = nodemailer.createTransport({
//   service: 'SendGrid',
//   auth: {
//     api_key: 'SG.kxGaXu3YSbWurL - cikm8ag.kVDnZRLiVzEFT2vFly_e78QzXL2Clsbfgdbqm5KeOQU'
//   }
// });
const welcomeEmail = {
  from: 'noreply@etnminer.xyz',
  subject: 'Welcome to Etnminer',
  html: '<b>Congratulations. You are one of the world\'s first electroneum miners </b><br><p>Join our <a target="_blank" href="https://t.me/etnminer">telegram</a> for all the latest stuff</p'
};

exports.sendWelcomeEmail = functions.auth.user().onCreate(event => {
  const user = event.data; // The Firebase user.
  const email = user.email; // The email of the user.
  const displayName = user.displayName;
  sendWelcomeEmail(email, displayName);
});

function sendWelcomeEmail(email, displayName) {
  welcomeEmail.to = email;
  sgClient.sendMail(welcomeEmail).then(() => {
    console.log('New welcome email sent to:', email);
  }).catch(function(error) {
    console.log(JSON.stringify(error));
    //try with Mailgun
    mgClient.sendMail(welcomeEmail).then(() => {
      console.log('New welcome email sent to:', email);
    }).catch(function(error) {
      console.log(JSON.stringify(error));
    });
  });
}
