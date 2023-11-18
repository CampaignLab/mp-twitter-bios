import { chromium, errors } from 'playwright';
import { createReadStream, mkdirSync, writeFileSync } from 'fs';

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

let browser;
let page;

async function newInstance() {
    if (browser) {
        await browser.close();
    }

    browser = await chromium.launch({
        headless: false
    });
    const context = await browser.newContext();
    page = await context.newPage();
}

(async () => {
    const startIndex = 0;

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

    await newInstance();

    let i = startIndex;

    const attempt = async (member, isFirstAttempt) => {
        let json;
        try {
            await page.goto(`https://twitter.com/${member.twitterUsername}`)
            json = await page.locator("script[data-testid=UserProfileSchema-test]").innerText({
                timeout: 2000
            })
        } catch (error) {
            console.log(error);
            if (error instanceof errors.TimeoutError) {
                let errorText;
                try {
                    errorText = await page.locator("div[data-testid=empty_state_header_text]").innerText({
                        timeout: 2000
                    });
                } catch (error) {
                    console.log(error);
                }

                if (errorText === "This account doesn’t exist" || errorText === "Account suspended") {
                    console.log("Account doesn’t exist");
                    throw new Error(errorText);
                }

                if (isFirstAttempt) {
                    console.log("Retrying unknown error", member.twitterUsername);
                    await newInstance();
                    return await attempt(member, false);
                }

                console.log("Already retried", member.twitterUsername)
                return await new Promise(() => { });
            }
        }
        return json;
    }

    for await (const member of members) {
        i++;

        if (!member.twitterUsername) {
            continue;
        }

        console.log(i, member.twitterUsername);

        let json;

        try {
            json = await attempt(member, true);
        } catch (error) {
            delete member.twitterUsername;
            continue;
        }

        const data = JSON.parse(json);
        member.description = data.author.description;

        mkdirSync('output', { recursive: true });
        writeFileSync('output/members-api-and-pol-social-and-twitter.json', JSON.stringify(members, null, 2));
    }

    browser.close()
})();
