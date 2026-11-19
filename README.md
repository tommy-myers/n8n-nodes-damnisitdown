# n8n-nodes-damnisitdown

An [n8n](https://n8n.io/) community node for [Damn Is It Down](https://damnisitdown.com/integrations), the outage tracker. Check whether a service is down, and start workflows when we confirm an outage or when it recovers.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Compatibility](#compatibility) · [Resources](#resources)

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

## Compatibility

Built with `@n8n/node-cli` for n8n 1.0 or later (n8n Nodes API version 1). The node has no runtime dependencies.

## Resources

- [Damn Is It Down integrations](https://damnisitdown.com/integrations)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- Support: support@bigtoymarket.com or [GitHub issues](https://github.com/tommy-myers/n8n-nodes-damnisitdown/issues)

## License

[MIT](LICENSE.md) © Big Toy Market LLC
