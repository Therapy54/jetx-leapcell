//this program signs the user in

require("dotenv").config();
let {eventEmitter, emitError, emitMessage} = require("./eventEmitter.js");


let loginUser = async(context, page)=> {

    try {
        //go to login page and login with phone and password.
        //Note:successfull login should redirect to home page
        let phone = process.env.phone; 
        let password = process.env.password;
        await page.goto("https://www.betpawa.ng/login"); //go to betpawa login page
        await page.waitForSelector("//div[@class='page login-page router-view']"); //ensure login is visible
        await page.locator("#login-form-phoneNumber").fill(phone);
        await page.locator("#login-form-password-input").fill(password);
        await page.locator('[data-test-id="logInButton"]').click();
    }
    catch (error) {
        await eventEmitter.emit("error", error);
    }
}



module.exports = {loginUser}