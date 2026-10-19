#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { telegramMessageInputSchema, sendTelegramMessage } from "justask-core";

const server = new McpServer({
  name: "justask-local",
  version: "0.0.0",
});

function getTelegramBotToken() {
  let token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || token.startsWith("{env:")) {
    try {
      const currentDir = dirname(fileURLToPath(import.meta.url));
      const envPath = resolve(currentDir, "../../../.env");
      if (existsSync(envPath)) {
        const content = readFileSync(envPath, "utf8");
        const match = content.match(/^TELEGRAM_BOT_TOKEN=(.*)$/m);
        if (match && match[1]) {
          token = match[1].trim().replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      // fallback if file not readable
    }
  }

  if (!token) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN is required. Configure it in your MCP client environment or .env file.",
    );
  }

  return token;
}

server.registerTool(
  "telegram",
  {
    title: "Telegram",
    description: "Send a Telegram message.",
    inputSchema: telegramMessageInputSchema.shape,
  },
  async (input) => {
    const result = await sendTelegramMessage({
      ...input,
      botToken: getTelegramBotToken(),
    });

    return {
      content: [
        {
          type: "text",
          text: `Sent Telegram message ${result.messageId} to chat ${result.chatId}`,
        },
      ],
      structuredContent: result,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
