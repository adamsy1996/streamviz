# StreamViz Agent

The local agent runtime for StreamViz. It uses Mastra, DeepSeek, persistent local
LibSQL storage, and the StreamViz visualization tools.

## Local development

Create `apps/agent/.env` from `.env.example`, then run from the repository root:

```bash
npm run agent:mastra:dev
```

Mastra Studio and the agent API are served at `http://localhost:4111`. Sessions,
memory, and traces are stored in `apps/agent/.mastra/streamviz.db` and are not
committed to Git.

The native Mastra agent API is available from the same server. Local storage can
be replaced with a PostgreSQL-backed Mastra storage adapter when the service is
deployed. An AG-UI adapter can be added at the web boundary without changing the
agent implementation.

## Web Playground

The Next.js Playground proxies Mastra's native SSE stream through `/api/agent`,
so model credentials and the Mastra service URL remain server-side. The local
defaults work without additional configuration. Its session sidebar uses the
same Mastra Memory threads for listing, restoring, renaming, and deleting
conversations; no separate browser-only chat store is involved. Deployment can
override:

```bash
MASTRA_AGENT_URL=http://127.0.0.1:4111
MASTRA_AGENT_ID=streamviz-agent
MASTRA_RESOURCE_ID=local-user
```
