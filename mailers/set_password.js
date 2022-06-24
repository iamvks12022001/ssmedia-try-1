const nodeMailer = require("../config/nodemailer");

exports.setpassword = (email, link) => {
  let htmlString = nodeMailer.renderTemplate(
    { email: email, link: link },
    "/set_password.ejs"
  );
  nodeMailer.transporter.sendMail(
    {
      from: "NotASpam@vik.com", //username of the email
      to: email, //sending to the person who has commented
      subject: "Set the password !",
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
