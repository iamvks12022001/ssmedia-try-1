const nodeMailer = require("../config/nodemailer");

exports.verifyEmail = (email, num) => {
  let htmlString = nodeMailer.renderTemplate(
    { email: email, num: num },
    "/verify_email.ejs"
  );
  nodeMailer.transporter.sendMail(
    {
      from: "NotASpam@vik.com", //username of the email
      to: email, //sending to the person who has commented
      subject: "Welcome To Our Family !",
      html: htmlString, //passing the html for template
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending mail", err);
        return;
      }

      console.log("Message sent", info);
      return;
    }
  );
};
