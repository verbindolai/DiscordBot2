const puppeteer = require('puppeteer');
const url = "https://gharaei.de/en/";

export function run () {
    return new Promise(async (resolve, reject) => {
        try {

            const browser = await puppeteer.launch({headless:true});
            const page = await browser.newPage();


            console.log("\nStart scraping...")
            await page.goto(url);
            await page.waitForSelector('.entry-content')
            let posts = await page.evaluate(() => {
                const headerConditions =["[","2021]"]
                let childs = document.querySelector('.entry-content')?.children

                if (!childs) {
                    return;
                }
                const posts = []
                let date = ""
                let message = ""
                for (let i = 0; i < childs.length; i++){

                    const content = childs[i].textContent
                    console.log("Content: " + content)
                    if (content == null || content == undefined){
                        continue;
                    }
                    if (content.includes('2021]')){
                        if(i > 0){
                            const post = {date:date, message:message}
                            posts.push(post)
                            date = "";
                            message = "";
                        }
                        date = content;
                    } else {
                        message += content;
                    }
                    if (i+1 === childs.length){
                        const post = {date:date, message:message}
                        posts.push(post)
                        date = "";
                        message = "";
                    }
                }
                return posts;
            })

            await browser.close();
            console.log('Finished scraping.')
            return resolve(posts);
        } catch (e) {
            return reject(e);
        }
    })
}
