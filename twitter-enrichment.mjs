import { chromium, errors } from 'playwright';
import { createReadStream, mkdirSync, writeFileSync } from 'fs';

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

(async () => {
    const startIndex = 250;

    const members = (await new Promise((resolve, reject) => {
        let resultsString = "";
    
        createReadStream('output/members-api-and-politics-social.json')
            .on('data', (data) => resultsString += data)
            .on('end', () => {
                const mps = JSON.parse(resultsString);
                resolve(mps);
            }).on('error', (err) => {
                reject(err);
            });
    })).slice(startIndex);

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    let i = startIndex;

    for await (const member of members) {
        // await delay(1000);
        i++;
        console.log(i);

        if (!member.twitterUsername) {
            continue;
        }

        await page.goto(`https://twitter.com/${member.twitterUsername}`)
        let json;

        try {
            json = await page.locator("script[data-testid=UserProfileSchema-test]").innerText({
                timeout: 1000
            })
          } catch (error) {
            console.log(error);
            if (error instanceof errors.TimeoutError) {
                let errorText;
                try {
                    errorText = await page.locator("div[data-testid=empty_state_header_text]").innerText();
                } catch (error) {
                    console.log(error);
                    await new Promise(() => {});
                }
                if (errorText === "This account doesn’t exist" || errorText === "Account suspended") {
                    console.log("Account doesn't exist", member.twitterUsername)
                    delete member.twitterUsername;
                    continue;
                }

                console.log("Couldn't find", member.twitterUsername)
                await new Promise(() => {});
                continue;
            }
          }

        const data = JSON.parse(json);
        member.description = data.author.description;
    }
    
    mkdirSync('output', { recursive: true });
    writeFileSync('output/members-api-and-pol-social-and-twitter.json', JSON.stringify(members, null, 2));
    
    browser.close()
})();
