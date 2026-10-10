---
path: /tools/callback-time-zones/
type: tool
tool: callback-time-zones
title: Callback Time Zones: convert a callback time worldwide
description: Enter a date and time in one zone and see it in ten others, with a business-hours flag for each, so you never promise a callback at midnight.
h1: Callback Time Zones
lede: Enter a time in one zone and see the same moment in ten others, with a note on whether it falls in business hours.
crumb: Callback Time Zones
related: /tools/cancellation-deadline/, /tools/sla-due-time/, /glossary/
updated: 2026-10-05
---
## What it does

You choose the zone you are entering the time in and pick a date and time. The tool shows the same moment in ten zones: the Philippines, US Eastern, Central, Mountain and Pacific, the United Kingdom, Central Europe, the UAE, Singapore and Sydney. Each row shows the local time, the local date with "next day" or "previous day" where it differs, and a flag: **Business hours**, **Outside 9 to 6** or **Weekend**. The flag is written out as well as shown as a coloured dot, so it does not rely on colour.

## How to use it

1. Choose the zone in which you are entering the time. It starts on Manila.
2. Pick the date and time, or press **Use current time** to fill in now.
3. Scan the list for the customer's zone and read the local time and the flag.
4. Offer a callback only if the row says **Business hours** for the customer, unless they asked for a time outside them.

## Worked example

It is 9:00 AM on Monday 5 October 2026 in Manila. In the list, US Eastern shows 9:00 PM on Sunday 4 October, with the note "previous day" and the flag **Weekend**. The United Kingdom shows 2:00 AM on Monday, which is **Outside 9 to 6**. Sydney, which moved to daylight time on 4 October, shows 12:00 PM on Monday, which is **Business hours**. A callback promised "this morning" to a New York customer would land on their Sunday evening, which is exactly the mistake this tool prevents.

## How it works

Time zones are looked up with your browser's built-in international date and time support, which includes the daylight-saving rules for each zone. Business hours here mean 9:00 AM up to but not including 6:00 PM, Monday to Friday, in the local zone. That is a convenient default, not a rule: a customer's own working hours and public holidays are not known to the tool. When daylight saving changes in one zone and not another, the gap between them changes with it, which is why you should convert for the actual date and not rely on remembering a fixed difference.

The Philippines, Singapore and the UAE do not change their clocks. US and European zones change on different dates, so for a few weeks each spring and autumn the gap between them is not the usual one.

## Mistakes to avoid

- **Assuming a fixed difference.** The gap between Manila and New York is 12 hours in US summer time and 13 hours in winter.
- **Entering the time in the wrong zone.** Check the "Time entered in" box before you read the results.
- **Assuming the customer's zone from their country.** Large countries have several zones. Ask.
- **Ignoring local holidays.** The flag knows weekends, not public holidays.

## Questions

::: faq
Q: Can I add another zone?
A: This tool shows a fixed list of ten. The Cancellation Deadline Checker and the Partner SLA Due-Time Calculator offer a longer list of travel locations.
Q: Why is the time slightly different from my phone?
A: The tool uses your device clock. If your device clock is wrong, so is the conversion.
Q: What does "next day" mean?
A: The local date in that zone is one day after the date you entered. "Previous day" means one day before.
:::
