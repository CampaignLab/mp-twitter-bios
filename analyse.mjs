import { readFileSync, writeFileSync } from 'fs';

const PARTY_ALIASES = {
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

const mps = JSON.parse(readFileSync('output/members-api-and-pol-social-and-twitter.json', 'utf8'));

const results = {};

mps.forEach(mp => {
    if (mp.party === "Speaker" || mp.party === "Independent") {
        return;
    }

    if (mp.party === "Labour (Co-op)") {
        mp.party = "Labour";
    }

    if (!PARTY_ALIASES[mp.party]) {
        throw (`Unknown party ${mp.party}`)
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

    if (!mp.twitterUsername) {
        results[mp.party].invisible.push(mp);
    } else if (PARTY_ALIASES[mp.party].some(alias => mp.description.toLowerCase().includes(alias.toLowerCase()))) {
        results[mp.party].proud.push(mp);
    } else {
        results[mp.party].shy.push(mp);
    }
});

writeFileSync('output/analysis.json', JSON.stringify(results, null, 2));
