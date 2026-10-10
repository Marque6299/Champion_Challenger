---
path: /tools/sla-due-time/
type: tool
tool: sla-due-time
title: Partner SLA Due-Time Calculator: calendar and business hours
description: Work out when a hotel, agency or supplier response is due in calendar or business hours, across time zones, skipping weekends and holidays.
h1: Partner SLA Due-Time Calculator
lede: Work out exactly when a partner's response is due, counting calendar hours or only business hours in the partner's own time zone.
crumb: Partner SLA Due-Time Calculator
related: /guides/b2b-hotel-and-agency-calls/, /tools/callback-time-zones/, /tools/lodging-case-notes/, /glossary/
updated: 2026-10-05
---
## What it does

When a partner promises to reply within 24 hours, or a supplier agreement allows four business hours, someone has to say when that deadline actually falls. The answer depends on when the clock started, which hours count, which days count and which time zone the working day is in. This tool takes the moment the request was received, the response time promised and the way it is counted, and returns the exact due time in the partner's time zone and on your device, with how long is left or how overdue it is.

## How to use it

1. Enter when the request was received and the zone you are entering it in, or press **Use current time**.
2. Enter the **hours promised**. Decimals work, so 1.5 means an hour and a half.
3. Choose **Calendar hours** to count around the clock, or **Business hours only**.
4. For business hours, choose the **partner's time zone**, the start and end of its working day and the days it works, and list any holidays as dates in year-month-day form.
5. Read the due time and the verdict. Press **Copy summary** to paste the due time into a note or an email.

## Worked example

A request arrives at 4:00 PM on Friday 9 October 2026, Manila time. The partner works Monday to Friday, 9:00 AM to 6:00 PM, in Manila, and promised four business hours.

- Friday has 2 business hours left, from 4:00 PM to 6:00 PM.
- The weekend does not count.
- The remaining 2 hours run from 9:00 AM on Monday, so the response is due at **11:00 AM on Monday 12 October 2026**.

Add 12 October as a holiday and the due time moves to **11:00 AM on Tuesday 13 October**. Switch to calendar hours and the same four hours end at **8:00 PM on Friday 9 October**, because the clock never stops.

## How it works

For business hours the tool walks forward day by day. For each working day that is not a holiday it finds the exact start and end of the working day in the partner's time zone, spends whatever time remains inside that window, and carries the rest to the next working day. A request that arrives outside working hours starts at the next opening. Because each day's window is converted separately, a daylight-saving change in the partner's zone is handled correctly: a working window that spans a clock change is counted by the elapsed time it really has. If the working day ends before it starts, or no working day is selected, the tool says so instead of guessing.

## Mistakes to avoid

- **Counting from the wrong moment.** Some agreements start the clock when the request is sent and others when it is acknowledged. Use the time the agreement names.
- **Using your own zone for the partner's day.** If the working day is 9 to 6 in New York, enter New York, even if you sit in Manila.
- **Forgetting local holidays.** The tool knows the dates you give it. It does not know any country's public holidays.
- **Treating the due time as a promise.** It is a calculation from the terms you entered. If the agreement has pauses, such as time waiting for the requester, they are not modelled.
- **Mixing calendar and business hours.** "Within 24 hours" and "within one business day" are different things.

## Questions

::: faq
Q: Does it know the partner's agreement?
A: No. You enter the terms from the agreement, and the tool does the counting.
Q: What happens when daylight saving changes during the period?
A: Each working day is converted separately, so the correct number of elapsed hours is counted on the changeover day.
Q: What is the longest period it can count?
A: It searches up to about 4,000 days ahead. If no working time exists in that range, for example because every day is marked as a holiday, it tells you.
:::
