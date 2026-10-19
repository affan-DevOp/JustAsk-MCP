---
name: justask
description: Send Telegram messages from an agent through the JustAsk MCP `telegram` tool, with the JustAsk CLI (`justask`) as a fallback. Use when a user asks to send a Telegram message, mentions JustAsk, wants to interact with the JustAsk toolset, asks to verify JustAsk manually, or needs to choose between the JustAsk MCP and CLI workflows.
---

# JustAsk

JustAsk sends Telegram messages. It exposes the same operation two ways, both backed by `justask-core`:

- **MCP tool** (`justask` server → `telegram` tool) — preferred for agents.
- **CLI** (`justask`, binary `justask`) — fallback when MCP is unavailable or for manual verification.

Both take a `chatId` and a `message`, call the Telegram Bot API, and return `{ ok: true, chatId, messageId }`.

## Choosing MCP vs CLI

Prefer the **MCP tool** whenever the `justask` MCP server is connected — it needs no shell and the bot token is supplied by the MCP client environment.

Use the **CLI** when:
- The MCP server is not connected in this session.
- Verifying behavior manually or from a script / terminal.
- A local bot token (not the MCP env token) should be used.

## MCP workflow (preferred)

Call the `telegram` tool on the `justask` MCP server with:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `chatId` | string | yes | Telegram chat ID (non-empty) |
| `message` | string | yes | Message text (non-empty) |

The bot token is read from `TELEGRAM_BOT_TOKEN` in the MCP server environment (see `.env` or client config) — do not pass it in the tool input. On success the tool returns `{ ok: true, chatId, messageId }`.

## CLI workflow (fallback)

First-time setup writes a token to `~/.config/justask/config.json` (mode `0600`):

```bash
justask init --telegram-bot-token <botToken>
```

Send a message:

```bash
justask telegram <chatId> <message>
```

On success it prints the JSON result, e.g. `{"ok":true,"chatId":"123","messageId":42}`. If no token is configured it errors with `Telegram bot token is required. Run \`justask init\`.`

Run the CLI directly or via `bun run dev:cli telegram <chatId> <message>` or `node packages/cli/dist/index.js telegram <chatId> <message>`.

## Verifying manually

To confirm JustAsk works end to end, send a test message to a known chat ID and check the response includes `ok: true` and a numeric `messageId`. Use the CLI for this so the result JSON is visible in the terminal:

```bash
justask telegram <yourChatId> "JustAsk test message"
```

A non-`ok` response or a thrown error surfaces the Telegram API `description` (e.g. invalid token, unknown chat ID).
