# Test Incident Report: Kubernetes Cluster Abuse and Cryptominer Deployment

## Summary

On 2026-01-22, defenders identified abnormal CPU saturation in namespace `payments-prod` inside the Kubernetes cluster `east-k8s-02`. Investigation showed that an exposed dashboard endpoint at `hxxps://k8s-console-admin[.]example-help[.]net/#/login` accepted reused credentials for service account `cluster-admin-viewer`. Shortly after login, an actor created a pod named `debug-runner-7f9c` on node `worker-03`.

The pod image was pulled from `registry-cache[.]support-images[.]com/ops/alpine-debug:3.19`, then executed a curl command to download a shell script from `hxxp://198.54.117.89/bootstrap.sh`. The script deployed a miner binary to `/tmp/kdevtmpfsi`, modified `/etc/cron.d/sys-updater`, and contacted mining pool endpoints `pool.supportxmr[.]net` and `cdn-support-miner[.]org`.

Container logs include requests to:

- `hxxp://198.54.117.89/bootstrap.sh`
- `stratum+tcp://pool.supportxmr[.]net:3333`
- `stratum+tcp://cdn-support-miner[.]org:5555`

Host telemetry on `worker-03` also captured the file `/var/lib/kubelet/pods/3d1f2d88/volumes/kubernetes.io~empty-dir/cache/kdevtmpfsi` with SHA-256 `4f3c8d7d5b4f6a1e4273c9d0a9e6b2de19a0f8dc2f1a0a3bde4f55d7b1b2c3d4`.

The miner used user-agent `curl/8.5.0` for initial staging. Egress logs show communications to `198.54.117.89`, `45.9.148.201`, and IPv6 `2a03:94e0:ffff::201`.

## Timeline

- 2026-01-22 10:04 UTC: successful login to exposed Kubernetes dashboard
- 2026-01-22 10:06 UTC: pod `debug-runner-7f9c` created in `payments-prod`
- 2026-01-22 10:07 UTC: `bootstrap.sh` downloaded from `198.54.117.89`
- 2026-01-22 10:09 UTC: mining traffic began to `pool.supportxmr.net`
- 2026-01-22 10:14 UTC: detection triggered on anomalous resource consumption

## Extractable IOCs

- Domain: `k8s-console-admin.example-help.net`
- Domain: `registry-cache.support-images.com`
- Domain: `pool.supportxmr.net`
- Domain: `cdn-support-miner.org`
- URL: `https://k8s-console-admin.example-help.net/#/login`
- URL: `http://198.54.117.89/bootstrap.sh`
- IPv4: `198.54.117.89`
- IPv4: `45.9.148.201`
- IPv6: `2a03:94e0:ffff::201`
- SHA-256: `4f3c8d7d5b4f6a1e4273c9d0a9e6b2de19a0f8dc2f1a0a3bde4f55d7b1b2c3d4`
- File path: `/tmp/kdevtmpfsi`
- File path: `/etc/cron.d/sys-updater`
- File path: `/var/lib/kubelet/pods/3d1f2d88/volumes/kubernetes.io~empty-dir/cache/kdevtmpfsi`
- User-Agent: `curl/8.5.0`

## Recommended ATT&CK Mapping

- Matrix: ATT&CK Enterprise with Containers platform focus
- Likely tactics: Initial Access, Execution, Persistence, Resource Development, Command and Control
- Likely techniques:
  - `T1078` Valid Accounts
  - `T1609` Container Administration Command
  - `T1610` Deploy Container
  - `T1105` Ingress Tool Transfer
  - `T1053.003` Cron
  - `T1496` Resource Hijacking
  - `T1071` Application Layer Protocol
