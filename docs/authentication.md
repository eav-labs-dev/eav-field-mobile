# Authentication contract

## Login

EAV Field submits credentials to:

```http
POST /api/v1/auth/login
Content-Type: application/json
```

The request body contains the field officer's `email` and `password` values. The password exists only for the duration of the request.

The endpoint uses the standard EAV response envelope. Its `data` value contains:

| Field | Type | Purpose |
|---|---|---|
| `accessToken` | string | Opaque API credential stored by the secure session boundary |
| `user.displayName` | string | Name shown in the mobile interface |
| `user.email` | string | Authenticated field-officer email |

The client does not inspect or decode the token. Native builds persist the small session object in Expo SecureStore. When SecureStore is unavailable, such as on web, the session remains in memory and is lost on refresh.

## Portfolio demo session

When and only when `EXPO_PUBLIC_DEMO_MODE=true`, the login screen exposes a clearly labelled “Explore offline demo” action. It creates a fictional local session so reviewers can exercise cached assignments, draft persistence, photos, and queue behavior without claiming a deployed Field backend. The action is absent by default and does not make API downloads or uploads succeed.

## Protected requests

The centralized API client loads the current token immediately before each protected request and adds:

The client sends the stored access token through the standard HTTP bearer-authentication header.

The login call explicitly disables this header so an expired stored token cannot change credential exchange behavior. Signing out deletes the stored session before returning to the login route.

## Non-goals

- Refresh-token rotation
- Biometric session unlock
- Password recovery
- Single sign-on
- A production authentication bypass
- Server-side token implementation
