/* PostHog owns the 50/50 assignment. Storage is only a first-paint hint,
 * never a randomizer or proof of exposure. No DOM/input replacement. */
(function () {
  var FLAG = 'landing-icons-v1';
  var KEY = 'pablo_icons_ab_v1';
  var html = document.documentElement;
  var variant = 'control';
  var confirmed = false;
  var locked = false;
  var preview = false;
  var domReady = document.readyState !== 'loading';
  function valid(v) { return v === 'control' || v === 'test'; }
  function paint(v) {
    variant = v;
    html.setAttribute('data-icons-variant', v);
  }
  function save(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ variant: v, at: Date.now() })); } catch (_) {}
  }
  try {
    var cached = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (cached && valid(cached.variant) && Date.now() - cached.at < 86400000 && cached.at <= Date.now()) paint(cached.variant);
  } catch (_) {}
  // QA cannot force an assignment in production or pollute experiment data.
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
    var forced = new URLSearchParams(location.search).get('icons-preview');
    if (valid(forced)) { preview = true; paint(forced); }
  }
  document.addEventListener('pointerdown', function () { locked = true; }, { once: true, capture: true });
  document.addEventListener('keydown', function () { locked = true; }, { once: true, capture: true });
  var phReady = false;
  function evaluate() {
    if (preview || confirmed || !domReady || !phReady) return;
    var ph = window.posthog;
    if (!document.querySelector('[data-icons-test]')) return;
    var value;
    try { value = ph.getFeatureFlag(FLAG, { send_event: false }); } catch (_) { return; }
    if (value === undefined) return; // A network failure is not an assignment.
    if (!valid(value)) {
      try { localStorage.removeItem(KEY); } catch (_) {}
      if (!locked) paint('control');
      return; // Disabled/unassigned visitors never enter the experiment.
    }
    save(value);
    // Exclude BOTH arms after the cutoff, even if control is already visible.
    // Otherwise fast visitors would enter control but not treatment (selection bias).
    if (locked) return; // Saved assignment is available on the next page.
    paint(value);
    confirmed = true;
    try {
      // Read only after the actual variant is rendered: SDK records exposure.
      ph.getFeatureFlag(FLAG);
    } catch (_) {}
  }
  if (!domReady) document.addEventListener('DOMContentLoaded', function () {
    domReady = true;
    evaluate();
    setTimeout(function () { locked = true; }, 1500);
  }, { once: true });
  else setTimeout(function () { locked = true; }, 1500);
  var attempts = 0;
  function connect() {
    if (preview) return;
    var ph = window.posthog;
    if (ph && typeof ph.onFeatureFlags === 'function') {
      ph.onFeatureFlags(function () { phReady = true; evaluate(); });
      return;
    }
    if (++attempts < 80) setTimeout(connect, 250);
  }
  window.pabloIconExperiment = {
    key: FLAG,
    variant: function () { return variant; },
    confirmed: function () { return confirmed; },
  };
  connect();
})();
