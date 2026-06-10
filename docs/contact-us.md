# Contact Us — React Native (Expo) Implementation Spec

> **Audience:** Windsurf agent implementing the React Native mobile app.
> This specifies **only what the mobile app must implement** — screens, components, local state, user interactions, and navigation.
> The backend already exists. **Do NOT create any backend code.**
> Do NOT include any Next.js routes, imports, or web-specific code.

---

## 1. Overview — Screens to Create

| # | File | Purpose |
|---|---|---|
| 1 | `src/screens/ContactScreen.tsx` | Contact form — adapts for guests (name + email + subject + message) vs authenticated users (subject + message). Shows success or error state inline. |
| 2 | `src/screens/TrackMessageScreen.tsx` | Guest message tracker — look up a thread by reference + email. Displays the full thread with messages and allows replies. |

**Note:** The web app has a `/contact/success` route, but on mobile this is handled inline within `ContactScreen` (no separate screen needed).

---

## 2. Types

Create or extend `src/types/contact.ts`:

```ts
export interface ContactMessage {
  id: number;
  threadId: number;
  senderType: 'GUEST' | 'USER' | 'ADMIN';
  senderId: string | null;
  message: string;
  createdAt: string;
}

export interface ContactThread {
  id: number;
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  reference: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED';
  subject: string;
  messages: ContactMessage[];
  createdAt: string;
  updatedAt: string;
}

export type ThreadStatus = 'NEW' | 'READ' | 'REPLIED' | 'CLOSED';
```

---

## 3. API Endpoints Summary

### 3.1 Guest APIs (no auth token)

| # | Method | Endpoint | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| 1 | `POST` | `/api/v1/guest/contact` | Create guest thread | `{ guestName, guestEmail, subject, message }` | `ApiResponse<ContactThread>` |
| 2 | `GET` | `/api/v1/guest/contact/{reference}?guestEmail={email}` | Track thread by reference + email | — | `ApiResponse<ContactThread>` |
| 3 | `POST` | `/api/v1/guest/contact/{reference}/reply` | Reply to thread (guest) | `{ guestEmail, message }` | `ApiResponse<ContactThread>` |

### 3.2 Authenticated User APIs (requires auth token)

| # | Method | Endpoint | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| 4 | `POST` | `/api/v1/contact` | Create user thread | `{ subject, message }` | `ApiResponse<ContactThread>` |
| 5 | `GET` | `/api/v1/contact` | List user's threads (paginated) | Query: `status?`, `page?`, `size?` | `ApiResponse<PageResponse<ContactThread>>` |
| 6 | `GET` | `/api/v1/contact/{id}` | Get specific thread | — | `ApiResponse<ContactThread>` |
| 7 | `POST` | `/api/v1/contact/{id}/reply` | Reply to thread (user) | `{ message }` | `ApiResponse<ContactThread>` |

**Important:** Guest endpoints must use an HTTP client instance **without** an `Authorization` header. Create a separate unauthenticated axios/fetch instance for these calls.

---

## 4. External Stores

```ts
const { isAuthenticated, user } = useAuthStore();
```

- `isAuthenticated` → determines form variant (guest vs user).
- `user.fullName` / `user.email` → displayed in the "Sending as" badge.

No dedicated Zustand store is needed for this flow — all state is local to each screen.

---

## 5. Screen 1 — `ContactScreen`

### 5.1 Navigation Params

None (or optional `{ initialSubject?: string }` if deep-linked).

### 5.2 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `formData` | `{ guestName: string; guestEmail: string; subject: string; message: string }` | All `""` | Form fields |
| `errors` | `Record<string, string>` | `{}` | Per-field validation errors |
| `isSubmitting` | `boolean` | `false` | Submit in progress |
| `submitStatus` | `'idle' \| 'success' \| 'error'` | `'idle'` | Current view state |
| `referenceNumber` | `string` | `""` | Reference returned on success |
| `errorMessage` | `string` | `""` | API error message |
| `copied` | `boolean` | `false` | "Copied!" indicator for reference |

### 5.3 Validation — `validateForm()`

Run before submit. Set `errors` and return `boolean`.

| Field | Condition | Error Message |
|---|---|---|
| `guestName` (guest only) | empty | "Name is required" |
| `guestName` (guest only) | length > 255 | "Name must be less than 255 characters" |
| `guestEmail` (guest only) | empty | "Email is required" |
| `guestEmail` (guest only) | invalid format | "Invalid email format" |
| `guestEmail` (guest only) | length > 255 | "Email must be less than 255 characters" |
| `subject` | empty | "Subject is required" |
| `subject` | length > 255 | "Subject must be less than 255 characters" |
| `message` | empty | "Message is required" |
| `message` | length > 5000 | "Message must be less than 5000 characters" |

Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### 5.4 Event Handlers

#### `handleSubmit()`
1. Call `validateForm()` — if fails, return.
2. Set `isSubmitting = true`, `submitStatus = 'idle'`, `errorMessage = ''`.
3. **If authenticated:**
   - `POST /api/v1/contact` with `{ subject, message }`.
   - On success: set `referenceNumber = response.data.reference`, `submitStatus = 'success'`.
   - After 2 seconds: auto-navigate to ProfileScreen messages tab.
4. **If guest:**
   - `POST /api/v1/guest/contact` with `{ guestName, guestEmail, subject, message }`.
   - On success: set `referenceNumber`, `submitStatus = 'success'`.
5. On error: set `submitStatus = 'error'`, `errorMessage = <extracted message>`.
6. Finally: `isSubmitting = false`.

#### `handleChange(field, value)`
Update `formData[field]`. Clear `errors[field]` if it exists.

#### `handleCopyRef()`
Copy `referenceNumber` to clipboard (`Clipboard.setStringAsync` from `expo-clipboard`).
Set `copied = true`, reset to `false` after 2s.

### 5.5 Render States

The screen renders **one of three views** based on `submitStatus`:

---

#### View A — `submitStatus === 'idle'` → Contact Form

```
SafeAreaView
  ScrollView (keyboardShouldPersistTaps="handled")
    ┌─ Header
    │   ├─ "← Home" back button (navigate back or to Home)
    │   ├─ App logo (optional on mobile)
    │   ├─ "Get in touch" heading (large, bold)
    │   └─ Subtitle:
    │       Authenticated: "Send us a message and we'll get back to you soon"
    │       Guest: "Fill out the form and we'll get back to you soon"
    │
    ├─ Authenticated User Badge (only if isAuthenticated && user)
    │   ├─ User icon in emerald circle
    │   ├─ user.fullName || user.email (bold)
    │   └─ "Sending as logged-in user" (small, muted)
    │
    ├─ Form Card (rounded, bordered)
    │   ├─ Guest fields (only if !isAuthenticated):
    │   │   ├─ "YOUR NAME" label
    │   │   │   Input: User icon, placeholder "John Doe", maxLength 255
    │   │   │   Error text below if errors.guestName
    │   │   │
    │   │   └─ "YOUR EMAIL" label
    │   │       Input: Mail icon, placeholder "you@example.com", maxLength 255
    │   │       Error text below if errors.guestEmail
    │   │
    │   ├─ "SUBJECT" label
    │   │   Input: MessageSquare icon, placeholder "How can we help you?", maxLength 255
    │   │   Error text below if errors.subject
    │   │
    │   ├─ "MESSAGE" label
    │   │   TextInput (multiline, 5 lines): placeholder "Please describe your question or issue…"
    │   │   maxLength 5000
    │   │   Character counter: "{length} / 5,000" (bottom-right, muted)
    │   │   Error text below if errors.message
    │   │
    │   ├─ Submit error banner (if errors.submit)
    │   │   Red dot + error text
    │   │
    │   ├─ "Send Message" button (emerald, full-width)
    │   │   Icon: Send (or Loader2 spinner when isSubmitting)
    │   │   Text: "Send Message" / "Sending…"
    │   │   Disabled when isSubmitting
    │   │
    │   └─ "Cancel" button (outline, full-width)
    │       Navigate back, disabled when isSubmitting
    │
    └─ Footer link:
        "Have a reference number? Track your message"
        → navigate to TrackMessageScreen
```

**Input styling notes:**
- Each input has a left icon that changes colour on focus (emerald when focused, muted otherwise).
- Error state: red border + light red background.
- Focus state: emerald border + light emerald tint.

---

#### View B — `submitStatus === 'success'` → Success Screen

```
SafeAreaView
  ScrollView (centered content)
    ┌─ "← Home" back button
    │
    ├─ "Message sent!" heading (large, bold)
    ├─ "We'll get back to you as soon as possible" subtitle
    │
    └─ Success Card (rounded, bordered)
        ├─ Large CheckCircle icon (emerald, in circular bg)
        │
        ├─ "REFERENCE NUMBER" label (small, uppercase)
        │   Reference text (mono, bold, large): referenceNumber
        │   Copy button (clipboard icon → checkmark when copied)
        │
        ├─ Info text:
        │   Authenticated: "You can view and track your message in your profile."
        │   Guest: "Please save this reference number to track your message.
        │           We've sent a confirmation to your email."
        │
        ├─ Primary action:
        │   Authenticated: "View Messages →" button → navigate to ProfileScreen (messages tab)
        │   Guest: "Track Your Message" button → navigate to TrackMessageScreen
        │          with { ref: referenceNumber }
        │
        ├─ Secondary action (guest only):
        │   "Back to Home" button (outline)
        │
        └─ Auto-redirect text (authenticated only):
            "Redirecting to your messages…" (small, muted)
            Auto-navigate after 2 seconds
```

---

#### View C — `submitStatus === 'error'` → Error Screen

```
SafeAreaView
  ScrollView (centered content)
    ┌─ "← Home" back button
    │
    ├─ "Something went wrong" heading
    ├─ "We couldn't send your message" subtitle
    │
    └─ Error Card (rounded, bordered)
        ├─ Large XCircle icon (red, in circular bg)
        │
        ├─ Error message text (muted, centered)
        │   Shows errorMessage
        │
        ├─ "Try Again →" button (emerald, full-width)
        │   Sets submitStatus = 'idle' (returns to form, data preserved)
        │
        └─ "Back to Home" button (outline)
```

---

## 6. Screen 2 — `TrackMessageScreen`

### 6.1 Navigation Params

```ts
type TrackMessageParams = {
  ref?: string;  // optional pre-filled reference number
};
```

### 6.2 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `reference` | `string` | `params.ref \|\| ''` | Reference input |
| `email` | `string` | `''` | Email input |
| `thread` | `ContactThread \| null` | `null` | Loaded thread |
| `isLoading` | `boolean` | `false` | Search in progress |
| `error` | `string` | `''` | Error message |
| `replyMessage` | `string` | `''` | Reply textarea content |
| `isReplying` | `boolean` | `false` | Reply in progress |
| `replySent` | `boolean` | `false` | Auto-dismiss success banner |
| `copiedRef` | `boolean` | `false` | "Copied!" indicator |

### 6.3 Status Configuration

Map thread statuses to display config:

```ts
const STATUS_CONFIG = {
  NEW:     { label: 'New',     color: 'blue',    icon: Clock },
  READ:    { label: 'Read',    color: 'gray',    icon: CheckCircle2 },
  REPLIED: { label: 'Replied', color: 'emerald', icon: MessageCircle },
  CLOSED:  { label: 'Closed',  color: 'red',     icon: XCircle },
};
```

### 6.4 Utility Function

```ts
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
};
```

### 6.5 Event Handlers

#### `handleTrack()`
1. Validate: both `reference` and `email` must be non-empty. Email must match regex.
2. Set `isLoading = true`, `error = ''`, `thread = null`.
3. `GET /api/v1/guest/contact/{reference}?guestEmail={email}`.
4. On success: `setThread(response.data)`.
5. On error: `setError(<extracted message> || "Message not found. Please check your reference number and email.")`.
6. Finally: `isLoading = false`.

#### `handleReply()`
1. Guard: `!replyMessage.trim() || !thread` → return.
2. Set `isReplying = true`, `error = ''`.
3. `POST /api/v1/guest/contact/{thread.reference}/reply` with `{ guestEmail: email, message: replyMessage }`.
4. On success: `setThread(response.data)` (updated with new message), `setReplyMessage('')`, `setReplySent(true)`.
5. Auto-dismiss: `setTimeout(() => setReplySent(false), 3000)`.
6. On error: `setError(<message>)`.
7. Finally: `isReplying = false`.

#### `handleNewTrack()`
Reset all state: `thread = null`, `reference = ''`, `email = ''`, `error = ''`, `replyMessage = ''`, `replySent = false`.

#### `handleCopyRef()`
Copy `thread.reference` to clipboard. Set `copiedRef = true`, reset after 2s.

### 6.6 Render States

The screen shows one of two views based on `thread`:

---

#### View A — `thread === null` → Search Form

```
SafeAreaView
  ScrollView (keyboardShouldPersistTaps="handled")
    ┌─ "← Home" back button
    │
    ├─ Header:
    │   ├─ App logo (optional)
    │   ├─ "Track your message" heading (large, bold)
    │   └─ "Enter your reference number and email to view your thread" subtitle
    │
    ├─ Form Card (rounded, bordered)
    │   ├─ "REFERENCE NUMBER" label
    │   │   Input: Hash icon, placeholder "10000001", maxLength 8
    │   │
    │   ├─ "YOUR EMAIL" label
    │   │   Input: Mail icon, placeholder "you@example.com"
    │   │
    │   ├─ Error banner (if error)
    │   │   Red dot + error text
    │   │
    │   └─ "Track Message" button (emerald, full-width)
    │       Icon: Search (or Loader2 spinner when isLoading)
    │       Text: "Track Message" / "Searching…"
    │       Disabled when isLoading
    │
    └─ Footer link:
        "Need to send a new message? Contact us"
        → navigate to ContactScreen
```

---

#### View B — `thread !== null` → Thread View

```
SafeAreaView
  ScrollView
    ┌─ "← New Search" button (calls handleNewTrack)
    │
    ├─ Thread Header Card (rounded, bordered)
    │   ├─ Left column:
    │   │   ├─ Subject (bold, large, truncate)
    │   │   ├─ Reference row:
    │   │   │   Hash icon + reference (mono, bold) + Copy button
    │   │   └─ "Created {formatDate}" (tiny, muted)
    │   │
    │   └─ Right: Status badge
    │       Coloured pill: icon + label (from STATUS_CONFIG)
    │
    ├─ Messages List (chronological order)
    │   For each message in thread.messages:
    │     Message Bubble:
    │       ├─ Alignment / colour:
    │       │   GUEST: left-aligned, emerald tint bg
    │       │   ADMIN: right-aligned (or indented left), card bg / blue tint
    │       │
    │       ├─ Sender row:
    │       │   ├─ Avatar circle:
    │       │   │   GUEST → User icon (emerald)
    │       │   │   ADMIN → Shield icon (blue)
    │       │   ├─ Sender label: "You" or "Admin"
    │       │   └─ Timestamp: formatDate(message.createdAt) (right-aligned, tiny)
    │       │
    │       └─ Message body:
    │           Text (preserves whitespace/newlines)
    │
    ├─ Reply Section (only if thread.status !== 'CLOSED'):
    │   Card (rounded, bordered):
    │     ├─ Success banner (if replySent):
    │     │   CheckCircle + "Reply sent successfully" (emerald, auto-dismiss 3s)
    │     │
    │     ├─ "SEND A REPLY" label
    │     ├─ TextInput (multiline, 4 lines)
    │     │   placeholder "Type your reply…", maxLength 5000
    │     │   Character counter: "{length} / 5,000"
    │     │
    │     ├─ Error banner (if error)
    │     │
    │     └─ "Send Reply" button (emerald)
    │         Icon: Send (or Loader2 spinner when isReplying)
    │         Disabled when isReplying || !replyMessage.trim()
    │
    ├─ Closed Thread Banner (only if thread.status === 'CLOSED'):
    │   XCircle icon + "This thread has been closed and no further replies can be sent."
    │   Red tint background
    │
    └─ "Track Another Message" button (outline, full-width)
        Icon: Search
        Calls handleNewTrack
```

---

## 7. Navigation Flow

```
Home / More menu
  └─ "Contact Us" tap
      └─ ContactScreen
          ├─ Form submit (success, authenticated)
          │   → auto-redirect to ProfileScreen (messages tab) after 2s
          │
          ├─ Form submit (success, guest)
          │   → inline success view with "Track Your Message" button
          │       └─ TrackMessageScreen (ref pre-filled)
          │
          ├─ Form submit (error)
          │   → inline error view with "Try Again" button
          │
          └─ "Track your message" footer link
              └─ TrackMessageScreen
                  ├─ Search form → thread found → Thread view
                  │   ├─ Reply → updated thread
                  │   └─ "New Search" → back to search form
                  │
                  └─ "Contact us" footer link → ContactScreen
```

---

## 8. Edge Cases

1. **Guest vs Authenticated form:** The form adapts automatically. If `isAuthenticated`, the name and email fields are **hidden** (the backend uses the auth token to identify the user). If not authenticated, name and email are required.

2. **Authenticated user badge:** When logged in, display a non-editable info banner showing the user's name and "Sending as logged-in user" so they know which account will be used.

3. **Auto-redirect (authenticated success):** After successful submission for an authenticated user, show the success screen for 2 seconds, then automatically navigate to the Profile messages tab. Show a "Redirecting to your messages…" hint.

4. **Guest success — save reference:** Guests are shown the reference number prominently with a copy button and a warning to save it, since it's their only way to track the thread.

5. **Copy to clipboard:** Use `expo-clipboard` (`Clipboard.setStringAsync`). Show a brief checkmark icon for 2 seconds after copying.

6. **Form data preserved on error:** When `submitStatus` changes to `'error'` and the user taps "Try Again", `submitStatus` resets to `'idle'` and the form re-renders **with all previously entered data intact**.

7. **Validation error clearing:** When the user types in a field that has a validation error, the error for that specific field is cleared immediately.

8. **Character limits:** `guestName` and `guestEmail`: 255. `subject`: 255. `message` and `replyMessage`: 5000. Show a character counter for the message field.

9. **Track screen — pre-filled reference:** When navigating from the success screen with `ref` param, the reference field is pre-filled. The user still needs to enter their email.

10. **Thread status styling:** Each status gets a distinct colour:
    - **NEW** → blue (Clock icon)
    - **READ** → gray (CheckCircle icon)
    - **REPLIED** → emerald/green (MessageCircle icon)
    - **CLOSED** → red (XCircle icon)

11. **Closed threads:** If `thread.status === 'CLOSED'`, the reply form is **replaced** by a banner: "This thread has been closed and no further replies can be sent."

12. **Reply success banner:** After a successful reply, a green banner ("Reply sent successfully") appears for 3 seconds, then auto-dismisses. The thread is refreshed with the new message appended.

13. **Message bubbles:** Guest messages (senderType `GUEST` or `USER`) are styled differently from admin messages (`ADMIN`). Guest messages are left-aligned with emerald tint; admin messages are indented from the left with a blue/neutral tint.

14. **Guest API — no auth header:** The guest endpoints must use an HTTP client that **does not send** an `Authorization` header. This is critical. Create a separate axios instance or strip the header before requests.

15. **Keyboard handling:** Use `KeyboardAvoidingView` or `keyboardShouldPersistTaps="handled"` on the ScrollView to ensure form inputs are accessible when the keyboard is open.

16. **Track validation:** Both reference and email fields must be filled. Email must match the regex. Show inline error if validation fails — do not call the API.

17. **Track not found:** If the API returns an error (e.g. 404), display: "Message not found. Please check your reference number and email."
