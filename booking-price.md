---
path: /tools/booking-price/
type: tool
tool: booking-price
title: Booking Price and Change Calculator for hotel stays
description: Break a hotel stay into rooms, fees and taxes in exact cents, compare it with the original booking, and see refund, balance due and currency conversion.
h1: Booking Price and Change Calculator
lede: Break a stay into room, fees and taxes, then see what changes when the guest modifies, pays or cancels.
crumb: Booking Price and Change Calculator
related: /tools/cancellation-deadline/, /tools/commission-net-rate/, /guides/lodging-cancellation-policies/, /glossary/
updated: 2026-10-05
---
## What it does

Guests rarely ask about a single number. They ask why the total is what it is, what the difference is after a change, how much they get back if they cancel and what they will pay at the property. The calculator takes the nightly rate or rates, an optional discount, fees, taxes and local taxes, and shows the room subtotal, the discount, the fees, the tax, the total and the average per night. Add what the guest has already paid to see the balance, add a penalty to see the refund after cancelling, add the original total to see what a change costs, and add an exchange rate to see the total in the guest's currency.

## How to use it

1. Enter the currency code, such as USD or EUR. The tool uses it for labels and for currencies without decimals, such as JPY.
2. Enter the stay dates if you want the night count worked out, and press **Use these nights on line 1**. Or enter nights yourself.
3. Enter the rate per night and the nights. Use **Add a rate line** when the rate changes, for example for weekday and weekend rates.
4. Enter any discount as a percentage or an amount, fees per night or per stay, the tax percentage, and local tax per person per night with the number of persons.
5. Tick **The sales tax also applies to fees** only if the booking applies tax to the fees.
6. Add what has been paid, the cancellation penalty, the original booking total and the exchange rate as needed, then press **Copy summary**.

## Worked example

A guest stays 5 nights: 3 nights at 150 and 2 nights at 200, with a 10 percent discount, a 25 per night resort fee, a 40 cleaning fee, 12 percent tax on the room, and a local tax of 2 per person per night for 2 people.

- Room subtotal: 850.00. Discount: 85.00. Room after discount: 765.00.
- Fees: 25 × 5 nights + 40 = 165.00.
- Tax: 12 percent of 765.00 = 91.80.
- Local taxes: 2 × 2 persons × 5 nights = 20.00.
- **Total: 1,041.80 USD.** Average per night: 208.36 USD.

If the guest has already paid 1,000.00 the balance still due is 41.80. If the original booking total was 1,000.00, the new booking is 41.80 more than the original. At an exchange rate of 56.25 the total in Philippine pesos is 58,601.25.

## How it works

Money is held as whole cents. Each percentage is calculated on the cents amount and rounded half up, so the lines always add to the total exactly. A calculation in decimal numbers can show a total one cent away from the booking, which causes arguments over nothing. The tax is applied to the room amount after the discount, and to fees only when you tick the box. Local taxes, such as a per-person city tax, are fixed amounts and are added after. Currencies without decimals, such as the yen, are rounded to whole units when converted.

## Mistakes to avoid

- **Applying the tax to the wrong base.** Some places tax fees and some do not. Use the booking's own tax line to check which.
- **Treating the discount as a fee.** The discount reduces the room amount before tax in this tool. If the booking taxes the undiscounted rate, enter the difference by hand.
- **Using a rate you made up.** The exchange rate field is manual on purpose, because the site makes no live network calls. Use the rate your account approves.
- **Forgetting persons for the local tax.** If the booking charges the tax per person, set the persons field.
- **Reading the refund as a promise.** It shows what the policy implies. The property or supplier makes the final decision.

## Questions

::: faq
Q: Why does the tool not fetch live exchange rates?
A: So that nothing you enter leaves your device and the tool works offline. Type the rate your account uses.
Q: Can I split a stay across more than two rates?
A: Yes. Add up to six rate lines.
Q: Why do my figures differ from the booking by a cent?
A: Properties round at different points, for example tax per night instead of on the total. Compare the tax line and the rounding rule on the booking.
:::
