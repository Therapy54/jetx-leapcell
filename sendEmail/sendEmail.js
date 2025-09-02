/**
 * the code here creates a custom template for sending email..,
 * notifications using the Resend api for node.js 
**/

require("dotenv").config();
let Resend = require("resend");
let resend_api = process.env.resend_api;
let resend = new Resend.Resend(resend_api);


let sendEmail = async (msg, name) => {
    /**
     * function accepts two arguments, msg=message, name=subject.
     * msg: contains the actual message string to be sent to reciepient
     * name: indicates the subject or type of notification being sent. (Notification or Error)
    **/

    let msgDesign = `\
        <div
            style="
                background-color: #f4f7f6;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
                padding: 10px;
                border-radius: 5px;
                text-align: center;
            "
        >
            <h1
                style="
                    font-weight: 600;
                    font-size: 15px;
                    padding: 2px 4px;
                "
            >
                ${name.toUpperCase()}
            </h2>
            <p
                style="
                    font-weight: 600;
                    font-size: 10px;
                    color: #1a1a1a;
                "
            >
                ${msg}
            </p>
        </div>
    `;

    try {
        name = await name.toUpperCase();
        let { data, error } = await resend.emails.send({
            from: 'JetX-bot <onboarding@resend.dev>',
            to: [`${process.env.my_gmail}`],
            subject: `${name}`,
            html: msgDesign,
        });

        if (error) {
            throw new Error(error);
        }
        console.log("email notification delivered, id: ", data.id);

    }
    catch(error) {console.error(error)}
};



module.exports = {sendEmail}
