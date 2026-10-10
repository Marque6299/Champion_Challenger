---
path: /tools/commission-net-rate/
type: tool
tool: commission-net-rate
title: Commission and Net Rate Calculator for hotel partners
description: Convert gross to net and net to gross rates, markup to margin, and calculate commission and hotel payout for a whole stay, for agency and partner queries.
h1: Commission and Net Rate Calculator
lede: Five small calculators for the questions travel agencies and partners ask most: what is my commission, what is the net, and what is the difference between markup and margin.
crumb: Commission and Net Rate Calculator
related: /guides/b2b-hotel-and-agency-calls/, /tools/booking-price/, /tools/group-block/, /glossary/
updated: 2026-10-05
---
## What it does

B2B conversations about price go wrong when two people use the same word for different calculations. This page keeps each calculation separate and shows its answer in full. **Gross to net** takes a commissionable rate and a commission percentage and returns the commission and the net. **Net to gross** works the other way: it finds the gross rate that leaves a given net after commission. **Net rate to selling price** adds a markup to a cost. **Markup and margin** converts one into the other. **Full stay** takes a nightly room rate, nights, rooms, tax and commission and shows what the customer pays, what the agency keeps and what the hotel receives.

## How to use it

1. Optionally enter a currency, which is shown beside the amounts.
2. Find the card that matches your question and fill in its two or three fields. Each card updates as you type.
3. Read the answer under the card. Cards do not affect each other, so you can use several in one conversation.

## Worked example

**Gross to net.** A commissionable rate of 100 with 10 percent commission: commission 10.00, net 90.00.

**Net to gross.** The hotel must receive 90 and commission is 10 percent of the gross. The gross is 100.00, not 99.00. Adding 10 percent to 90 gives 99, which leaves the hotel with 89.10 after commission, so the two directions are not interchangeable.

**Markup and margin.** A net rate of 80 with a 25 percent markup sells at 100.00. The profit is 20.00, which is a 20 percent margin on the selling price. Convert 25 percent markup and you get 20 percent margin, and 20 percent margin gives 25 percent markup.

**Full stay.** A room at 120 for 3 nights, 2 rooms, with 10 percent tax and 10 percent commission. Room revenue is 720.00, taxes 72.00, so the customer pays 792.00. The agency commission is 72.00. The hotel receives 720.00, which is the room revenue less the commission, plus the taxes that pass through.

## The rules behind it

Commission is normally a percentage of the commissionable rate, and the base can be the room rate only or something wider. The tool assumes room revenue only and treats taxes as pass-through. That is the common arrangement but not the only one, so check the agreement. A **net rate** is the amount the hotel wants to receive, with commission already taken out, so the agency sets its own selling price. **Markup** is a percentage of cost; **margin** is a percentage of the selling price. A 25 percent markup is a 20 percent margin. With both as percentages, margin = 100 × markup ÷ (100 + markup), and markup = 100 × margin ÷ (100 − margin). A margin of 100 percent or more is impossible, and the tool says so.

## Mistakes to avoid

- **Adding commission on top of net.** To get a gross that leaves the net after commission, divide by one minus the commission rate. Multiplying by one plus the rate gives the wrong answer.
- **Mixing markup and margin.** Always say which one. "Twenty percent" means two different prices.
- **Commissioning taxes.** If the agreement pays commission on the rate excluding tax, do not apply it to the total.
- **Assuming a standard percentage.** The percentage comes from the rate plan or the agreement. The tool never supplies one.
- **Quoting commission before checking the booking.** Cancelled and changed bookings may pay no commission or a different one.

## Questions

::: faq
Q: Does the tool know my agency's commission?
A: No. It has no data about agreements. You enter the percentage from the rate plan or contract.
Q: What does "customer pays" include in the full stay?
A: The room revenue plus the taxes you entered. Fees are not part of this calculator.
Q: Why does the result show cents even for round numbers?
A: Amounts are held in cents so that the results match what a booking system would show.
:::
