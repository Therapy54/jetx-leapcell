/**
 * this class initiates the bot's main login,/
 * it declares the main attributes and methods ..,
 * neccessary for controling the bot instance. 
**/



class JetXClass {
    triggerNum = 2; // default, used trigger betstart, betstop, or recordDelays.
    cashOutPoint = 1.95; //default, the point you wish cashout
    delayRecord = {delay: 0, maxDelay: 0}; //records the delay and maximum delay
    minBet = 5; //default, the starting minimum bet
    betMoney = {
        //instance : amount
        1 : (1.10 * this.minBet),
        2 : (2.25 * this.minBet),
        3 : (4.62 * this.minBet),
        4 : (9.50 * this.minBet),
        5 : (19.50 * this.minBet),
        6 : (40.00 * this.minBet),
    };
    betInstance = {
        toBet: {instance: undefined, amount: 0},
        nextBet: {instance: undefined, amount: 0}
    };
    winInstances = []; //empty initially
    crashNums = {
        //second element in jetX array
        currentCrash: {id: null, num: null},
        //third element in jetX array
        previousCrash: {id: null, num: null},
    };


    constructor (page, iframe1, iframe2) {
        this.page = page;
        this.iframe1 = iframe1;
        this.iframe2 = iframe2;
        this.#initialBasicSetup();
    }


    async #initialBasicSetup() {//private method, not to overriden
        //enable auto collect,setup cashout number and clear input
        await this.iframe2.locator("div#button-0 div.bet-input.cash-out label.checkbox > span").click(); //enables auto collect
        await this.iframe2.locator("input#cash-out-value-0").fill(this.cashOutPoint.toString()) //sets auto collect number
        await this.iframe2.locator("#bet-value-0").clear(); //clear bet input

        //get the recent crashNums
        let crashNumsContainer = await iframe2.locator("#last100Spins");

        //setup crashNums
        this.crashNums.currentCrash = await{
            id: await crashNumsContainer.locator("div").nth(1).getAttribute("id"),
            num: parseFloat(await crashNumsContainer.locator("div").nth(1).textContent())
        };
        this.crashNums.previousCrash = await {
            id: await crashNumsContainer.locator("div").nth(2).getAttribute("id"),
            num: parseFloat(await crashNumsContainer.locator("div").nth(2).textContent())
        };
    }


    async updatedCrashNums() {
        /**
         * method to update this.crashNums if there is a new crashNum..,
         * returns true or false if any update was made or not.
        **/

        //get the recent crashNums and get the most recent crashNum
        let crashNumsContainer = await iframe2.locator("#last100Spins");
        let latestCrash = await {
            id: await crashNumsContainer.locator("div").nth(1).getAttribute("id"),
            num: parseFloat(await crashNumsContainer.locator("div").nth(1).textContent())
        };

        if (latestCrash.id !== this.crashNums.currentCrash.id) {
            //new jet crash, update this.crashNums
            this.crashNums = await {
                currentCrash: latestCrash,
                previousCrash: crashNums.currentCrash
            };
            console.log(crashNums);
            return true //update was made
        }
        else {
            return false; //no update was made
        }
    }


    async updateRecord() {
        /**
         * method to update the necessary records or instances..,
         * when conditions are met.
        **/

        let isNewCrash = await this.updatedCrashNums(); //assertain if there was a new crash
        if (isNewCrash) {
            //check 1 - increment this.delayRecord if condition is right
            let isCheck1 = await (
                (this.crashNums.currentCrash.num < this.triggerNum)
                    &&
                (this.crashNums.previousCrash.num >= this.triggerNum)
            );
            if (isCheck1) {
                this.delayRecord.delay = await this.delayRecord.delay + 1;
            }

            //check 2 - reset to defaults if conditions are met
            let isCheck2 = await (
                (this.crashNums.currentCrash.num >= this.triggerNum)
                    &&
                (this.crashNums.previousCrash.num >= this.triggerNum)
            );
            if (isCheck2) {
                if (this.delayRecord.delay > this.delayRecord.maxDelay) {
                    this.delayRecord.maxDelay = await this.delayRecord.delay;
                }
                this.delayRecord.delay = await 0;
                
                if (this.betInstance.toBet.instance !== undefined) {
                    //this implies that the last bet instance was initiated and won..,
                    //..append 1 to winInstances(list) to indicate win instance
                    await this.winInstances.push(1);

                    //set betInstances to reflect win
                    this.betInstance = await {
                        toBet: {instance: undefined, amount: 0},
                        nextBet: {instance: undefined, amount: 0}
                    };
                }
                await this.iframe2.locator("#bet-value-0").clear(); //clear bet input
            }

            //check 3 - initiate bet instance if conditions are met
            await this.initiateBetInstance();
        }

        //console.log
        console.log(
            "/**************************** \n",
                this.delayRecord, "\n",
                this.crashNums, "\n",
                this.betInstance, "\n",
                this.winInstances, "\n",
            "****************************\ \n"
        );
    }


    async initiateBetInstance() {
        /**
         * this method creates and initiates bet instances..,
         * if the right conditions are met
        **/

        //check 3 - initiate bet instance if conditions are met
        let isCheck3 = await (
            (this.crashNums.currentCrash.num >= this.titriggerNum)
                &&
            (this.delayRecord.delay >= 2)
        );
        if (isCheck3) {
            if (this.betInstance.toBet.instance === undefined) { //set up the first bet instance
                this.betInstance = await {
                    toBet: {
                        ...this.betInstance.toBet,
                        instance: parseInt(Object.keys(betMoney)[0]),
                        amount: Object.values(betMoney)[0]
                    },
                    nextBet: {
                        ...this.betInstance.toBet,
                        instance: parseInt(Object.keys(betMoney)[1]),
                        amount: Object.values(betMoney)[1]
                    }
                }
            }
            else { //set up for supsequent bet instances
                this.betInstance = await {
                    toBet: {...this.betInstance.nextBet},
                    nextBet: {
                        instance: parseInt(this.betInstance.nextBet.instance) + 1,
                        amount: betMoney[this.betInstance.nextBet.instance + 1],
                    }
                } 
            }

            //initiate bet nextBet instance
            let betAmount = await this.betInstance.toBet.amount.toString();
            await this.iframe2.locator("#bet-value-0").clear(); //clear bet input
            await this.iframe2.locator("#bet-value-0").pressSequentially(betAmount); //enters betAmount humanly
            await this.iframe2.locator("#bet-value-0").blur(); //removes focus from input element
            //await iframe2.locator("div#bet-0").click(); //clicks the bet botton to initiate bet
        }
    }

}



module.exports = {JetXClass};

