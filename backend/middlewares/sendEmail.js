const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
    const transporter = nodeMailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "216ca24094ce08",
            pass: "d7a8f48f9f377b",
        },
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};
