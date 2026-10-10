---
path: /tools/call-scratchpad/
type: tool
tool: call-scratchpad
title: Call Scratchpad: notes with templates and a card-number check
description: A free notepad for calls with note templates, word counts, copy and download, and a check that flags card numbers. Notes stay in your browser.
h1: Call Scratchpad
lede: A notepad for the call in front of you, with templates for the three note types agents write most and a warning if a note looks as though it holds a card number.
crumb: Call Scratchpad
related: /guides/case-notes-that-prevent-repeat-contacts/, /tools/lodging-case-notes/, /glossary/
updated: 2026-10-05
---
## What it does

The scratchpad is a single text area that saves as you type. Three template buttons drop a ready-made structure into the notes, an "Insert time" button adds a time stamp at the cursor, and a counter shows words and characters. You can copy the notes, download them as a text file, or clear them. Everything is stored in your browser, on your device, and nothing is sent to a server.

## How to use it

1. Click in the notes area and start typing, or press a template button to begin with a structure.
2. Use **Standard template** for ordinary contacts. It gives you six headings: reason for contact, verified by, issue details, actions taken, resolution and follow-up needed.
3. Use **Callback template** when you promise to ring someone back. It asks for the callback time, the best number or channel, the customer's time zone, the topic and a note for the next agent.
4. Use **Escalation template** when you pass a case on. It asks who it goes to, why, what you already tried, what the customer expects and the reference number.
5. Press **Copy notes** to paste the text into your case system. **Download .txt** saves a file named with today's date.

## Worked example

You pick the Standard template and fill it in during a billing call:

- Reason for contact: duplicate charge on the 3rd and the 5th.
- Verified by: name, email on file, last four digits of the payment method.
- Actions taken: submitted a refund request for the second charge.
- Follow-up needed: customer to contact us if the refund is not visible by the 14th.

The counter reads the number of words and characters as you go. If you mistakenly type a full card number into the notes, a yellow warning appears under the text area and names what it found. Press **Mask sensitive text** and the number is replaced with the words "card ending" and the last four digits.

## How the card check works

The check looks for runs of 13 to 19 digits, with or without spaces or dashes, and then applies the Luhn check that real card numbers satisfy. That second step stops ordinary long numbers, such as booking references, from being flagged. The tool also looks for words such as "CVV" or "security code" followed by digits, for national identity numbers written in the common 3-2-4 pattern, and for passwords written after the word "password" or "PIN". Copying or downloading masks anything it finds automatically.

This is a safety net, not a guarantee. It can miss a number written with extra words in the middle, and it can flag a harmless number that happens to pass the check. It does not replace your account's rules on what may be written in notes.

## Mistakes to avoid

- **Treating it as a record system.** Notes live in your browser. Another browser, a private window or a cleared cache will not have them, so copy anything important into the real case system before the call ends.
- **Using a shared computer.** Anyone who uses the same browser profile can open the page and see the notes. Clear them when you finish.
- **Typing sensitive data "just for now".** Delete it rather than relying on the mask. Masking changes the text in the notes, but the safest note never contained the number.
- **Writing notes no one else can use.** A template only helps if the headings are filled in. See the guide on [notes that prevent repeat contacts](/guides/case-notes-that-prevent-repeat-contacts/).

## Questions

::: faq
Q: Where are my notes stored?
A: In your browser's local storage on this device, under one key. They are never uploaded. Clearing site data in your browser, or pressing Clear notes, removes them.
Q: Why does it say my browser is blocking storage?
A: Some privacy settings and private windows block local storage. The scratchpad still works, but the notes disappear when you close the tab. Copy them out first.
Q: Can I add my own template?
A: Not yet. The three templates are fixed. The Lodging Case Note Builder offers structured notes for twelve travel and lodging case types.
:::
