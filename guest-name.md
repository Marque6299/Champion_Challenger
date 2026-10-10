---
path: /tools/guest-name/
type: tool
tool: guest-name
title: Guest Name Formatter: SURNAME/GIVEN for reservations
description: Format guest names as SURNAME/GIVEN, remove titles and accents, and flag single names, long names and non-Latin names before you send them to a hotel.
h1: Guest Name Formatter
lede: Tidy a list of guest names into the format a reservation system expects, and get a flag on every line that needs a human check.
crumb: Guest Name Formatter
related: /tools/nato-phonetic/, /tools/text-formatter/, /tools/group-block/, /glossary/
updated: 2026-10-05
---
## What it does

Booking systems store names in a fixed shape, often surname first with a slash before the given names. Hotels match the name on the booking to the guest's identity document at check-in, so a swapped order, a stray title or a missing accent can cause delays at the desk. The formatter takes one name per line in almost any layout, such as "First Last", "Last, First" or "LAST/FIRST", and rewrites each in the layout you choose. It can remove titles and suffixes, strip accents, change case and keep or drop hyphens and apostrophes. A third column flags names it could not format with confidence.

## How to use it

1. Paste or type the names, one per line.
2. Choose the **output layout**: SURNAME/GIVEN, GIVEN SURNAME or SURNAME, GIVEN.
3. Tick or clear the options for capitals, accents, titles, Jr and Sr, hyphens and apostrophes.
4. Read the table. Fix anything flagged in the third column, then press **Copy formatted names**.

## Worked example

Enter these three lines:

- `Mr. John A. Smith`
- `García, José`
- `Madonna`

The result in SURNAME/GIVEN layout:

| You entered | Formatted | Check |
|---|---|---|
| Mr. John A. Smith | SMITH/JOHN A | OK |
| García, José | GARCIA/JOSE | OK |
| Madonna | MADONNA | Only one name was found, so there is no given name. Check the booking. |

Other examples: "Maria de la Cruz" becomes DE LA CRUZ/MARIA, because "de" and "la" are treated as part of the surname. "Seán O'Brien Jr" becomes O'BRIEN/SEAN: the suffix goes, the accent goes and the apostrophe stays. Turn off "Keep apostrophes" and it becomes OBRIEN/SEAN.

## How it works

For "First Last" input the tool treats the last word as the surname and moves it back across common surname particles such as de, van, von, bin and al. For "Last, First" and "LAST/FIRST" it trusts the order you gave. Accent removal uses Unicode decomposition plus a short list of letters that do not decompose, such as ß, ø and ł. The tool flags: a single name; four or more words, because the surname boundary is uncertain; digits; characters outside the Latin alphabet, such as Chinese, Arabic or Cyrillic; and names over 50 characters, which some systems cut. It cannot know a person's real naming convention. Many cultures put the family name first, use patronymics or have no surname.

## Mistakes to avoid

- **Trusting the output without the ID.** The name must match the document the guest will show. Ask for the spelling and compare.
- **Removing accents when the system supports them.** Some systems keep accents. Only strip them if yours does not.
- **Dropping a hyphen or apostrophe the document has.** Match the document.
- **Reordering names that are already correct.** If the input is "Last, First" the tool keeps your order, but check the layout when names are mixed.
- **Pasting a whole guest list with other data.** The tool is for names only.

## Questions

::: faq
Q: Why was my name flagged for non-Latin characters?
A: Many booking systems accept only Latin letters, so the tool asks you to use the romanised spelling that appears on the guest's passport.
Q: Does it keep the names?
A: No. Names stay in your browser and are not stored or sent anywhere.
Q: How many names can I paste?
A: Up to 500 lines at a time.
:::
