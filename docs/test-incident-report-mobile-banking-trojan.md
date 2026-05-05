# Test Incident Report: Android Banking Trojan with SMS Interception

## Summary

On 2026-03-01, fraud analysts linked several unauthorized transfers to an Android device used by employee `svetlana.krivova`. The user had installed an APK presented as `Secure HR Update` after browsing `hxxps://portal-hr-benefits[.]mobile-check[.]com/android`. Device telemetry from MDM later identified the package file at `/storage/emulated/0/Download/hr_update_secure.apk`.

The APK SHA-256 was `9f1c3a1d2a75f7ab4b362a98d49ef72b3e74527e1a8a5c7fd2e39089d9a781aa`. After installation, the app requested accessibility permissions and began polling `hxxps://api-mobile-sync[.]com/v2/checkin`. It also resolved `push-gateway-secure[.]net` and connected to `77.91.124.55`.

Analysts extracted additional artifacts from the sandbox run:

- Drop path `/data/user/0/com.secure.hr.update/files/core.dex`
- Config URL `hxxps://api-mobile-sync[.]com/v2/config`
- Overlay template URL `hxxps://push-gateway-secure[.]net/overlays/ru_sber.html`
- User-agent `Dalvik/2.1.0 (Linux; U; Android 13; Pixel 6 Build/TQ3A.230901.001)`

The malware intercepted SMS verification messages and displayed banking overlays over legitimate apps. A second-stage module used WebSocket traffic to `wss://api-mobile-sync[.]com/ws` to receive commands.

## Timeline

- 2026-03-01 12:02 UTC: user visited `https://portal-hr-benefits.mobile-check.com/android`
- 2026-03-01 12:05 UTC: APK downloaded to `/storage/emulated/0/Download/hr_update_secure.apk`
- 2026-03-01 12:11 UTC: accessibility permission granted
- 2026-03-01 12:13 UTC: first beacon to `api-mobile-sync.com`
- 2026-03-01 12:20 UTC: SMS interception behavior observed

## Extractable IOCs

- Domain: `portal-hr-benefits.mobile-check.com`
- Domain: `api-mobile-sync.com`
- Domain: `push-gateway-secure.net`
- URL: `https://portal-hr-benefits.mobile-check.com/android`
- URL: `https://api-mobile-sync.com/v2/checkin`
- URL: `https://api-mobile-sync.com/v2/config`
- URL: `https://push-gateway-secure.net/overlays/ru_sber.html`
- URL: `wss://api-mobile-sync.com/ws`
- IPv4: `77.91.124.55`
- SHA-256: `9f1c3a1d2a75f7ab4b362a98d49ef72b3e74527e1a8a5c7fd2e39089d9a781aa`
- File path: `/storage/emulated/0/Download/hr_update_secure.apk`
- File path: `/data/user/0/com.secure.hr.update/files/core.dex`
- User-Agent: `Dalvik/2.1.0 (Linux; U; Android 13; Pixel 6 Build/TQ3A.230901.001)`

## Recommended ATT&CK Mapping

- Matrix: ATT&CK for Mobile
- Likely tactics: Initial Access, Execution, Credential Access, Collection, Command and Control
- Likely techniques:
  - `T1661` Phishing
  - `T1475` Deliver Malicious App via Web Download
  - `T1417` Input Capture
  - `T1636` Protected User Data
  - `T1437` Application Layer Protocol
