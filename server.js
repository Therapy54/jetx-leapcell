require("dotenv").config();
let express = require("express");
let cors = require("cors");
let OS = require("os");
let {v6:uid6} = require("uuid");

let app = express();
let PORT = process.env.PORT;
let corsOptions = {origin:"*"}
app.use(cors(corsOptions));
app.use(express.json());


//controllers
let {jetXTestCase} = require("./controller/jetXTestCase/jetXTestCase.js");
let {jetXStarter} = require("./controller/jetXStarter/jetXStarter.js");
let {eventEmitter, emitError, emitMessage} = require("./controller/eventEmitter.js");
let {sendEmail} = require("./sendEmail/sendEmail.js");


//start event emitters
eventEmitter.on("message", emitMessage);
eventEmitter.on("error", emitError);


//playwright
let { chromium } = require('playwright');
let betpawaAuthPath = "../auth/betpawa.json";
let createContextPage = async()=> {
    /**
     * function launches chromium browser with persisted context and..,
     * creates the page instance.
     * returns object of both page and context instances
    **/

    let context = undefined;
    if (!process.env.local_env_id) {
        //on my local machine, create browser context with persistence
        context = await chromium.launchPersistentContext(
            betpawaAuthPath,
            {
                headless: false,
                args: [],
                viewport: {width:1024, height:768}
            }
        );
    }
    else {
        //on server environment, create browser context without persistence
        context = await chromium.launch(
            {
                headless: true,
                args: (process.env.local_env_id)?
                    [] :
                    [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--single-process',
                        '--disable-web-security',
                        '--user-data-dir=/tmp/playwright-user-data' // Use a temporary directory
                    ],
                viewport: {width:1024, height:768}
            }
        );
    }
    let page = await context.newPage()
    .catch(async(error)=> {
        let msg = error;
        let name = "error";
        await sendEmail(msg, name);
        await console.error(error);
        await context.close();
    });
    return await {context, page};
}



app.get("/jetX-launch/launch", async(req, res)=> {

    /**
     * query string for choosing which bot launch from url looks like:
     * /jetX-launch/launch?case="botToLaunch" (jetXTestCase || jetXStarter || jetXMain);
     * e.g (/jetX-launch/launch?case="jetXTestCase")
    **/
    let launchCase = (req.query.case) && await(JSON.parse(req.query.case));
    console.log("==>> Request query to launch jetx-bot instance: ", launchCase);

    let {context, page} = await createContextPage(); //launches playwright context and page


    try {
        if (launchCase) {

            if (launchCase === "jetXTestCase") {
                await jetXTestCase(context, page);
                await console.log(`Hello, playwright has launched: ${launchCase}!`);
            }
            else if ((launchCase ==="jetXStarter")) {
                await jetXStarter(context, page);
                await console.log(`Hello, playwright has launched: ${launchCase}!`);
            }
            else if (launchCase === "jetXMain") {
                await jetXMain(context, page);
                await console.log(`Hello, playwright has launched: ${launchCase}!`);
            }
            else {
                await console.log("no match for jetX launch query, case!!");
                throw await new Error("no match for jetX launch query!");
            }
        }
        else {
            throw await new Error("invalid request query for jetX-bot");
        }
        await res.send("Hello, i'm playwright jetX-bot!");
    }
    catch(error) {
        await eventEmitter.emit("error", error);
        if (context) {
            await context.close();
            await console.log("browser context closed successfully!");
        }
    }
});




app.listen(PORT, ()=> {
    console.log(`Hi ${OS.hostname()}, Express is serving you now!`);
});

