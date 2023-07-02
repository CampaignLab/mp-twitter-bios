---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

# Which MPs mention their party in their Twitter bio?

## Summary

We analysed the Twitter biographies of each MP to see whether they mentioned their political party.  A summary of the results for all parties with 10 or more MPs are as follows:

<!--summary-auto-gen-begin-->
<!--summary-auto-gen-end-->

If something doesn't look right, please get in touch by raising a ticket [here](https://github.com/12v/mp-twitter-bios/issues).

## Table of contents

## Introduction

How many MPs are willing to admit which party they belong to?  Do the MPs of some parties take more pride in their party than others?  We crunched the bios to find out.

Inspired by [this thread](https://twitter.com/carolvorders/status/1642879704787984385).

## Results

<!--results-auto-gen-begin-->
<!--results-auto-gen-end-->

## Methodology

Parliament's members API was first used to source all MPs and their current party, and for those that have chosen to submit the information to Parliament's IT team, their Twitter usernames.
Next this data is enriched with information from politics social's curated list of MP usernames.  This provides some MP twitter usernames that aren't available from Parliament's members API.
For each MP, we then load their profile on Twitter and retrieve the text of their biography.  At this stage, if an MP's username isn't we valid, we update the entry we hold for them to reflect that they don't currently have a Twitter account.
Finally, we calculate the breakdown of MPs that do or don't mention their party in their bio or don't have a Twitter account, broken down by party.

## Discussion

Next steps could be to investigate whether there is a correlation between some characteristic of these MPs and their likelihood to mention their party in their bio.  For example, belonging to a particular bloc, joining parliament at a specifi election, or membership/participation in other organisations.
We could xplore how this has changed in the past, which will need access to some kind of archive which may not exist.  We can track this going forward to see how it changes.

What does this tell us about whether MPs are defined by their parties or by their individual name recognition?

## References
