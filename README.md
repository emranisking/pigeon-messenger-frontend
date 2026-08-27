# Pigeon Messenger — Vue 3 Edition

A full Vue 3 (Composition API + Pinia) rewrite of the original plain
HTML/CSS/JS Messenger frontend. Same backend contract (REST `/api/*`
+ STOMP-over-SockJS `/ws-chat`), same look and feel, but rebuilt as a
proper component-based SPA with a working theme system, real mobile
responsiveness, and a handful of real bugs fixed along the way.

## Getting started

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your backend
npm run dev                # http://localhost:5173
```

The dev server proxies `/api/*` and `/ws-chat` to `VITE_API_BASE_URL`
(default `http://localhost:8080`), so the app can talk to your
existing backend with zero CORS configuration.

For production:

```bash
npm run build      # outputs static files to dist/
npm run preview    # sanity-check the production build locally
```

Deploy `dist/` behind the same origin as your backend (like the
original app was), and the relative `/api` and `/ws-chat` calls will
just work — no environment variables needed at runtime.

## Project structure

```
src/
  main.js                 Vue + Pinia bootstrap
  App.vue                 Switches between AuthView / MessengerView
  style/base.css           Design tokens (CSS custom properties) + reset
  services/
    api.js                 REST client (fetch wrapper, JWT header)
    websocket.js            STOMP/SockJS client
  stores/                  Pinia stores (single source of truth)
    auth.js                 token/userId/username, login/register/logout
    chat.js                 conversations, groups, messages, WS handlers
    ui.js                   toasts, modal visibility, connection status
  composables/
    useTheme.js              light/dark/system + accent color, persisted
    useUserSearch.js         debounced user search (shared by both modals)
  utils/
    format.js                 date/time formatting
    avatar.js                  deterministic avatar colors
    messageGrouping.js         bubble-grouping + date-separator logic
  components/
    common/                  Avatar, LoadingSpinner, ConnectionBar, ToastContainer
    modals/                  BaseModal (mobile bottom-sheet), NewChatModal, NewGroupModal
    theme/                   ThemeSwitcher popover
    sidebar/                 Header, Tabs, Search, ConversationItem/List, UserBar
    chat/                    EmptyState, Header, MessageBubble, MessageList, InputBar
    layout/                  Sidebar.vue + ChatPanel.vue (mobile show/hide wrappers)
  views/
    AuthView.vue              Login / register
    MessengerView.vue         Sidebar + ChatPanel + modals, connects WS on mount
```

Every REST endpoint and STOMP destination/queue is unchanged from the
original (`/api/auth/login`, `/api/conversations`, `/app/chat.send`,
`/user/queue/messages`, `/topic/group/{id}`, etc.), so this is a
drop-in frontend replacement — no backend changes required.

## Theming ("let the user handle it")

Click the small palette icon next to your name in the bottom-left
corner. You can pick:

- **Mode** — Light / Dark / System (System follows the OS setting
  live, via `prefers-color-scheme`, no reload needed).
- **Accent color** — six presets that re-tint every primary-colored
  element (buttons, sent bubbles, links, unread dots, etc.) instantly.

Both choices persist to `localStorage` and are re-applied
*synchronously* before Vue even mounts (see the inline script in
`index.html`), so there's no flash of the wrong theme on reload.

## Mobile responsiveness

The whole layout is now driven by CSS media queries instead of
imperative `window.innerWidth` checks:

- Below 768px, the sidebar and the active chat swap via a `display:
  none` class that's purely a function of "is a chat currently open"
  — always correct, even if you rotate/resize mid-session.
- Modals become bottom sheets (not centered dialogs) below 640px,
  anchored to the thumb and respecting `env(safe-area-inset-bottom)`
  for notched phones.
- Message bubbles use `min(280px, 68vw)` instead of a hardcoded
  280px, so they never force horizontal scrolling on narrow phones.
- All text inputs are `font-size: 16px` to stop iOS Safari's
  auto-zoom-on-focus.
- The app shell uses `100dvh` instead of `100vh` so the input bar
  never hides under a mobile browser's address bar.

## Bugs fixed vs. the original

1. **Username-breaks-onclick bug** — the original built `onclick`
   handler strings by concatenating raw usernames into JS string
   literals (`onclick="App.open('${id}','${escapeHtml(username)}')"`).
   A username containing a single quote would break the generated
   JavaScript and silently fail. Vue's event bindings pass real
   objects/values instead of interpolating into inline JS, so this
   class of bug can't happen anymore.
2. **Dead sidebar search** — the sidebar's search box rendered a
   `.search-results` dropdown in the CSS/HTML that was never
   populated by any JS — a half-built, non-functional feature. It's
   now a real (working) local filter over your conversations/groups,
   with the actual person-search living in the New Message/New Group
   modals where it already worked.
3. **Blocking `alert()` on group-creation failure** — replaced with a
   dismissible toast, consistent with how every other error surfaces.
4. **Stuck tab title** — `flashNewMessageTitle()` (originally
   `playNotificationEffect()`) captured "the title to revert to" fresh
   on every call. If a second message arrived before the first
   3-second flash finished, it would capture "💬 New Message!" as the
   "original" title and get permanently stuck on it. Fixed by
   capturing the true base title once, and clearing any pending timer
   before starting a new one.
5. **Stale mobile layout after resize** — see "Mobile responsiveness"
   above; the original's JS-driven panel toggling could leave the
   sidebar hidden on a desktop-width viewport after a resize.
6. **iOS auto-zoom on inputs** — message box and auth form inputs
   were 15px, under Safari's 16px zoom threshold.
7. **Message bubble overflow on narrow phones** — hardcoded 280px max
   width, fixed with a responsive `min()`.
8. **Stale state across accounts** — the original always did a full
   page reload on logout, which incidentally wiped all JS state. This
   SPA doesn't reload on logout, so `chat.reset()` now explicitly
   clears conversations/messages/groups/caches so a second account
   logging in on the same tab never briefly sees the first account's
   data.
9. **Reconnect race** — the original combined the STOMP client's own
   retry behaviour with a hand-rolled `setTimeout` reconnect, which
   could double up after a flaky connection. Now handled by a single
   `reconnectDelay` on the STOMP client.

## Notes

- WebSocket client upgraded from the unmaintained `stompjs` CDN
  package to `@stomp/stompjs` (actively maintained, same protocol).
- `npm audit` reports one moderate advisory in `esbuild`, used only by
  Vite's *dev server* (not the production build) — safe to ignore for
  local development; run `npm audit fix --force` if you want the
  latest Vite major regardless.
