import { createReadStream, readFile, writeFile } from 'fs';

(async () => {
    const mps = await new Promise((resolve, reject) => {
        let resultsString = "";
    
        createReadStream('output/members-api-and-pol-social-and-twitter-backup.json')
            .on('data', (data) => resultsString += data)
            .on('end', () => resolve(JSON.parse(resultsString)))
            .on('error', (err) => reject(err));
    });

    const results = {};

    const aliases = {
        "Conservative": ["Conservative", "Tory", "Tories"],
        "Labour": ["Labour", "Lab"],
        "Liberal Democrat": ["Liberal Democrat", "Lib Dem", "Lib Dems", "LibDem"],
        "Scottish National Party": ["SNP", "Scottish National Party"],
        "Democratic Unionist Party": ["DUP", "Democratic Unionist Party"],
        "Sinn Féin": ["Sinn Féin", "Sinn Fein", "SF"],
        "Plaid Cymru": ["Plaid Cymru", "Plaid"],
        "Green Party": ["Green Party", "Green"],
        "The Reclaim Party": ["Reclaim"],
        "Alliance": ["Alliance"],
        "Social Democratic & Labour Party": ["SDLP", "Social Democratic & Labour Party"],
        "Alba Party": ["Alba"]
    }

    mps.forEach(mp => {
        if (mp.party === "Speaker" || mp.party === "Independent") {
            return;
        }

        if (mp.party === "Labour (Co-op)") {
            mp.party = "Labour";
        }

        if (!aliases[mp.party]) {
            throw(`Unknown party ${mp.party}`)
        }

        if (!results[mp.party]) {
            results[mp.party] = {
                total: 0,
                proud: [],
                shy: [],
                invisible: []
            };
        }

        results[mp.party].total++;

        if (!mp.description) {
            results[mp.party].invisible.push(mp);
        } else if (aliases[mp.party].some(alias => mp.description.toLowerCase().includes(alias.toLowerCase()))) {
            results[mp.party].proud.push(mp);
        } else {
            results[mp.party].shy.push(mp);
        }
    });

    let outputString = "\n";
    outputString += "| - | - | - | - | - |\n";

    Object.keys(results)
        .sort((a, b) => {
            const size = results[b].total - results[a].total;
            return size !== 0 ? size : a.localeCompare(b);
        })
        .forEach(party => {
            console.log(party);
            console.log("total", results[party].total);
            console.log("proud", results[party].proud.length);
            console.log("shy", results[party].shy.length);
            console.log("awol", results[party].invisible.length);

            outputString += `| __${party}__ | ${results[party].total} | ${results[party].proud.length} | ${results[party].shy.length} | ${results[party].invisible.length} |\n`;
        });

    console.log(outputString);

    readFile('./docs/index.markdown', 'utf8', function (err,data) {
        console.log(err);
        const startComment = "<!--auto-gen-begin-->";
        const endComment = "<!--auto-gen-end-->";
        const startIndex = data.indexOf(startComment);
        const endIndex = data.indexOf(endComment);
        const updatedData = data.substring(0, startIndex + startComment.length) + outputString + data.substring(endIndex);
        
        writeFile('./docs/index.markdown', updatedData, 'utf8', function (err) {
            console.log(err);
        });
    });
})();
