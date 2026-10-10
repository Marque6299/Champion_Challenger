/* tokens.mjs - the design tokens, defined once. build.mjs turns this into dist/assets/css/tokens.css,
   and scripts/contrast-check.mjs reads the same object, so the CSS and the contrast checks cannot drift apart. */

export const primitives = {
  '--navy-950': '#0A1A2E', '--navy-900': '#0B2A4A', '--navy-800': '#153F6A', '--navy-700': '#112640', '--navy-600': '#163252',
  '--blue-700': '#00518F', '--blue-600': '#0067B8', '--blue-400': '#5BA8F0',
  '--space-1': '4px', '--space-2': '8px', '--space-3': '12px', '--space-4': '16px', '--space-5': '24px', '--space-6': '32px', '--space-7': '48px',
  '--radius-sm': '4px', '--radius-md': '8px', '--radius-lg': '12px',
  '--font-head': '"Bricolage Grotesque", "Segoe UI", system-ui, Arial, sans-serif',
  '--font-body': '"Source Sans 3", "Segoe UI", system-ui, Arial, sans-serif',
  '--step--1': '.875rem', '--step-0': '1rem', '--step-1': '1.25rem', '--step-2': '1.563rem', '--step-3': '1.953rem', '--step-4': '2.441rem',
  '--motion-fast': '150ms', '--motion-base': '220ms'
};

/** Semantic tokens, light theme (the "Ledger" direction from the plan). */
export const light = {
  '--color-bg': '#F5F7FA', '--color-surface': '#FFFFFF', '--color-surface-2': '#EAF3FB', '--color-field': '#FFFFFF',
  '--color-text': '#1C2733', '--color-text-secondary': '#33475C', '--color-text-muted': '#53647A',
  '--color-link': '#0067B8', '--color-action': '#0067B8', '--color-action-hover': '#00518F', '--color-on-action': '#FFFFFF', '--color-action-edge': '#0067B8',
  '--color-line': '#D9E0E8', '--color-line-strong': '#6B7C93',
  '--color-nav-bg': '#0B2A4A', '--color-nav-text': '#E6F0FA', '--color-nav-label': '#9FB8D2', '--color-nav-hover': '#153F6A', '--color-nav-active-bg': '#FFFFFF', '--color-nav-active-text': '#0B2A4A',
  '--color-focus': '#0B2A4A', '--color-focus-on-dark': '#F2B84B',
  '--color-danger': '#B42318', '--color-danger-fill': '#B42318', '--color-on-danger': '#FFFFFF', '--color-danger-bg': '#FDECEA',
  '--color-success': '#067647', '--color-success-bg': '#E7F6EE',
  '--color-warning-text': '#8A5300', '--color-warning-bg': '#FFF4D6',
  '--glass-bg': 'rgba(255,255,255,.80)', '--glass-border': 'rgba(11,42,74,.14)', '--glass-blur': '14px',
  '--page-bg': 'var(--color-bg)', '--shadow': '0 8px 30px rgba(11,42,74,.10)'
};

/** Semantic tokens, dark theme: a second value set, not inverted colours. */
export const dark = {
  '--color-bg': '#0A1A2E', '--color-surface': '#112640', '--color-surface-2': '#163252', '--color-field': '#0A1A2E',
  '--color-text': '#E8EEF5', '--color-text-secondary': '#C5D3E3', '--color-text-muted': '#A9B9CC',
  '--color-link': '#5BA8F0', '--color-action': '#0067B8', '--color-action-hover': '#00518F', '--color-on-action': '#FFFFFF', '--color-action-edge': '#5BA8F0',
  '--color-line': '#2A4366', '--color-line-strong': '#7D93B0',
  '--color-nav-bg': '#07121F', '--color-nav-text': '#E6F0FA', '--color-nav-label': '#9FB8D2', '--color-nav-hover': '#153F6A', '--color-nav-active-bg': '#E8EEF5', '--color-nav-active-text': '#0B2A4A',
  '--color-focus': '#F2B84B', '--color-focus-on-dark': '#F2B84B',
  '--color-danger': '#FF9A8F', '--color-danger-fill': '#B42318', '--color-on-danger': '#FFFFFF', '--color-danger-bg': '#3A1713',
  '--color-success': '#5FD0A0', '--color-success-bg': '#0F2E24',
  '--color-warning-text': '#F2B84B', '--color-warning-bg': '#3A2D0F',
  '--glass-bg': 'rgba(17,38,64,.74)', '--glass-border': 'rgba(255,255,255,.14)', '--glass-blur': '14px',
  '--page-bg': 'radial-gradient(1100px 560px at 12% -8%, #163252 0%, rgba(22,50,82,0) 62%), linear-gradient(165deg, #0A1A2E 0%, #0B2A4A 100%)', '--shadow': '0 10px 40px rgba(0,0,0,.35)'
};

/** Every text and control pair that must hold, per theme. [foreground, background, minimum ratio, label] */
export const pairs = [
  ['--color-text', '--color-bg', 4.5, 'body text on page'], ['--color-text', '--color-surface', 4.5, 'body text on surface'], ['--color-text', '--color-surface-2', 4.5, 'body text on tint'],
  ['--color-text-secondary', '--color-surface', 4.5, 'secondary text'], ['--color-text-muted', '--color-bg', 4.5, 'muted text on page'], ['--color-text-muted', '--color-surface', 4.5, 'muted text on surface'], ['--color-text-muted', '--color-surface-2', 4.5, 'muted text on tint'],
  ['--color-link', '--color-bg', 4.5, 'link on page'], ['--color-link', '--color-surface', 4.5, 'link on surface'], ['--color-link', '--color-surface-2', 4.5, 'link on tint'],
  ['--color-on-action', '--color-action', 4.5, 'button label'], ['--color-on-action', '--color-action-hover', 4.5, 'button label on hover'], ['--color-on-danger', '--color-danger-fill', 4.5, 'danger button label'],
  ['--color-nav-text', '--color-nav-bg', 4.5, 'nav text'], ['--color-nav-label', '--color-nav-bg', 4.5, 'nav section label'], ['--color-nav-text', '--color-nav-hover', 4.5, 'nav text on hover'], ['--color-nav-active-text', '--color-nav-active-bg', 4.5, 'active nav item'],
  ['--color-danger', '--color-surface', 4.5, 'error text'], ['--color-danger', '--color-danger-bg', 4.5, 'error text on error box'], ['--color-success', '--color-surface', 4.5, 'success text'], ['--color-success', '--color-success-bg', 4.5, 'success text on success box'],
  ['--color-warning-text', '--color-surface', 4.5, 'warning text'], ['--color-warning-text', '--color-warning-bg', 4.5, 'warning text on warning box'],
  ['--color-line-strong', '--color-field', 3, 'input border on field'], ['--color-line-strong', '--color-surface', 3, 'input border on surface'], ['--color-line-strong', '--color-bg', 3, 'input border on page'],
  ['--color-focus', '--color-bg', 3, 'focus ring on page'], ['--color-focus', '--color-surface', 3, 'focus ring on surface'], ['--color-focus-on-dark', '--color-nav-bg', 3, 'focus ring on nav']
];
