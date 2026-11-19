# n8n-nodes-damnisitdown

An [n8n](https://n8n.io/) community node for [Damn Is It Down](https://damnisitdown.com/integrations), the outage tracker. Check whether a service is down, and start workflows when we confirm an outage or when it recovers.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Example workflows](#example-workflows) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n docs. In n8n, go to **Settings → Community nodes → Install** and enter:

```
n8n-nodes-damnisitdown
```

## Operations

**Damn Is It Down** (action node)

- **Check Status**: look up the live status of a service you pick from the list.

**Damn Is It Down Trigger** (webhook trigger)

- **Service Goes Down (Confirmed)**: runs when our checks confirm an outage.
- **Service Recovers**: runs when a confirmed outage ends.
- Watch one service, or pick **Any service we track**.

Only confirmed outages and recoveries are sent. Early warnings are not sent to integrations.

## Credentials

You need a Damn Is It Down API key. Free keys work.

1. Create a key at [damnisitdown.com/api](https://damnisitdown.com/api).
2. In n8n, add a **Damn Is It Down API** credential and paste the key.

n8n tests the key when you save the credential.

## Example workflows

Two ready-to-import workflows are in the [`examples`](https://github.com/tommy-myers/n8n-nodes-damnisitdown/tree/main/examples) folder. In n8n, open a new workflow, click **⋯ → Import from File** (or copy the JSON and paste it onto the canvas), then pick your credentials.

**Confirmed outage → Slack** ([`outage-to-slack.json`](https://github.com/tommy-myers/n8n-nodes-damnisitdown/blob/main/examples/outage-to-slack.json))

1. **Damn Is It Down Trigger**, event **Service Goes Down (Confirmed)**, service **Any service we track** (or pick one).
2. **Slack → Send Message** to `#outages`, with the text `{{ $json.message }}`, `{{ $json.summary }}` and `{{ $json.service.url }}`.

Activate the workflow. n8n registers the webhook with Damn Is It Down, and removes it when you deactivate the workflow.

The trigger outputs one item per alert:

```json
{
  "event": "down",
  "kind": "down",
  "service": { "slug": "github", "name": "GitHub", "url": "https://damnisitdown.com/status/github" },
  "level": "major",
  "title": "GitHub is down",
  "summary": "Our checks confirm the problem.",
  "message": "GitHub is down",
  "subscription_id": "…",
  "sent_at": "2026-11-19T14:00:00.000Z",
  "workaround": null,
  "eta": null
}
```

For **Service Recovers**, `event` is `recovered` and there is no `workaround` or `eta`.

**Check a service on a schedule** ([`check-status-to-slack.json`](https://github.com/tommy-myers/n8n-nodes-damnisitdown/blob/main/examples/check-status-to-slack.json))

1. **Schedule Trigger** every 15 minutes.
2. **Damn Is It Down → Check Status** for GitHub.
3. **If** `{{ $json.verdict.level }}` is not `operational`…
4. …**Slack → Send Message** with `{{ $json.verdict.title }}` and `{{ $json.verdict.summary }}`.

Check Status returns the same JSON as `GET https://damnisitdown.com/api/v1/status/<service>`, including `service`, `verdict` (`level`, `title`, `summary`) and `confidence`.

## Compatibility

Built with `@n8n/node-cli` for n8n 1.0 or later (n8n Nodes API version 1). The node has no runtime dependencies.

## Resources

- [Damn Is It Down integrations](https://damnisitdown.com/integrations)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- Support: support@bigtoymarket.com or [GitHub issues](https://github.com/tommy-myers/n8n-nodes-damnisitdown/issues)

## License

[MIT](LICENSE.md) © Big Toy Market LLC
