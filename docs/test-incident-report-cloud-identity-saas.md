# Test Incident Report: Cloud Identity and SaaS Account Takeover

## Summary

On 2026-02-03, the identity monitoring team observed impossible-travel sign-ins for user `irina.sokolova@northwind-example.com`. Authentication logs show a successful login to Microsoft 365 from `91.219.236.17` at 04:11 UTC, followed by access to Exchange Online and SharePoint Online from `103.27.109.88` six minutes later. The same account accessed `hxxps://portal.office-reset[.]com/auth/mfa` approximately 40 minutes before the first successful sign-in.

Investigation found that the user received an email prompting an urgent MFA reset and followed the link above. The page proxied credentials to the legitimate tenant and captured the session. Reverse proxy telemetry includes the user-agent `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.3 Safari/605.1.15`.

Audit logs show a new inbox rule `MoveToRSS` created in Exchange, then a malicious OAuth application consent named `Document Review Helper`. The app requested `Mail.Read`, `Files.Read.All`, and `offline_access`. Investigators also found a stolen refresh token used against `hxxps://graph.microsoft[.]com/v1.0/me/messages`. The actor enumerated OneDrive folders and downloaded multiple HR archives from `hxxps://northwind-my.sharepoint[.]com/personal/irina_sokolova/_layouts/15/onedrive.aspx`.

The following suspicious artifacts were captured in the investigation notes:

- Redirector domain `portal.office-reset[.]com`
- Reverse proxy relay `mfa-check-cloud[.]net`
- Callback URL `hxxps://mfa-check-cloud[.]net/session/complete`
- Source IPs `91.219.236.17` and `103.27.109.88`
- User browser string `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.3 Safari/605.1.15`

No malware was found on the endpoint. The incident is identity-centric and focused on session theft, valid credential abuse, OAuth abuse, and SaaS data access.

## Timeline

- 2026-02-03 03:29 UTC: user clicked `https://portal.office-reset.com/auth/mfa`
- 2026-02-03 04:11 UTC: first successful Microsoft 365 sign-in from `91.219.236.17`
- 2026-02-03 04:17 UTC: Exchange inbox rule `MoveToRSS` created
- 2026-02-03 04:24 UTC: OAuth application `Document Review Helper` granted consent
- 2026-02-03 04:31 UTC: Microsoft Graph access observed
- 2026-02-03 04:44 UTC: OneDrive download activity from `103.27.109.88`

## Extractable IOCs

- Domain: `portal.office-reset.com`
- Domain: `mfa-check-cloud.net`
- Domain: `graph.microsoft.com`
- Domain: `northwind-my.sharepoint.com`
- URL: `https://portal.office-reset.com/auth/mfa`
- URL: `https://mfa-check-cloud.net/session/complete`
- URL: `https://graph.microsoft.com/v1.0/me/messages`
- URL: `https://northwind-my.sharepoint.com/personal/irina_sokolova/_layouts/15/onedrive.aspx`
- IPv4: `91.219.236.17`
- IPv4: `103.27.109.88`
- User-Agent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.3 Safari/605.1.15`

## Recommended ATT&CK Mapping

- Matrix: ATT&CK Enterprise, focus on Cloud and Identity/SaaS techniques
- Likely tactics: Initial Access, Credential Access, Persistence, Collection, Exfiltration
- Likely techniques:
  - `T1566.002` Phishing: Spearphishing Link
  - `T1078` Valid Accounts
  - `T1528` Steal Application Access Token
  - `T1098` Account Manipulation
  - `T1114` Email Collection
  - `T1530` Data from Cloud Storage
  - `T1550` Use Alternate Authentication Material
