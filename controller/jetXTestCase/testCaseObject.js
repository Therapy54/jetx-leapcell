/**
 * defines the testCaseObject use in jetXTextCase.js
**/

let {eventEmitter, emitError, emitMessage} = require("../eventEmitter.js");




let testCaseObject = {
    hundredDelays: {delay: 0, maxDelay: 0},
    consecutiveDelays: {delay: 0, maxDelay: 0},
    sequentialDelays: {delay: 0, maxDelay: 0},

    /**
     *********** Functions ***************
    **/

    async recordHundredDelays(currentCrash) {
        if (currentCrash.num <= 100) {
            this.hundredDelays.delay = await this.hundredDelays.delay + 1;
        }
        else {
            if (this.hundredDelays.delay > this.hundredDelays.maxDelay) {
                this.hundredDelays.maxDelay = await this.hundredDelays.delay;
                await console.log(
                    "hundredDelays maxDelay: ",
                    `${this.hundredDelays.maxDelay}`
                );
                await eventEmitter.emit(
                    "message",
                    `hundredMaxDelays: ${this.hundredDelays.maxDelay}`
                );
                
            }
            this.hundredDelays.delay = 0;
        }
    },


    async recordConsecutiveDelays(triggerNum, currentCrash) {
        if (currentCrash.num <= triggerNum) {
            this.consecutiveDelays.delay = await this.consecutiveDelays.delay + 1;
        }
        else {
            if (this.consecutiveDelays.delay > this.consecutiveDelays.maxDelay) {
                this.consecutiveDelays.maxDelay = await this.consecutiveDelays.delay;
                await console.log(
                    "consecutiveDelays maxDelay: ",
                    `${this.consecutiveDelays.maxDelay}`
                );
                await eventEmitter.emit(
                    "message",
                    `consecutiveMaxDelays: ${this.consecutiveDelays.maxDelay}`
                );
            }
            this.consecutiveDelays.delay = 0;
        }
    },


    async recordSequentialDelays(triggerNum, currentCrash, previousCrash) {
        //check 1
        if ((currentCrash.num < triggerNum) && (previousCrash.num >= triggerNum)) {
            this.sequentialDelays.delay = await this.sequentialDelays.delay + 1;
        }

        //check 2
        if ((currentCrash.num >= triggerNum) && (previousCrash.num >= triggerNum)) {
            if (this.sequentialDelays.delay > this.sequentialDelays.maxDelay) {
                this.sequentialDelays.maxDelay = await this.sequentialDelays.delay;
                await console.log(
                    "sequentialDelays maxDelay: ",
                    `${this.sequentialDelays.maxDelay}`
                );
                await eventEmitter.emit(
                    "message",
                    `sequentialMaxDelays: ${this.sequentialDelays.maxDelay}`
                );
            }
            this.sequentialDelays.delay = 0;
        }
    },


    async ParentFunction(funcParams) {
        let {
            triggerNum,
            currentCrash,
            previousCrash
        } = await funcParams;

        await this.recordHundredDelays(currentCrash);
        await this.recordConsecutiveDelays(triggerNum, currentCrash);
        await this.recordSequentialDelays(triggerNum, currentCrash, previousCrash);
    }
}



module.exports = {testCaseObject}

