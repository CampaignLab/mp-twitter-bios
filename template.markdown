A [Campaign Lab](https://www.campaignlab.uk/) project

# Which MPs mention their party in their Twitter bio?

## Summary

We analysed the Twitter biographies of each UK Member of Parliament (MP) to see whether they mentioned their political party.  A summary of the results for parties with 10 or more MPs is as follows:

<!--summary-auto-gen-->

Percentages for a party may not total 100% due to rounding.  If something doesn't look right, please get in touch by raising an issue [here](https://github.com/12v/mp-twitter-bios/issues).

## Introduction

Twitter is commonly used by MPs to engage with the public and communicate their political messages.  Twitter users have the opportunity to specify a short biography (or 'bio') for their account, to provide information about themselves.  Following [reports](https://twitter.com/carolvorders/status/1642879704787984385) that some MPs were not mentioning their political party in their bio, we analysed all MPs' Twitter bios to see how commonly this occurred.

## Results

As of 18/09/2023.  Past write-ups: [02/07/2023](https://12v.github.io/mp-twitter-bios/archive/2023-07-02.html).

<!--results-auto-gen-->

## Methodology

Parliament's [Members API](https://members-api.parliament.uk/index.html) was used to source all MPs and their current party, and Twitter usernames for those MPs that have chosen to submit the information to Parliament's IT team.

This data was enriched with information from [Politics Social's curated list](https://www.politics-social.com/list/name) of MP Twitter usernames.  This provides some usernames that aren't available from Parliament's Members API.

For each MP, we visited their Twitter profile and retrieved the text of their biography.

For each party, we counted the MPs that do or don't mention the name of their party in their bio, or that don't have a Twitter account.

## Discussion

The results show that Conservative MPs are much more likely not to mention their party in their Twitter bio, or not to have a Twitter account altogether.

There are several reasons why an individual MP might choose to omit mention of their party from their bio.  They may wish to appeal to a wider range of constituents, or to avoid potential backlash or controversy associated with their party.  They may seek to prioritise building their personal brand over their party affiliation, or position themselves as an advocate of non-partisan issues.

Potential avenues for further investigation include exploring whether there is a correlation between specific characteristics of MPs and their tendency to mention their party affiliation.  Characteristics could include:
 - MPs associated with a particular bloc or committee, like the 1922 committee.
  - MPs elected during specific parliamentary elections.
  - MPs who hold membership or actively participate in other organisations.
  - The size of an MP's majority.

We can also track changes in these results going forward to see what trends emerge.
