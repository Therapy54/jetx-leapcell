/**
 * the program code here navigates to the jetX page after successful user login,
 * returns true if navigation is successfull, else false.
**/




let goToJetXPage = async(page)=> {
    try {
        //on home page, await CASINO link/icon to be visible, then click
        let casinoLocator = "span.tab-text:has-text('Casino')";
        await page.waitForSelector(casinoLocator);
        await page.locator(casinoLocator).click();

        //wait for visibility of jetX image..,
        //..then click on parent container to navigate to the jetX crash game
        let url1 = "https://www.betpawa.ng/media/casino/smartsoft/18/Jetx%20Thumbnail%20new-min.jpg";
        let jetxImg = `//img[@src=${url1}]`;
        let url2 = "https://www.betpawa.ng/media/casino/smartsoft/18/Jetx%20Thumbnail%20new-min.jpg";
        let jexImgParent = `div.casino-item:has(img[src=${url2}])`;
        await page.waitForSelector(jetxImg);
        await page.locator(jexImgParent).click();

        //on jetX crash page? true : false
        await page.waitForSelector("div.iframe-block");
        let  isPage = (await page.locator("div.iframe-block").count() === 1)? true : false;
        if (isPage) {return true}
        else {return false}
    }
    catch(error) {console.log(error)}
}



module.exports = {goToJetXPage};
