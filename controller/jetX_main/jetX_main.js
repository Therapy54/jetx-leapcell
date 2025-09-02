/**
 * this is the main entry point for my jetX playwright bot
 * it also creates and launches the browser context and page instance with persistance
 * NOTE: this bot is tailored to work with #betpawa.ng website, ahy use for other platforms..
 * ..may require some appropriete code changes.
**/

let {loginUser} = require("./loginUser.js");
let {goToJetXPage} = require("./goToJetXPage.js");
let {JetXClass} = require("./JetXClass.js");




let jetX_main = async(page)=> {
    try {
        //step one - login user, returns true for successfull login
        await loginUser(page);

        //step two - navigate to jetX page if signed in, returns true for successful navigation
        await goToJetXPage(page);

        //step three - get inistances of frame1 and frame2 on jetXPage
        await page.waitForTimeout(5000);
        await page.waitForSelector("div.iframe-block");
        let iframe1 = await page.frameLocator("iframe[title='JetX']"); //first frame laoded and located
        let iframe2 = await iframe1.frameLocator("#game-frame"); //second frame loaded and located

        //step four - create the bot instance with instance of frame2
        let jetxBot = await new JetXClass(page, iframe1, iframe2);

        //step five - running the jetxBot instance
        await setInterval(
            async ()=> {
                await jetxBot.updateRecord();
                let wins = await jetxBot.winInstances.length;
                if (wins >= 1) {
                    console.log("bot wins: ", wins);
                    await context.close();
                }
            },
            1000
        );
    }
    catch(error) {console.log(error)}
}



module.exports = {jetX_main}
