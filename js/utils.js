export function getRootStyle(rootEl, cssVariable) {
  return getComputedStyle(rootEl).getPropertyValue(cssVariable);
}

export function getPreferredTheme() {
  const userPref = localStorage.getItem('theme');
  const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // If the user previously selected dark mode manually, or
  // if no saved preference (first visit), but their system prefers dark mode
  if (userPref === 'dark' || (!userPref && systemPref)) {
    return 'dark';
  }

  return 'light';
}
