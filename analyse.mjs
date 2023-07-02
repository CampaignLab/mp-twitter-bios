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

    let summaryString = "\n";
    summaryString += "| Party | Total | Proud | Shy | Invisible |\n";
    summaryString += "| - | - | - | - | - |\n";

    const sortedParties = Object.keys(results)
        .sort((a, b) => {
            const size = results[b].total - results[a].total;
            return size !== 0 ? size : a.localeCompare(b);
        });

    sortedParties
        .filter(party => results[party].total > 9)
        .forEach(party => {
            summaryString += `| __${party}__ | ${results[party].total} | ${results[party].proud.length} | ${results[party].shy.length} | ${results[party].invisible.length} |\n`;
        });

    let resultsString = "\n";

    const sanitiseDescription = (description) =>
        description
            .replaceAll("\n", "<br>")
            .replaceAll("|", "\|");

    const renderResultsTable = (description, mpList) => {
        let outputString = "| Name | Constituency | Bio |\n";
        outputString += "| - | - | - |\n";
        mpList.forEach(mp => {
            outputString += `| [${mp.name}](https://twitter.com/${mp.twitterUsername}) | ${mp.constituency} | ${sanitiseDescription(mp.description)} |\n`;
        });

        return `<details>
<summary>${description} (${mpList.length})</summary>

${outputString}
</details>
`;
    }

    const renderTwitterlessResultsTable = (description, mpList) => {
        let outputString = "| Name | Constituency |\n";
        outputString += "| - | - |\n";
        mpList.forEach(mp => {
            outputString += `| ${mp.name} | ${mp.constituency} |\n`;
        });

        return `<details>
<summary>${description} (${mpList.length})</summary>

${outputString}
</details>
`;
    }


    sortedParties
        .forEach(party => {
            resultsString += "\n";
            resultsString += `### ${party}\n`;

            if (results[party].proud.length) {
                resultsString += renderResultsTable("Proud", results[party].proud);
            }

            if (results[party].shy.length) {
                resultsString += renderResultsTable("Shy", results[party].shy);
            }

            if (results[party].invisible.length) {
                resultsString += renderTwitterlessResultsTable("Not on Twitter", results[party].invisible);
            }

            resultsString += "\n";
            resultsString += "<br>";
            resultsString += "\n";
        });

    readFile('./docs/index.markdown', 'utf8', function (err, data) {
        console.log(err);
        let updatedData = data;

        const updateMarkdown = (startComment, endComment, newContent) => {
            const startIndex = data.indexOf(startComment);
            const endIndex = data.indexOf(endComment);

            if (startIndex === -1 || endIndex === -1) {
                throw new Error("Couldn't find start or end comment");
            }

            updatedData = updatedData.substring(0, startIndex + startComment.length) + newContent + updatedData.substring(endIndex);
        }

        updateMarkdown("<!--summary-auto-gen-begin-->", "<!--summary-auto-gen-end-->", summaryString);
        updateMarkdown("<!--results-auto-gen-begin-->", "<!--results-auto-gen-end-->", resultsString);
        
        writeFile('./docs/index.markdown', updatedData, 'utf8', function (err) {
            console.log(err);
        });
    });
})();
