import { createReadStream } from 'fs';

(async () => {
    const mps = await new Promise((resolve, reject) => {
        let resultsString = "";
    
        createReadStream('output/members-api-and-pol-social-and-twitter.json')
            .on('data', (data) => resultsString += data)
            .on('end', () => resolve(JSON.parse(resultsString)))
            .on('error', (err) => reject(err));
    });

    const results = {};

    const aliases = {
        "Conservative": ["Conservative", "Tory", "Tories"],
        "Labour": ["Labour"],
        "Liberal Democrat": ["Liberal Democrat", "Lib Dem", "Lib Dems"],
        "Scottish National Party": ["SNP", "Scottish National Party"]
    }

    mps.forEach(mp => {
        if (!aliases[mp.party]) {
            return;
        }

        if (!results[mp.party]) {
            results[mp.party] = {
                proud: [],
                shy: [],
                invisible: []
            };
        }

        if (!mp.description) {
            results[mp.party].invisible.push(mp);
        } else if (aliases[mp.party].some(alias => mp.description.includes(alias))) {
            results[mp.party].proud.push(mp);
        } else {
            results[mp.party].shy.push(mp);
        }
    });

    Object.keys(results).forEach(party => {
        console.log(party);
        console.log(results[party].proud.length);
        console.log(results[party].shy.length);
        console.log(results[party].invisible.length);
    });
})();
