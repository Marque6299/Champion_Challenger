/* phrases.js - the seven original categories, unchanged, plus five for Global Travel lodging and B2B work.
   Replace anything in [brackets] and follow your account's approved scripts and compliance wording. */
export const PHRASES = {
  'Opening': [
    'Thank you for contacting [Company]. My name is [Name]. How can I help you today?',
    "Good [morning/afternoon/evening], you're through to [Name]. What can I do for you?",
    'Thanks for reaching out. May I have your full name, please?',
    "I'd be glad to look into that. Could you tell me a little more about what's happening?",
    "Thanks for your patience while we get started. Let's see what we can sort out."
  ],
  'Empathy': [
    "I understand how frustrating that must be, and I'm sorry for the trouble.",
    "That's not the experience we want you to have. Let me see what I can do.",
    'Thank you for letting me know. I can see why that was a worry.',
    "I appreciate you explaining that. Let's work through it together.",
    "I'm sorry this has taken up your time. I'll do my best to get it sorted out now."
  ],
  'Hold and waiting': [
    'May I place you on a brief hold while I check that? It should take about [X] minutes.',
    'Thank you for holding. I appreciate your patience.',
    "I'm still working on this. May I have another minute, or would you prefer a callback?",
    "I'm going to review the account notes, so there may be a short pause on my end.",
    'Sorry to keep you waiting. I have an update for you.'
  ],
  'Verification': [
    'For your security, I need to verify a few details before we go further.',
    'Could you please confirm the name and email address on the account?',
    "Thank you, that matches. I've verified your account.",
    "I'm not able to share account details until verification is complete. Thank you for understanding.",
    'To keep your account safe, I will never ask for your full password.'
  ],
  'Transfer and escalation': [
    "I'm going to transfer you to [team], who can help with this. I'll pass along the details so you don't have to repeat them.",
    "This needs a review by a specialist team. I'll escalate it now and note everything we've covered.",
    'Your reference number is [number]. Please keep it in case you need to follow up.',
    'The team will contact you by [channel] within [timeframe].',
    'Before I transfer you, is there anything else I can help with?'
  ],
  'Closing': [
    'Is there anything else I can help you with today?',
    "To recap, I've [action], and the next step is [next step].",
    'Thank you for your patience today. Take care.',
    'You may receive a short survey about this conversation. Your feedback helps us improve.',
    'Thanks for contacting [Company]. Have a great day.'
  ],
  'De-escalation': [
    'I can hear this is really important to you, and I want to get it right.',
    "Let me make sure I've understood: [summary]. Is that correct?",
    "Here's what I can do right now: [option]. Would that work for you?",
    "I can't change that policy, but here's what I can offer instead: [option].",
    "I'd like to help. Could we take this one step at a time?"
  ],
  'Lodging: booking details': [
    "Let me confirm the stay: check-in [date], check-out [date], [number] nights, [number] guests. Is that correct?",
    'The name on the reservation is [name]. The guest should bring photo ID that matches it.',
    "The room type booked is [room type]. A bed type is a request, and the property confirms it at check-in unless they have confirmed it to us.",
    "Check-in starts at [time] and check-out is by [time]. Those times are in the hotel's local time.",
    "Some charges are paid at the property, such as [resort fee or city tax]. I'll note the amounts I can see so there are no surprises."
  ],
  'Lodging: cancellations and refunds': [
    "This booking can be cancelled free of charge until [date and time] in the hotel's local time, which is [date and time] where you are.",
    "That deadline has passed, so the cancellation policy applies: [penalty]. I can ask the property to review it, but I can't promise the outcome.",
    'This is a non-refundable rate. I can ask whether the property will make an exception and come back to you by [channel] within [timeframe].',
    'Refunds go back to the original payment method and can take [number] business days to appear, depending on your bank.',
    "I've submitted the cancellation. Your cancellation reference is [reference]. Please keep it with your records."
  ],
  'Lodging: property issues': [
    "I'm sorry the room was not as described. Could you tell me what you found, and whether you have raised it with the front desk?",
    'If the property cannot honor the booking, I will look for a comparable room nearby. Let me confirm the options with the property first.',
    'Photos or a short description of the issue will help when I speak to the property. You can send them by [channel].',
    "I'll contact the property now while you are on the line, and I'll tell you what they say.",
    "I've logged your complaint under reference [reference]. The property has been asked to respond within [timeframe]."
  ],
  'B2B: calling a property': [
    "Hello, this is [Name] calling from [Company] on behalf of a guest. I'd like to verify a reservation. Do you have a minute?",
    'The reservation is under [guest name], arriving [date] for [number] nights. Could you read me the confirmation number you have for it?',
    'Could you confirm the room type, the rate, and whether breakfast or other inclusions are part of the booking?',
    'May I have your name and the time of this call, so I can record who confirmed it?',
    "Thank you. To recap, you have confirmed [details]. I'll email you the same information for your records."
  ],
  'B2B: agencies and partners': [
    "Thanks for your email. I've reviewed booking [reference] and I'd like to confirm the commission terms that apply to this rate plan.",
    'This is a net rate, so commission is already excluded. The selling price is yours to set.',
    'Under the terms on file, commission is calculated on [basis] and paid [timing].',
    "I've escalated your query to [team] under reference [reference]. You'll have a response by [date and time] in [time zone].",
    'Could you send the booking reference, the guest name and the amount in question so I can investigate?'
  ]
};
export const ORIGINAL_CATEGORIES = ['Opening', 'Empathy', 'Hold and waiting', 'Verification', 'Transfer and escalation', 'Closing', 'De-escalation'];
