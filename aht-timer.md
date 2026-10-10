---
path: /tools/aht-timer/
type: tool
tool: aht-timer
title: AHT Timer: a call stopwatch with a handle-time target
description: A free call timer that compares elapsed time with your handle-time target and labels it Ready, On pace, Approaching target or Over target.
h1: AHT Timer
lede: A stopwatch for one call that tells you in words, not just colour, whether you are on pace against your handle-time target.
crumb: AHT Timer
related: /guides/aht-explained/, /tools/aht-calculator/, /glossary/
updated: 2026-10-05
---
## What it does

The timer counts hours, minutes and seconds from the moment you press Start. A status line underneath tells you where you are against your target: **Ready**, **On pace**, **Approaching target**, **Over target** or **Paused**. The number is also tinted green, amber or red, but the words carry the meaning, so the timer is readable without colour. The default target is 490 seconds, which is 8 minutes 10 seconds. Change it and the new value is remembered on this device and shared with the AHT Calculator.

## How to use it

1. Set your target in seconds. Use the figure your team uses for the queue you are on.
2. Press **Start** when the call connects.
3. Press **Pause** while you do something you want to leave out, and **Start** again to resume. Elapsed time is kept while paused.
4. Press **Reset** to return to zero for the next call.

## Worked example

With the default target of 490 seconds:

- From 0:00 the status reads **On pace**.
- At 368 seconds (6 minutes 8 seconds) it changes to **Approaching target**, because that is 75 percent of the target.
- At 491 seconds (8 minutes 11 seconds) it changes to **Over target**.

If you set the target to 100 seconds, start the timer and pause at 51 seconds, the status stays **On pace** while it runs and shows **Paused** once you stop. A timer that has never been started shows **Ready**.

## How it works

The timer does not count ticks. It records the clock time when you press Start and calculates elapsed time from the difference each time it refreshes, four times a second. That means it stays accurate if your browser slows the page while another tab is in front, which counting ticks would not. The status changes only when its wording changes, so a screen reader announces "Approaching target" once instead of repeating it every second.

Handle time normally includes talk time, hold time and after-call work, so a stopwatch that you stop when the caller hangs up will under-count unless you keep it running through wrap-up. Check how your team defines the measure before you compare your result with a report. The [handle-time guide](/guides/aht-explained/) explains what is usually included.

## Mistakes to avoid

- **Stopping at hang-up.** If your target includes after-call work, keep the timer running until you finish it.
- **Racing the clock.** A timer is a prompt, not a goal. Ending a call early to hit a number tends to cause repeat contacts, which cost more handle time than they save.
- **Using one target for every call type.** A simple billing question and a complex escalation are not the same job. Use the target that applies to the queue, and treat the colour as a nudge.
- **Forgetting to reset.** The timer keeps its elapsed time until you press Reset.

## Questions

::: faq
Q: Does the timer keep running if I switch tabs?
A: Yes. It works from the clock, so the time is correct when you come back. Closing the page stops it, and the time is not saved.
Q: Is my target saved?
A: Yes, on this device only. The AHT Calculator reads the same saved value.
Q: Can it log my calls?
A: No. It is a stopwatch for the call in front of you. It keeps no history, which also means it holds no customer information.
:::
