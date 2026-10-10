---
path: /tools/lodging-case-notes/
type: tool
tool: lodging-case-notes
title: Lodging Case Note Builder for guest and B2B cases
description: Build structured case notes for twelve lodging case types, guest and B2B, with required fields, drafts saved on your device and a card-number check.
h1: Lodging Case Note Builder
lede: Pick the case type and get the fields a good note needs. Required fields are marked, the note builds as you type, and card numbers are masked before anything is copied.
crumb: Lodging Case Note Builder
related: /guides/case-notes-that-prevent-repeat-contacts/, /tools/call-scratchpad/, /tools/phrase-bank/, /glossary/
updated: 2026-10-05
---
## What it does

A note is useful when the next person can act on it without ringing the guest or the hotel again. This builder gives each kind of lodging contact its own set of fields, so you are prompted for the details that matter for that kind of case. Eight case types are for guests and four are for B2B work. You fill in the fields, a live preview shows the note as it will be pasted, a checklist tells you which required fields are still empty, and a safety check warns you if a field looks as though it holds a card number or a security code.

**Guest cases:** cancellation request; modification of dates, room or name; no-show or late arrival; refund inquiry; overbooking or relocation; property complaint; charge or fee dispute; special request.
**B2B cases:** property call for verification; travel agency query; supplier or property escalation; group request.

## How to use it

1. Choose the **case type**. The form rebuilds with its fields.
2. Fill in the fields. Every case has booking reference, property name, who you spoke with, the channel, the reason for contact, the actions you took and the outcome. Each type adds its own, such as the cancellation policy cited and the deadline status for a cancellation.
3. Watch the line above the preview. It lists the required fields you have not filled, or says that all are done.
4. Press **Copy note** and paste it into your case system, or **Download .txt**. The copied note starts with the case type and a time stamp.
5. Change case type any time. Each type keeps its own draft on this device. **Clear this form** empties the current type after you confirm.

## Worked example

A guest wants to cancel a booking after the free-cancellation deadline. You choose **Cancellation request**, enter the booking reference and property, note that you spoke with the guest by phone, and enter the stay dates. In **Cancellation policy cited** you write the policy and the deadline in the property's local time, and you select **After the deadline** as the status. In **Actions taken** you record that you offered to ask the property to review it. The preview includes lines such as these:

> LODGING CASE NOTE: Cancellation request
> Booking reference: LB-48213
> Property name: Sea View Hotel
> Cancellation policy cited: Free until 8 Nov, 11:59 PM EST (hotel time)
> Deadline status: After the deadline

The next agent can see what the policy said, what the status was and what you did, without calling anyone.

## How the safety check works

Every field is scanned for runs of 13 to 19 digits that pass the Luhn check used by real card numbers, for "CVV" or "security code" followed by digits, for national identity numbers in the common 3-2-4 pattern, and for passwords written after "password" or "PIN". A yellow warning names what it found, and copying or downloading replaces it with a placeholder such as "[card ending 1111 removed]". The "card, last four digits only" field exists so you can record which card without writing the number. The check is a safety net: it can miss a number split across words, and it does not replace your account's rules.

## Mistakes to avoid

- **Leaving the outcome blank.** If a case is open, say what happens next and who owns it.
- **Writing the deadline in your own time zone.** Cancellation deadlines belong to the property's local time. Use the [Cancellation Deadline Checker](/tools/cancellation-deadline/) if you need to work it out.
- **Recording opinions as facts.** Write what the guest or the hotel said and who said it.
- **Putting card numbers in notes.** Record the last four digits only.
- **Treating drafts as records.** Drafts live in this browser. Copy the note into the real system.

## Questions

::: faq
Q: Where are my drafts stored?
A: In your browser's local storage on this device, one draft per case type. They are never uploaded and can be cleared with the Clear button.
Q: Can I change the fields?
A: Not in this version. The fields are fixed so every note for a case type has the same shape.
Q: Does copying a note with a card number block me?
A: No. It copies a masked version and says so, so you can still finish the job. Remove the number from the field too.
:::
