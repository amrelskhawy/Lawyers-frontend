# Login rebuild — PrimeNG + accessibility

**Date:** 2026-07-12
**Scope:** `frontend/src/app/authcation/login/*` + `authcation-module.ts`

## Goal
Rebuild the login page using PrimeNG form components and make it accessible,
while keeping the existing visual design (two-column split, navy/gold palette,
side panel, slideUp animation, responsive collapse < 900px).

## Component swaps
- Email: `p-floatlabel` + `pInputText`, leading envelope icon (decorative, aria-hidden).
- Password: `p-password` with `[toggleMask]="true"` `[feedback]="false"` (accessible built-in toggle).
- Submit: `p-button` styled navy with trailing arrow.
- Errors: inline node with `role="alert"` / `aria-live="polite"`.
- New: `p-checkbox` "remember me" beside forgot-password link.

## Accessibility requirements
- Programmatic labels for every control (`label[for]`).
- `aria-invalid` + `aria-describedby` linking each field to its error node.
- Error container announced via `aria-live="polite"`.
- Submit button stays enabled; on invalid submit, validate and move focus to first
  invalid control (do NOT disable the button on invalid).
- `aria-label`s on home/back link and language switcher; `aria-hidden` on decorative icons.
- Respect `prefers-reduced-motion` for animations.

## "Remember me" (email-only)
- When checked, persist ONLY the email in `localStorage` (`login_remembered_email`).
- Pre-fill email on init; check the box if a value exists.
- Token/session remain in `sessionStorage` — no changes to guard/interceptor/auth service.
- Uncheck + submit clears the stored email.

## Preserved
- `onSubmit()` auth POST + role-based routing logic unchanged.
- SCSS restyles PrimeNG internals to match current navy/gold theme.

## Files
- `login.html`, `login.ts`, `login.scss`
- `authcation-module.ts` (add PrimeNG module imports)
