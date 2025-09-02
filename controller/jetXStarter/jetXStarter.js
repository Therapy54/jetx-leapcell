/**
 * my first code base for the jetx-bot
*/

require("dotenv").config();
let OS = require("os");
let {sendEmail} = require("../../sendEmail/sendEmail.js");
let {loginUser} = require("../loginUser.js");



let jetXStarter = async(page)=> {
    try {

        //go to betpawa home page
        await page.goto("https://www.betpawa.ng");
        await page.waitForURL("https://www.betpawa.ng"); //wait for url to fully get loaded
        await page.waitForTimeout(5000);

        //verify if user is signed in or not, #no login element is will be displayed if user is loged in
        let isLogedIn = (await page.locator("a[href='/login']").count() >= 1)? false : true;
        //console.log("user loged in :", isLogedIn);
        if (isLogedIn === false) {await loginUser(page)}

        //on home page, await CASINO link/icon to be visible, then click
        let casinoLocator = "span.tab-text:has-text('Casino')";
        await page.waitForSelector(casinoLocator);
        await page.locator(casinoLocator).click();

        //wait for visibility of jetx image and then click on parent container to navigate to crash game
        let jetxImg = "//img[@src='https://www.betpawa.ng/media/casino/smartsoft/18/Jetx%20Thumbnail%20new-min.jpg']";
        let jexImgParent = "div.casino-item:has(img[src='https://www.betpawa.ng/media/casino/smartsoft/18/Jetx%20Thumbnail%20new-min.jpg'])"
        await page.waitForSelector(jetxImg);
        await page.locator(jexImgParent).click();

        //on jexcrash page, #page is in iframes
        await page.waitForTimeout(5000);
        await page.waitForSelector("div.iframe-block");
        let iframe1 = await page.frameLocator("iframe[title='JetX']"); //first frame laoded and located
        let iframe2 = await iframe1.frameLocator("#game-frame"); //second frame loaded and located

    
        let triggerNum = 2; // used trigger betstart, betstop, or recordDelays.
        let cashOutPoint = 1.95; //the point you wish cashout, must match math used to cal betMoney to avoid loss
        let betMoney = {
            //instance : amount
            1 : (1.10 * 5),
            2 : (2.25 * 5),
            3 : (4.62 * 5),
            4 : (9.50 * 5),
            5 : (19.50 * 5),
            6 : (40.00 * 5),
            //for betpawa.ng, the minimum bet amount for jetX is 5naira
        };
        let betInstance = {
            toBet: {instance: undefined, amount: 0},
            nextBet: {instance: undefined, amount: 0}
            //please "won" must be set to either true or false depending whether bet is win or lost
        };
        let winInstances = []; //empty initially
        let delayRecord = {delay: 0, maxDelay: 0};
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

        //enable auto collect and setup cashout point(number)
        await iframe2.locator("div#button-0 div.bet-input.cash-out label.checkbox > span").click(); //enables auto collect
        await iframe2.locator("input#cash-out-value-0").fill(cashOutPoint.toString()) //sets auto collect number
        await iframe2.locator("#bet-value-0").clear(); //clear bet input

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

                //check 1 - increment delayRecord if condition is right
                if ((crashNums.currentCrash.num < triggerNum) && (crashNums.previousCrash.num >= triggerNum)) {
                    delayRecord.delay = await delayRecord.delay + 1
                }

                //check 2 - reset to default if conditions are met
                if ((crashNums.currentCrash.num >= triggerNum) && (crashNums.previousCrash.num >= triggerNum)) {
                    if (delayRecord.delay > delayRecord.maxDelay) {
                        delayRecord.maxDelay = await delayRecord.delay
                    }
                    delayRecord.delay = await 0;
                    console.log(delayRecord);
                    
                    if (betInstance.toBet.instance !== undefined) {
                        //this implies that the last bet instance was initiated and won..,
                        //..append 1 to winInstances(list) to indicate win instance
                        await winInstances.push(1);
                        console.log(winInstances);

                        //set betInstances to reflect win
                        betInstance = await {
                            toBet: {instance: undefined, amount: 0},
                            nextBet: {instance: undefined, amount: 0}
                        };
                        console.log(betInstance);
                    }
                    await iframe2.locator("#bet-value-0").clear(); //clear bet input
                }

                //check 3 - initiate bet instance if conditions are met
                if ((crashNums.currentCrash.num >= triggerNum) && (delayRecord.delay >= 2) && (winInstances.length < 5)) {

                    if (betInstance.toBet.instance === undefined) { //set up the first bet instance
                        betInstance = await {
                            toBet: {
                                ...betInstance.toBet,
                                instance: parseInt(Object.keys(betMoney)[0]),
                                amount: Object.values(betMoney)[0]
                            },
                            nextBet: {
                                ...betInstance.toBet,
                                instance: parseInt(Object.keys(betMoney)[1]),
                                amount: Object.values(betMoney)[1]
                            }
                        }
                    }
                    else { //set up for supsequent bet instances
                        betInstance = await {
                            toBet: {...betInstance.nextBet},
                            nextBet: {
                                instance: parseInt(betInstance.nextBet.instance) + 1,
                                amount: betMoney[betInstance.nextBet.instance + 1],
                            }
                        } 
                    }

                    console.log("/** ", delayRecord, " && ", betInstance, " **/");
                    //initiate bet nextBet instance
                    let betAmount = await betInstance.toBet.amount.toString();
                    await iframe2.locator("#bet-value-0").clear(); //clear bet input
                    await iframe2.locator("#bet-value-0").pressSequentially(betAmount); //enters betAmount humanly
                    await iframe2.locator("#bet-value-0").blur(); //removes focus from input element
                    await iframe2.locator("div#bet-0").click(); //clicks the bet botton to initiate bet
                }
            }
        };
        await setInterval(evaluteCrash, 1000);

        await page.waitForTimeout(5000000);
        //take a screenshoot
        await page.screenshot({path: "./screenshoots/betpawa.png"});

        //close context
        await context.close();
    }
    catch(error) {console.log(error)}
}


module.exports = {jetXStarter};
