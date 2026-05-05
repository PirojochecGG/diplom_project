# ATT&CK Matrix Recommendations for Unstructured Incident Reports

## Goal

Your target is not just to store reports as text. The practical goal is:

1. take unstructured incident text;
2. extract observable indicators and analyst context;
3. enrich them with ATT&CK techniques;
4. build a STIX 2.1 bundle with `report`, `indicator`, `attack-pattern`, and `relationship` objects.

Because of that, you should choose the ATT&CK matrix by the incident environment first, and only then assign techniques to extracted IOCs and behaviors.

## Which Matrix To Use

### 1. ATT&CK Enterprise

Use for classic corporate incidents:

- Windows workstations
- Linux servers
- macOS endpoints
- phishing
- malware loaders
- ransomware
- Active Directory abuse
- web shells
- C2 over HTTP/HTTPS/DNS

Recommended for:

- `test-incident-report-phishing-loader-enterprise.md`

Typical technique examples:

- `T1566.002` Spearphishing Link
- `T1204.002` User Execution: Malicious File
- `T1059.001` PowerShell
- `T1547.001` Registry Run Keys / Startup Folder
- `T1071.001` Web Protocols

### 2. ATT&CK Enterprise with Cloud Focus

MITRE does not require a separate product-specific matrix for every SaaS case in your workflow. For Microsoft 365, Okta, Entra ID, AWS, Azure, GCP, Google Workspace and similar environments, you still stay in ATT&CK Enterprise, but you select techniques that describe cloud and identity behavior.

Recommended for:

- `test-incident-report-cloud-identity-saas.md`

Typical technique examples:

- `T1078` Valid Accounts
- `T1528` Steal Application Access Token
- `T1098` Account Manipulation
- `T1530` Data from Cloud Storage
- `T1114` Email Collection

### 3. ATT&CK Enterprise with Containers Focus

If the incident is inside Docker, Kubernetes, container runtime, or cluster control plane activity, keep using ATT&CK Enterprise but choose container-relevant techniques.

Recommended for:

- `test-incident-report-kubernetes-cryptominer.md`

Typical technique examples:

- `T1609` Container Administration Command
- `T1610` Deploy Container
- `T1053.003` Cron
- `T1496` Resource Hijacking
- `T1105` Ingress Tool Transfer

### 4. ATT&CK for ICS

Use when the protected process is industrial and the behavior is tied to PLC, HMI, engineering workstation, historian, safety controller, or OT remote access.

Recommended for:

- `test-incident-report-ics-remote-access.md`

Typical technique examples:

- `T0866` Remote Services
- `T0843` Program Download
- `T0859` Valid Accounts
- `T0831` Manipulation of Control

### 5. ATT&CK for Mobile

Use when the compromise target is Android or iOS and the behavior concerns mobile application delivery, overlay abuse, SMS interception, accessibility abuse, or mobile C2.

Recommended for:

- `test-incident-report-mobile-banking-trojan.md`

Typical technique examples:

- `T1475` Deliver Malicious App via Web Download
- `T1417` Input Capture
- `T1636` Protected User Data

## What To Map In Your Pipeline

For your current task, the most useful split is this:

- `report` object: create from the whole markdown incident
- `indicator` objects: create from domains, URLs, IPs, hashes, file paths, registry keys, user-agents
- `attack-pattern` objects: create only after analyst mapping or rule-based enrichment
- `relationship` objects: link `indicator -> attack-pattern` with `indicates`

That means the matrix is chosen at the incident level, but the ATT&CK techniques are assigned at IOC or behavior level.

## Practical Rule Set

- If the text is about phishing, malware, endpoint persistence, scripts, services, scheduled tasks, or C2, start with ATT&CK Enterprise.
- If the text is about Microsoft 365, Okta, OAuth, tokens, mailbox rules, cloud storage, or SaaS identity abuse, still use ATT&CK Enterprise, but select cloud-oriented techniques.
- If the text is about Kubernetes, pods, containers, registries, service accounts, or cluster admin actions, use ATT&CK Enterprise with container techniques.
- If the text is about PLC, HMI, engineering stations, substation networks, Modbus, DNP3, or logic upload, use ATT&CK for ICS.
- If the text is about APK, iOS profiles, accessibility abuse, SMS theft, overlays, or mobile apps, use ATT&CK for Mobile.

## Important Limitation

Do not try to infer ATT&CK only from a single IOC.

Examples:

- a domain alone is not a technique;
- an IP alone is not a tactic;
- a hash alone is not an attack pattern.

Technique mapping should use the IOC together with nearby behavior in the text:

- `registry run key` plus malware startup context -> persistence technique
- `OAuth consent` plus token reuse -> cloud credential abuse technique
- `PLC logic upload` plus engineering workstation access -> ICS program download technique

## Suggested Processing Order

1. Parse the raw markdown as unstructured narrative.
2. Extract all observables and normalize them by IOC type.
3. Group incident context by environment: enterprise, cloud, containers, ics, mobile.
4. Choose the ATT&CK matrix from that environment.
5. Assign candidate techniques from nearby sentences, commands, and timeline events.
6. Build the STIX bundle.

## Included Test Files

- `test-incident-report-phishing-loader-enterprise.md` -> ATT&CK Enterprise
- `test-incident-report-cloud-identity-saas.md` -> ATT&CK Enterprise with cloud identity focus
- `test-incident-report-kubernetes-cryptominer.md` -> ATT&CK Enterprise with containers focus
- `test-incident-report-ics-remote-access.md` -> ATT&CK for ICS
- `test-incident-report-mobile-banking-trojan.md` -> ATT&CK for Mobile
