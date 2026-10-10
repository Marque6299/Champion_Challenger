---
path: /tools/text-formatter/
type: tool
tool: text-formatter
title: Text Formatter: change case, trim spaces, join lines
description: Paste text and change its case, trim extra spaces or join broken lines with one click, then copy it. Undo restores the last version.
h1: Text Formatter
lede: Fix shouty capitals, stray spaces and broken lines in pasted text, then copy it back into your system.
crumb: Text Formatter
related: /tools/guest-name/, /tools/call-scratchpad/, /glossary/
updated: 2026-10-05
---
## What it does

The formatter takes whatever you paste and applies one of six changes: UPPERCASE, lowercase, Title Case, Sentence case, trim spaces, and join lines. A counter shows words and characters, **Copy** puts the result on your clipboard, and **Undo** brings back the version before your last change. **Clear** empties the box, and Undo restores it, so a mis-click costs nothing.

## How to use it

1. Paste or type text into the input box.
2. Press the button for the change you want. The text in the box is replaced with the result.
3. If it is not what you wanted, press **Undo**.
4. Press **Copy** and paste the result where you need it.

## Worked example

A customer's name arrives from a form as "mARIA dE la-cruz". Title Case turns it into "Maria De La-Cruz": each word and each part after a hyphen starts with a capital letter and the rest is lower case. If the form fills a free-text field with "HELLO WORLD. HOW ARE YOU?" then Sentence case produces "Hello world. How are you?".

For text copied from a PDF that breaks every line, "Join lines" removes the line breaks and joins the pieces with single spaces: "a", a blank line, "b" and "c" on separate lines become "a b c". "Trim spaces" replaces runs of spaces and tabs with one space, removes spaces around line breaks and trims the ends, which cleans up text pasted from a table.

## What each button does

- **UPPERCASE** and **lowercase** change every letter.
- **Title Case** lower-cases everything, then capitalises the first letter of each word, including the letter after a hyphen, a slash or an opening bracket.
- **Sentence case** lower-cases everything, then capitalises the first letter of the text and of each sentence or line.
- **Trim spaces** collapses repeated spaces and tabs, tidies spaces around line breaks and trims the ends. It keeps line breaks.
- **Join lines** turns line breaks into single spaces.

Title Case and Sentence case work on letters in any alphabet, but they know nothing about names. They will not keep "McDonald" or "van der Berg" as written, because they cannot tell a name from any other word.

## Mistakes to avoid

- **Trusting Title Case for names.** Check names that have particles, prefixes or unusual capitals. The Guest Name Formatter handles reservation-style names.
- **Using Sentence case on codes.** Reference codes and acronyms become lower case. Do not run it on text that contains them.
- **Forgetting that Undo has one step.** It restores the version before the last change only.
- **Pasting sensitive text.** The formatter runs in your browser and stores nothing, but still avoid pasting card numbers or credentials.

## Questions

::: faq
Q: Does it keep what I paste?
A: No. Nothing is stored or sent anywhere. Refresh the page and the box is empty.
Q: Why did Sentence case lower-case an acronym?
A: It lower-cases everything first, then capitalises sentence starts. Restore the acronym by hand or press Undo.
Q: Can it handle a long document?
A: It will handle several pages without trouble, but it is built for the short text agents paste during a contact.
:::
