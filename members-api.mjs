import { Agent, get } from 'https';
import { mkdirSync, writeFileSync } from 'fs';

const agent = new Agent({ keepAlive:true });
const options = {
  hostname: 'members-api.parliament.uk',
  agent
};

const request = path => 
  new Promise((resolve, reject) => {
    const req = get({ ...options, path }, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const response = JSON.parse(data);
        resolve(response);
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });

const getMembers = (skip) => {
  const path = `/api/Members/Search?House=1&IsCurrentMember=true&skip=${skip}`;
  return request(path);
}

const getContactDetails = (id) => {
  const path = `/api/Members/${id}/Contact`;
  return request(path);
}

(async () => {
  const allMembers = [];
  let skip = 0;

  while (true) {
    const members = await getMembers(skip);
    allMembers.push(...members.items.map(member => ({
      id: member.value.id,
      name: member.value.nameDisplayAs,
      party: member.value.latestParty.name,
      constituency: member.value.latestHouseMembership.membershipFrom
    })));

    if (allMembers.length < members.totalResults) {
      skip = allMembers.length;
      console.log(skip, members.totalResults);
    } else {
      break;
    }
  }

  await Promise.all(allMembers.map(async member => {
    const contactDetails = await getContactDetails(member.id);
    const twitterAccount = contactDetails.value.find(contactDetail => contactDetail.type === 'Twitter');
    if (twitterAccount) {
      member.twitterUsername = twitterAccount.line1.split("https://twitter.com/")[1];
    }
    console.log(member.name, member.twitterUsername);
  }));

  mkdirSync('output', { recursive: true });
  writeFileSync('output/members-api.json', JSON.stringify(allMembers, null, 2));
  console.log(allMembers);
})();


