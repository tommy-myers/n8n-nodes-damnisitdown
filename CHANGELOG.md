# Changelog

## 0.1.3

- Service list no longer shows "Error fetching options" when you add a node and a credential is already saved. The list loads when you open it (after the credential is attached), and you can enter a slug like `github` without using an expression. Option values use the service slug. Existing workflows that stored the service as a string still work.


## 0.1.2

- README: example workflows and the trigger output format.
- Added importable examples: `examples/outage-to-slack.json` (confirmed outage to Slack) and `examples/check-status-to-slack.json` (scheduled status check to Slack). No code changes.

## 0.1.1

- Published from GitHub Actions with npm provenance (trusted publishing). No functional changes.

## 0.1.0

- First release: **Damn Is It Down** node (Check Status) and **Damn Is It Down Trigger** (confirmed outage, recovery).
