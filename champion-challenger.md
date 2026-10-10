---
path: /reports/champion-challenger/
type: report
report: champion-challenger
title: Champion Challenger report: how to read the comparison
description: An interactive Power BI report that compares a current approach with an alternative, plus a guide to reading champion-challenger results without fooling yourself.
h1: Champion Challenger report
lede: A side-by-side comparison of a current approach and an alternative, with a guide to reading the gap fairly.
crumb: Champion Challenger
related: /reports/productivity/, /reports/get-agent-performance/, /glossary/
updated: 2026-10-05
---
## What a champion-challenger comparison is

In a champion-challenger comparison the **champion** is the approach you use now and the **challenger** is the alternative you want to test against it. The idea is simple: run both under the same conditions, measure them on the same things over the same period, and let the numbers show whether the challenger deserves to replace the champion. The method is common wherever a process can be run two ways at once, including contact-centre scripts, routing rules, coaching approaches and branch or team practices. The report above puts the two sides next to each other so the gap is easy to see. The title and filters inside the report say which groups and which measures are being compared, so read them first.

## How to read the report

1. **Fix the period before you look at results.** Choose the dates with the slicers and keep them the same for both sides. A comparison of a week against a month means nothing.
2. **Read the measures in pairs.** A result on one measure can hide a cost on another. A faster handle time is not a win if repeat contacts rise with it.
3. **Compare rates, not totals.** The two sides may be different sizes. Percentages and averages compare fairly. Counts do not.
4. **Look at the trend, not one point.** A single good day proves little. A gap that stays in the same direction over weeks carries weight.
5. **Hover over a bar or a point.** Power BI tooltips usually show the exact value and the number of contacts behind it.
6. **Click a bar to cross-highlight.** Selecting one group or period filters the other visuals, so you can see which part of the picture the difference comes from.

## Questions to ask before you act on a gap

| Question | Why it matters |
|----------|----------------|
| How many contacts are behind each number? | Small samples swing widely. A big gap on a small base can vanish next week. |
| Were the two sides comparable at the start? | If the challenger got the easier work or the more experienced people, the gap may not come from the approach. |
| Did anything else change during the period? | Seasonality, a system outage or a policy change can move both sides, or only one. |
| What difference would be worth acting on? | Decide this before you look. A gap smaller than that is not a decision. |
| What does the challenger cost? | Training time, tooling and complexity belong in the comparison too. |

## Common ways to misread it

- **Declaring a winner too early.** Early results are noisy, and the side that starts ahead often drifts back towards the average.
- **Choosing the period afterwards.** If you pick the dates that make the story, you have not run a test.
- **Changing two things at once.** If the challenger differs from the champion in several ways, you will not know which one made the difference.
- **Forgetting the human side.** Agents who know they are in the challenger group may behave differently. That can be real or it can be temporary.
- **Treating "no difference" as a failure.** A challenger that matches the champion at lower cost, or with happier agents, may still be the better choice.

## Using the interactive report

The report loads only when you press the button, which keeps this page fast. For a larger view use **Open full screen**, or open it in the [workspace](/portal/), where it fills the window. If your network blocks the embedded view, use **Open in a new tab**. The data shown is whatever the report's owner last refreshed, so check the date in the report before you quote a figure.

## Questions

::: faq
Q: Which groups does this report compare?
A: That is set inside the report itself, so read its title and legend. This page explains how to read a champion-challenger comparison in general.
Q: Can I download the data?
A: Whether export is allowed is controlled by the report's owner in Power BI. If a visual has no export option, it is turned off.
Q: Why does the report look different on my phone?
A: Power BI reflows visuals to the space available. For the full layout, rotate the phone or open the report in a new tab.
:::
