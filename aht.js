/* aht.js - handle-time maths and the stopwatch state labels, as in the original tools. */
import { mmss } from './text.js';
export const DEFAULT_TARGET = 490;
export const parseTarget = v => { const n = parseInt(v, 10); return n > 0 ? n : DEFAULT_TARGET; };

export function compareText(secs, target) {
  const d = Math.round(secs - target);
  if (d === 0) return 'Exactly on the target of ' + target + ' seconds.';
  return d < 0 ? (-d) + ' seconds under the target of ' + target + ' seconds.' : d + ' seconds over the target of ' + target + ' seconds.';
}
export const handleSeconds = (talk, hold, acw) => Math.max(0, talk || 0) + Math.max(0, hold || 0) + Math.max(0, acw || 0);
export const shiftAverage = (hours, minutes, calls) => {
  const secs = Math.max(0, hours || 0) * 3600 + Math.max(0, minutes || 0) * 60;
  return secs > 0 && calls > 0 ? secs / calls : 0;
};
export { mmss };

/** Stopwatch state, matching the original labels. tone is for styling only; the label carries the meaning. */
export function timerState(totalSec, target, running) {
  const total = Math.floor(totalSec);
  let label, tone;
  if (total > target) { label = 'Over target'; tone = 'bad'; }
  else if (running) { const near = total >= target * 0.75; label = near ? 'Approaching target' : 'On pace'; tone = near ? 'warn' : 'ok'; }
  else { label = total > 0 ? 'Paused' : 'Ready'; tone = 'idle'; }
  return { label, tone };
}
