const nodemailer = require("nodemailer");
const pug = require("pug");
const juice = require("juice");
const htmlToText = require("html-to-text");
require("dotenv").config({ path: "./variables.env" });

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(
    `${__dirname}/../views/email/${filename}.pug`,
    options
  );
  return html;
};

exports.send = async options => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);

  const mailOptions = {
    from: `Joshua <noreply@cbusparks.com>`,
    to: options.user.email,
    subject: options.subject,
    html,
    text
  };

  return transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    //was using this for some debugging
    // console.log("Message sent: %s", info.messageId);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
};
