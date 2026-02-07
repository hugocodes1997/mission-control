# Mission Control - Security & Privacy Policy

## Overview
Mission Control is a dashboard for tracking OpenClaw activity. **Privacy is paramount** — no sensitive information is ever logged.

## Automatic Redaction

The following are **automatically stripped** from all logs:

### Credentials & Secrets
- GitHub tokens (`ghp_*`, `github_pat_*`)
- API keys (`sk-*`, `AKIA*`, etc.)
- JWT tokens
- Private keys
- `.env` file contents
- Anything in `secrets/` or `credentials/` paths

### Personal Information
- Email addresses
- Phone numbers
- Physical addresses
- IP addresses
- Names from contacts

### Private Communications
- WhatsApp message content
- Signal message content  
- iMessage/SMS content
- Direct message previews

### Sensitive Files
- `MEMORY.md` (contains personal context about Al)
- `USER.md` (contains personal info)
- `CONTACTS.md`
- `secrets/*`
- `*.env*`

## What IS Logged

Safe, non-sensitive activity:
- Tool names (`web_search`, `file_write`, etc.)
- Operation success/failure status
- Public file paths (`components/Button.tsx`)
- Public URLs (deployed sites)
- Cron job names and schedules
- Generic descriptions ("Updated dashboard", "Ran watchdog")

## Code Implementation

All logging goes through `lib/mission-control-logger.ts` which applies sanitization:

```typescript
// Before logging, all text is run through sanitizeText()
const sanitized = sanitizeText(rawContent);

// Sensitive paths are checked
if (isSensitivePath(path)) {
  details = "[PATH_REDACTED_FOR_SECURITY]";
}
```

## Verification

To verify sanitization is working:
```bash
# This should show redacted output in dashboard
mc-log tool_call "Test" "Token: ghp_test123456789012345678901234567890"
```

Expected dashboard entry: "Token: [GITHUB_TOKEN_REDACTED]"

## If You See a Leak

If any sensitive data appears in the dashboard:
1. Immediately run `/purge-logs` or contact me
2. I'll delete the affected records from Convex
3. File a bug to improve the filter

---

**Rule of thumb:** When in doubt, redact it. Better to have less detail than expose private information.
