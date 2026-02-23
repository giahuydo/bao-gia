#!/bin/bash
# =============================================================
# Telegram Message Sender for Bao Gia
# Usage: ./telegram-send.sh "<message>" [parse_mode]
# parse_mode: MarkdownV2 (default), HTML
# =============================================================

set -euo pipefail

MESSAGE="${1:-}"
PARSE_MODE="${2:-MarkdownV2}"

if [ -z "$MESSAGE" ]; then
  echo "Error: Message is required"
  echo "Usage: $0 \"<message>\" [MarkdownV2|HTML]"
  exit 1
fi

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  echo "Error: TELEGRAM_BOT_TOKEN not set. Add it to .claude/.env"
  exit 1
fi

if [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "Error: TELEGRAM_CHAT_ID not set. Add it to .claude/.env"
  exit 1
fi

API_URL="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg chat_id "$TELEGRAM_CHAT_ID" \
    --arg text "$MESSAGE" \
    --arg parse_mode "$PARSE_MODE" \
    '{chat_id: $chat_id, text: $text, parse_mode: $parse_mode, disable_web_page_preview: true}'
  )")

OK=$(echo "$RESPONSE" | jq -r '.ok')

if [ "$OK" = "true" ]; then
  MSG_ID=$(echo "$RESPONSE" | jq -r '.result.message_id')
  echo "Sent successfully (message_id: $MSG_ID)"
else
  ERROR=$(echo "$RESPONSE" | jq -r '.description // "Unknown error"')
  echo "Failed: $ERROR"

  # Retry without parse_mode if formatting error
  if echo "$ERROR" | grep -qi "parse"; then
    echo "Retrying without formatting..."
    RESPONSE=$(curl -s -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -d "$(jq -n \
        --arg chat_id "$TELEGRAM_CHAT_ID" \
        --arg text "$MESSAGE" \
        '{chat_id: $chat_id, text: $text, disable_web_page_preview: true}'
      )")
    OK=$(echo "$RESPONSE" | jq -r '.ok')
    if [ "$OK" = "true" ]; then
      MSG_ID=$(echo "$RESPONSE" | jq -r '.result.message_id')
      echo "Sent successfully without formatting (message_id: $MSG_ID)"
    else
      echo "Retry also failed: $(echo "$RESPONSE" | jq -r '.description')"
      exit 1
    fi
  else
    exit 1
  fi
fi
