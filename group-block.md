---
path: /tools/group-block/
type: tool
tool: group-block
title: Group Block and Rooming List Checker for hotel groups
description: Size a hotel room block with comp rooms and attrition, then check a pasted or uploaded rooming list (CSV or Excel paste) for errors, in your browser.
h1: Group Block and Rooming List
lede: Size a block of rooms and check the rooming list against it in your browser. The list is never uploaded.
crumb: Group Block and Rooming List
related: /guides/b2b-hotel-and-agency-calls/, /tools/commission-net-rate/, /tools/guest-name/, /glossary/
updated: 2026-10-05
---
## What it does

A group booking has two halves: the block, which is the rooms held for the group, and the rooming list, which says who sleeps in them. The first half of this page sizes the block: rooms by type, nights, rates, the complimentary-room ratio, the attrition allowance and the cutoff date. The second half checks a rooming list against that block. It reads the list from a pasted table or a file, finds the columns by their headings, and reports errors, warnings and rooms that are over-allocated. It can then export a cleaned file and a list of problems.

## How to use it

1. Enter the **arrival date** and **nights**. Add each room type with the rooms per night and the rate per night.
2. Enter the comp ratio, the attrition percentage and the days before arrival that the cutoff falls. Leave blank any term the contract does not have.
3. Read the summary: room nights, estimated revenue, average rate, comp rooms and the minimum paid rooms after attrition.
4. For the rooming list, paste rows copied from Excel, paste CSV text, or choose a `.csv`, `.tsv` or `.txt` file. The first row must be headings: guest name, room type, arrival (or check-in) and departure (or check-out). Email and notes are optional.
5. If dates such as 03/11/2026 are in day-first order, change the date setting. Read the results, then download the cleaned CSV or the problems CSV.

## Worked example

A block of 40 Standard rooms at 150 and 10 Suites at 300 for 3 nights from 10 November 2026, with one comp per 25 paid rooms, 10 percent attrition and a cutoff 30 days before arrival:

- Paid rooms per night: 50. Room nights: 150. Estimated room revenue: 27,000.00. Average rate: 180.00.
- Comp rooms: 2 per night, worth 1,080.00 over three nights.
- Minimum paid rooms after attrition: 45, so 5 can be released. Revenue at that minimum: 24,300.00.
- Cutoff date: 11 October 2026.

Now paste a rooming list with four rows: one valid Standard booking, one for a room type that is not in the block, one with no guest name and one duplicate of the first. The summary reads 4 rows, 2 ready, 2 with errors, and the table says exactly what is wrong on each row.

## How it works

The block maths uses whole cents. Complimentary rooms are the number of paid rooms divided by the ratio, rounded down. The attrition minimum is the paid rooms times one minus the allowance, rounded up. The rooming list is parsed in your browser with a reader that handles quoted fields, commas inside quotes, line breaks inside a cell, a byte-order mark and comma, tab or semicolon separators. Each row is checked for a name, a known room type, valid dates in the order you choose, a departure after the arrival, dates outside the block, duplicates and the number of guests per night against the rooms in the block. Exported cells that start with =, +, - or @ get a leading apostrophe so a spreadsheet does not run them as formulas.

## Mistakes to avoid

- **Guessing the date order.** 03/11/2026 means two different days. Set the date format before you trust the results.
- **Ignoring warnings.** A guest who arrives before the block starts may pay a different rate.
- **Treating comp and attrition as universal.** Both come from the contract. The tool only does the arithmetic.
- **Uploading Excel workbooks.** The reader takes text files. Save the sheet as CSV, or copy the cells and paste.
- **Sharing exported files carelessly.** They contain guest names. Treat them as personal data.

## Questions

::: faq
Q: Is my rooming list uploaded?
A: No. The file is read by your browser and processed on your device. Nothing is sent to a server.
Q: What is the largest file it accepts?
A: 2 MB. The table shows the first 200 rows, and the downloads include every row.
Q: Why does it say columns not found?
A: The first row must have headings it recognises. Rename them to guest name, room type, arrival and departure, or check-in and check-out.
:::
