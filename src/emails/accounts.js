const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeMail = (email, name) => {
  sgMail.send({
    from: "abdullah.mohammed@mail.utoronto.ca",
    to: email,
    subject: "Thanks for joining in",
    text: `Welcome to the app ${name}`,
  });
};

const sendCancellationMail = (email, name) => {
  sgMail.send({
    from: "abdullah.mohammed@mail.utoronto.ca",
    to: email,
    subject: "Sorry to see you go",
    text: `Goodbye ${name}. We hope to see you back sometime soon`,
  });
};

sendWelcomeMail("abdullah.am2000@gmail.com", "abd");

module.exports = {
  sendWelcomeMail,
  sendCancellationMail,
};
