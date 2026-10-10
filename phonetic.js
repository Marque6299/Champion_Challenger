/* phonetic.js - NATO alphabet and telephony digits, as in the original tool. */
export const NATO = [
  ['A', 'Alpha'], ['B', 'Bravo'], ['C', 'Charlie'], ['D', 'Delta'], ['E', 'Echo'], ['F', 'Foxtrot'], ['G', 'Golf'], ['H', 'Hotel'],
  ['I', 'India'], ['J', 'Juliett'], ['K', 'Kilo'], ['L', 'Lima'], ['M', 'Mike'], ['N', 'November'], ['O', 'Oscar'], ['P', 'Papa'],
  ['Q', 'Quebec'], ['R', 'Romeo'], ['S', 'Sierra'], ['T', 'Tango'], ['U', 'Uniform'], ['V', 'Victor'], ['W', 'Whiskey'], ['X', 'X-ray'],
  ['Y', 'Yankee'], ['Z', 'Zulu']
];
const letters = Object.fromEntries(NATO);
const digits = { 0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Niner' };
const symbols = { '@': 'At', '.': 'Dot', '-': 'Dash', _: 'Underscore', '#': 'Hash', '/': 'Slash', '+': 'Plus', '&': 'Ampersand', ',': 'Comma', ':': 'Colon' };
export const spellWord = ch => letters[ch.toUpperCase()] || digits[ch] || symbols[ch] || '';
export function spellingText(value) {
  return Array.from(value).map(ch => (ch === ' ' ? '(space)' : ch + ' - ' + (spellWord(ch) || ch))).join(', ');
}
