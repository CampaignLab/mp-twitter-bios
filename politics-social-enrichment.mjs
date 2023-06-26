import { createReadStream } from 'fs';
import csv from 'csv-parser';
import {mkdirSync, writeFileSync} from 'fs';

(async () => {
    const politicsSocialMembers = await new Promise((resolve, reject) => {
        const results = [];
    
        createReadStream('MPsonTwitter_list_name.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            }).on('error', (err) => {
                reject(err);
            });
    });
    
    const members = await new Promise((resolve, reject) => {
        let resultsString = "";
    
        createReadStream('output/members-api.json')
            .on('data', (data) => resultsString += data)
            .on('end', () => {
                resolve(JSON.parse(resultsString));
            }).on('error', (err) => {
                reject(err);
            });
    });

    members.forEach(member => {
        const psMember = politicsSocialMembers.find(candidate => {
            if (member.name.includes(candidate.Name.trim())) {
                return true;
            } else if (member.twitterUsername?.toLowerCase() === candidate["Screen name"].split("@")[1].toLowerCase()) {
                return true;
            } else if (member.constituency === candidate.Constituency && compare(member.name, candidate.Name) > 0.2) {
                return true;
            } else {
                return false;
            }
        });

        if (!member.twitterUsername && psMember) {
            member.twitterUsername = psMember["Screen name"].split("@")[1];
            console.log(`Matched ${member.name} to ${member.twitterUsername}`);
        }

        if (!member.twitterUsername) {
            console.log(`No match for ${member.name}`);
        }
    });

    mkdirSync('output', { recursive: true });
    writeFileSync('output/members-api-and-politics-social.json', JSON.stringify(members, null, 2));
})();

function compare(name1, name2) {
    const titles = ["sir", "dr", "mr", "mrs", "ms", "miss", "qc", "kc"];
    const name1Parts = name1.toLowerCase().trim().split(" ").filter(part => !titles.includes(part));
    const name2Parts = name2.toLowerCase().trim().split(" ").filter(part => !titles.includes(part));

    let score = 0;

    name1Parts.forEach(name1Part => {
        name2Parts.forEach(name2Part => {
            if (name1Part === name2Part) {
                score += 1;
            } else if (name1Part.includes(name2Part) || name2Part.includes(name1Part)) {
                score += 0.5;
            } else if (name1Part[0] === name2Part[0]) {
                score += 0.5;
            }
        });
    });

    return score / (name1Parts.length + name2Parts.length);
}
