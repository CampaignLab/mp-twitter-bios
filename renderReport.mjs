import { readFileSync, writeFileSync } from 'fs';
import { config } from 'dotenv';
import https from 'https';
config();

const results = JSON.parse(readFileSync('output/analysis.json', 'utf8'));

const templateString = (data, comment, newContent) => {
    const index = data.indexOf(comment);

    if (index === -1 ) {
        throw new Error("Couldn't find comment");
    }

    return data.substring(0, index) + newContent + data.substring(index + comment.length);
}

let summaryString = "\n";
summaryString += "| Party | # of MPs | # of MPs mentioning their party | # of MPs not mentioning their party | # of MPs not on Twitter |\n";
summaryString += "| - | - | - | - | - |\n";

const partiesSortedBySize = Object.keys(results)
    .sort((a, b) => {
        const size = results[b].total - results[a].total;
        return size !== 0 ? size : a.localeCompare(b);
    });

partiesSortedBySize
    .filter(party => results[party].total > 9)
    .forEach(party => {
        summaryString += `| ${party} | ${results[party].total} | ${results[party].proud.length} | ${results[party].shy.length} | ${results[party].invisible.length} |\n`;
    });

let resultsString = "\n";

const sanitiseDescription = (description) =>
    description
        .replaceAll("\n", "<br>")
        .replaceAll("|", "\|");

const renderDetails = (summary, details) =>
    `<details>
<summary>${summary}</summary>

${details}
</details>
`;

const renderResultsTable = (description, mpList, total) => {
    let outputString = "| Name | Constituency | Bio |\n";
    outputString += "| - | - | - |\n";
    mpList.forEach(mp => {
        outputString += `| [${mp.name}](https://twitter.com/${mp.twitterUsername}) | ${mp.constituency} | ${sanitiseDescription(mp.description)} |\n`;
    });

    return renderDetails(`${description} (${mpList.length} of ${total})`, outputString);
}

const renderTwitterlessResultsTable = (description, mpList, total) => {
    let outputString = "| Name | Constituency |\n";
    outputString += "| - | - |\n";
    mpList.forEach(mp => {
        outputString += `| ${mp.name} | ${mp.constituency} |\n`;
    });

    return renderDetails(`${description} (${mpList.length} of ${total})`, outputString);
}

partiesSortedBySize
    .forEach(party => {
        let partyString = "";

        const totalCount = results[party].total;

        if (results[party].proud.length) {
            partyString += renderResultsTable("Proud", results[party].proud, totalCount);
        }

        if (results[party].shy.length) {
            partyString += renderResultsTable("Shy", results[party].shy, totalCount);
        }

        if (results[party].invisible.length) {
            partyString += renderTwitterlessResultsTable("Not on Twitter", results[party].invisible, totalCount);
        }

        resultsString += renderDetails(party, partyString);

        resultsString += "<br>";
    });

let markdownString = readFileSync('./template.markdown', 'utf8');

markdownString = templateString(markdownString, "<!--summary-auto-gen-->", summaryString);
markdownString = templateString(markdownString, "<!--results-auto-gen-->", resultsString);

const options = {
    hostname: 'api.github.com',
    path: '/markdown/raw',
    method: 'POST',
    headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `${process.env.GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'text/plain',
        'User-Agent': 'sigh'
    }
};

const req = https.request(options, res => {
    let htmlString = '';
    res.on('data', d => {
        htmlString += d;
    });
    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`Request failed with status code ${res.statusCode} and body ${htmlString}`);
        }

        const templateHtml = readFileSync('./template.html', 'utf8');

        htmlString = templateString(templateHtml, "<insert-content-here />", htmlString);

        writeFileSync('./docs/index.html', htmlString, 'utf8');
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(markdownString);
req.end();
