# Test Incident Report: ICS Remote Access Misuse and PLC Logic Upload

## Summary

On 2026-02-18, the OT monitoring team detected an unauthorized engineering session to the water treatment segment at substation `WT-PLANT-02`. A remote support workstation `ENG-LAPTOP-07` connected through the jump server `ot-vpn-gateway[.]plant-support[.]net` from public IP `176.119.3.44`. The session reached engineering workstation `10.77.14.25`, then initiated programming traffic toward PLC `10.77.20.14`.

Firewall and historian logs show repeated access to `hxxps://ot-vpn-gateway[.]plant-support[.]net/remote/login` followed by SMB and vendor programming activity. The operator workstation loaded project file `C:\Program Files\ControlLogic\Projects\clarifier_stage2.ap15` and transferred a modified logic package to the PLC. Shortly before the upload, the remote user downloaded a file from `hxxp://91.240.118.73/diag/update.pkg`.

Forensic notes mention a suspicious utility stored at `C:\Users\engineer\AppData\Roaming\diag\diagtool.exe` with SHA-1 `a7f5f35426b927411fc9231b56382173f1d1d5d7`. The same host created registry key `HKLM\Software\Microsoft\Windows\CurrentVersion\Run\DiagMonitor` to relaunch the tool after reboot.

Network captures show outbound requests with user-agent `python-requests/2.31.0` to:

- `hxxp://91.240.118.73/diag/update.pkg`
- `hxxps://ot-vpn-gateway.plant-support.net/remote/login`

The affected PLC controlled chemical dosing timing. Operations reverted the uploaded logic before process disruption occurred.

## Timeline

- 2026-02-18 21:08 UTC: VPN login to `ot-vpn-gateway.plant-support.net`
- 2026-02-18 21:14 UTC: engineering workstation `10.77.14.25` accessed
- 2026-02-18 21:19 UTC: download from `91.240.118.73/diag/update.pkg`
- 2026-02-18 21:27 UTC: PLC `10.77.20.14` received logic upload
- 2026-02-18 21:34 UTC: OT anomaly alert triggered

## Extractable IOCs

- Domain: `ot-vpn-gateway.plant-support.net`
- URL: `https://ot-vpn-gateway.plant-support.net/remote/login`
- URL: `http://91.240.118.73/diag/update.pkg`
- IPv4: `176.119.3.44`
- IPv4: `91.240.118.73`
- IPv4: `10.77.14.25`
- IPv4: `10.77.20.14`
- SHA-1: `a7f5f35426b927411fc9231b56382173f1d1d5d7`
- File path: `C:\Program Files\ControlLogic\Projects\clarifier_stage2.ap15`
- File path: `C:\Users\engineer\AppData\Roaming\diag\diagtool.exe`
- Registry key: `HKLM\Software\Microsoft\Windows\CurrentVersion\Run\DiagMonitor`
- User-Agent: `python-requests/2.31.0`

## Recommended ATT&CK Mapping

- Matrix: ATT&CK for ICS
- Likely tactics: Initial Access, Execution, Persistence, Lateral Movement, Impair Process Control
- Likely techniques:
  - `T0866` Remote Services
  - `T0843` Program Download
  - `T0859` Valid Accounts
  - `T0807` Command-Line Interface
  - `T0873` Lateral Tool Transfer
  - `T0831` Manipulation of Control

## Note For STIX Testing

This report intentionally mixes IT-style IOCs with OT-specific behavior so you can verify that the parser still extracts indicators cleanly even when the ATT&CK mapping should come from the ICS matrix rather than Enterprise.
