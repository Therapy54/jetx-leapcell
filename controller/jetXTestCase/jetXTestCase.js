/**
 * the code here is just test my ideas..,
 * its not part of the main bot code base
**/

require("dotenv").config();
let OS = require("os");
let {sendEmail} = require("../../sendEmail/sendEmail.js");
let {loginUser} = require("../loginUser.js");
let {testCaseObject} = require("./testCaseObject.js");
let {eventEmitter, emitError, emitMessage} = require("../eventEmitter.js");







let jetXTestCase = async(context, page)=> {

    //go to betpawa home page
    await page.goto("https://www.betpawa.ng");
    await page.waitForURL("https://www.betpawa.ng"); //wait for url to fully get loaded
    await page.waitForTimeout(15000);

    //verify if user is signed in or not, #no login element is will be displayed if user is loged in
    let isLogedIn = (await page.locator("a[href='/login']").count() >= 1)? false : true;
    //console.log("user loged in :", isLogedIn);
    if (isLogedIn === false) {await loginUser(context, page)}

    (async(page)=>{
        // bot login acknowledgement scope
        let msg = "jetX-bot login is successful!";
        let name = "notification";
        await sendEmail(msg, name);
        await console.log(msg);
        await page.reload({waitUntil: "networkidle"});
    })(page);

    //on home page, await CASINO link/icon to be visible, then click
    await page.waitForTimeout(15000);
    let casinoLocator = "span.tab-text:has-text('Casino')";
    await page.waitForSelector(casinoLocator);
    await page.locator(casinoLocator).click();

    //wait for visibility of jetx image and then click on parent container to navigate to crash game
    let jetxImg = "//img[@src='https://www.betpawa.ng/media/casino/smartsoft/18/Jetx%20Thumbnail%20new-min.jpg']";
    let jexImgParent = "div.casino-item:has(img[src='https://www.betpawa.ng/media/casino/smartsoft/18/Jetx%20Thumbnail%20new-min.jpg'])"
    await page.waitForSelector(jetxImg);
    await page.locator(jexImgParent).click();

    //on jexcrash page, #page is in iframes
    await page.waitForTimeout(15000);
    await page.waitForSelector("div.iframe-block");
    let iframe1 = await page.frameLocator("iframe[title='JetX']"); //first frame laoded and located
    let iframe2 = await iframe1.frameLocator("#game-frame"); //second frame loaded and located


    let triggerNum = 2; // used trigger betstart, betstop, or recordDelays.
    let crashNumsContainer = await iframe2.locator("#last100Spins");
    let crashNums = {
        currentCrash: {
            //second element in jetX array
            id: await crashNumsContainer.locator("div").nth(1).getAttribute("id"),
            num: parseFloat(await crashNumsContainer.locator("div").nth(1).textContent())
        },
        previousCrash: {
            //third element in jetX array
            id: await crashNumsContainer.locator("div").nth(2).getAttribute("id"),
            num: parseFloat(await crashNumsContainer.locator("div").nth(2).textContent())
        }
    };


    let evaluteCrash  = async()=> {
        let latestCrash = await {
            id: await crashNumsContainer.locator("div").nth(1).getAttribute("id"),
            num: parseFloat(await crashNumsContainer.locator("div").nth(1).textContent())
        };

        if (latestCrash.id !== crashNums.currentCrash.id) {
            //new jet crash, update crash nums
            crashNums = await {
                currentCrash: latestCrash,
                previousCrash: crashNums.currentCrash
            };
            //console.log(crashNums);

            //makes a call to testCase
            let currentCrash = await crashNums.currentCrash;
            let previousCrash = await crashNums.previousCrash;
            let funcAgrs = await {
                context, page,
                triggerNum,
                currentCrash,
                previousCrash
            }
            await testCaseObject.ParentFunction(funcAgrs);
        }
    };

    //make interval call
    await setInterval(evaluteCrash, 1000);
}



module.exports = {jetXTestCase};
