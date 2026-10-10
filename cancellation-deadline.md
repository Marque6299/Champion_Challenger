---
path: /tools/cancellation-deadline/
type: tool
tool: cancellation-deadline
title: Cancellation Deadline Checker for hotel bookings
description: Find the free-cancellation cutoff in the hotel's own time zone, convert it to yours, see how long is left, and calculate the penalty if it has passed.
h1: Cancellation Deadline Checker
lede: Turn the wording of a cancellation policy into an exact moment in the hotel's time zone, and see at once whether a guest can still cancel for free.
crumb: Cancellation Deadline Checker
related: /guides/lodging-cancellation-policies/, /tools/booking-price/, /tools/callback-time-zones/, /glossary/
updated: 2026-10-05
---
## What it does

Most hotel bookings can be cancelled free of charge until a cutoff, and the cutoff is set in the hotel's local time, not yours and not the guest's. This tool takes the check-in date, the hotel's time zone and the wording of the policy, and works out the exact cutoff. It then compares the cutoff with the moment the guest wants to cancel, which can be right now or any time you choose, and tells you in words whether free cancellation is still available, how long is left or how long ago it ended. If you give it the rate and the penalty rule, it calculates the penalty too, and a button copies a summary you can read to the guest or paste into a note.

## How to use it

1. Enter the **check-in date** and choose the **hotel's time zone**.
2. Choose how the policy is worded. **Days before check-in, at a set time** fits wording such as "free cancellation until 11:59 PM two days before arrival". **Hours before the check-in time** fits "free cancellation until 48 hours before check-in", where you also enter the check-in time.
3. Choose when the guest is cancelling: **Now**, or **At a specific time** with the date, time and the zone you are entering it in.
4. Optionally pick the customer's time zone to see the cutoff on their clock, and choose a penalty rule, such as the first night or a percentage of the total, with the nightly rate and number of nights.
5. Read the verdict at the top. Press **Copy summary** to copy it.

## Worked example

A guest booked a hotel in New York with check-in on Tuesday 10 November 2026. The policy says free cancellation until 11:59 PM two days before arrival. Enter the date, choose US Eastern, "days before" with 2 days and a cutoff of 23:59.

The cutoff is **Sunday 8 November 2026, 11:59 PM EST**. On an agent's device in Manila that moment is **Monday 9 November, 12:59 PM**. A guest who calls at 2:00 PM Manila time on 9 November is therefore 1 hour and 1 minute past the deadline. Choose "first night" as the penalty, enter a nightly rate of 150 and 3 nights, and the tool reports a penalty of 150.00 USD.

Change the wording to "48 hours before check-in" with a 3:00 PM check-in. The cutoff becomes Sunday 8 November, 3:00 PM EST: the same date but a different time, which shows why the two wordings need different handling.

## How it works

The tool converts a wall-clock time in the hotel's zone into an exact instant, using the time-zone data built into your browser. "Days before" subtracts calendar days first, so it follows the calendar date whatever the clocks do, and then sets the time of day. "Hours before" subtracts real elapsed hours from the check-in instant. The two can differ across a daylight-saving change: 72 hours before 3:00 PM on Monday 2 November 2026 in New York is 4:00 PM on Friday 30 October, because the clocks went back on 1 November. The tool gets this right, and a calculation done on a fixed time difference does not.

Two odd cases are flagged. If the cutoff time falls in the hour that disappears when clocks go forward, the tool uses the nearest valid time and warns you. If it falls in the hour that happens twice when clocks go back, it uses the earlier one and warns you. In both cases confirm with the property.

## Mistakes to avoid

- **Using your own time zone.** A deadline of 11:59 PM is 11:59 PM at the hotel. Guests who read it as their own time can miss it by hours.
- **Confusing the two wordings.** "Two days before" and "48 hours before" are not the same time of day unless the cutoff time equals the check-in time.
- **Forgetting the deadline's own edge.** The tool treats the cutoff instant itself as still free. If the policy says "before" rather than "until", confirm how the hotel counts it.
- **Quoting a penalty without reading the rate rules.** Penalties vary: a night, several nights, a percentage or the full stay. Use the one on the booking.
- **Promising an exception.** If the deadline has passed, say that you can ask the property to review it, not that they will waive it.

## Questions

::: faq
Q: What if the booking shows the deadline in UTC or another zone?
A: Convert it with the Callback Time Zones tool, or choose that zone in the "Hotel's time zone" list if it is there, and use "hours" wording with the exact times shown on the booking.
Q: Does it handle bookings across several rate periods?
A: It works from a single check-in date and a single policy. For stays that mix policies, check each rate period against the booking text.
Q: Does it save the booking details?
A: No. Nothing is stored or sent. Refreshing the page clears everything.
:::
