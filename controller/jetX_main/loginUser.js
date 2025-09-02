/**
 * the program code here signs the user in if not already signed in,
 * returns true if sign in is successfull, else false.
**/
require("dotenv").config();



let loginUser = async(page)=> {

    try {
        //verify if user is signed in or not, #no login element is will be displayed if user is loged in already
        let isLogedIn = false;
        if (await page.locator("a[href='/login']").count() == 1) { // user not logged in
            //go to login page and login with phone and password.
            //Note:successfull login should redirect to home page
            let phone = process.env.phone; 
            let password = process.env.password;
            await page.goto("https://www.betpawa.ng/login"); //go to betpawa login page
            await page.waitForSelector("//div[@class='page login-page router-view']"); //ensure login is visible
            await page.locator("#login-form-phoneNumber").fill(phone);
            await page.locator("#login-form-password-input").fill(password);
            await page.locator('[data-test-id="logInButton"]').click();
            
            isLogedIn = true;
            return isLogedIn;
        }
        else { //user is already logged in
            isLogedIn = true;
            return isLogedIn;
        }
    }
    catch (error) {console.log(error)}
}



module.exports = {loginUser}

