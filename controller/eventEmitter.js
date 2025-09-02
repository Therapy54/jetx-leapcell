/**
 * method for not event emitter
**/

let EventEmitter = require("node:events");
let eventEmitter = new EventEmitter();
let {sendEmail} = require("../sendEmail/sendEmail.js");



let emitError = async(error)=> {
    /**
     * emits the error to console,
     * sends an email notification about the error.
    **/

    let demarcationString = "*".repeat(30);
    let msg = error;    let name = "error";
    await console.error(
        demarcationString,"Emitter Error", demarcationString,
            "\n", error, "\n",
        demarcationString,demarcationString,demarcationString
    );
    await sendEmail(msg, name)
    .catch(()=> {
        console.log("email error from emitError");
        console.error(error);
    });

}




let emitMessage = async(message)=> {
    /**
     * emits the message to console,
     * sends an email notification about the message.
    **/

    let demarcationString = "*".repeat(20);
    let msg = message;    let name = "notification";
    await console.log(
        demarcationString,"Emitter Message", demarcationString,
            "\n", message, "\n",
        demarcationString,demarcationString,demarcationString
    );
    await sendEmail(msg, name)
    .catch(()=> {
        console.log("email error is from emitMessage");
        console.error(error);
    });
}



module.exports = {eventEmitter, emitMessage, emitError};

