#!/bin/bash
set -euo pipefail
# AI Tool Workflow for Bao Gia Project
# Tự động truyền context giữa các bước: Research → Plan → Build → Review

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIPELINE_DIR="$PROJECT_DIR/docs/ai-pipeline"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
SESSION_FILE="$PIPELINE_DIR/.current-session"

cd "$PROJECT_DIR"
mkdir -p "$PIPELINE_DIR"

# Session management: links research/plan/review of the same task
get_session_id() {
  if [ -f "$SESSION_FILE" ]; then
    cat "$SESSION_FILE"
  else
    echo "$TIMESTAMP"
  fi
}

start_session() {
  echo "$TIMESTAMP" > "$SESSION_FILE"
  echo "📌 New session: $TIMESTAMP"
}

SESSION_ID=$(get_session_id)

MAX_CONTEXT_LINES=300

# Pipe output to both terminal and file, stripping ANSI escape codes from the file copy
tee_clean() {
  local outfile="$1"
  tee >(sed 's/\x1b\[[0-9;]*[a-zA-Z]//g' > "$outfile")
}

get_latest_file() {
  local prefix="$1"
  # Prefer file from current session, fall back to most recent
  if [ -f "$PIPELINE_DIR/${prefix}-${SESSION_ID}.md" ]; then
    echo "$PIPELINE_DIR/${prefix}-${SESSION_ID}.md"
  else
    ls -t "$PIPELINE_DIR"/${prefix}-*.md 2>/dev/null | head -1
  fi
}

# Read file content with truncation to avoid shell ARG_MAX and token waste
read_truncated() {
  local file="$1"
  local max_lines="${2:-$MAX_CONTEXT_LINES}"
  local total_lines
  total_lines=$(wc -l < "$file")
  if [ "$total_lines" -gt "$max_lines" ]; then
    echo "$(head -n "$max_lines" "$file")"
    echo ""
    echo "[... truncated: showing $max_lines of $total_lines lines ...]"
  else
    cat "$file"
  fi
}

show_pipeline_status() {
  echo ""
  echo "📂 Pipeline files (docs/ai-pipeline/):"
  if [ -f "$SESSION_FILE" ]; then
    echo "  📌 Session: $(cat "$SESSION_FILE")"
  else
    echo "  📌 Session: none (next research will start one)"
  fi
  local research=$(get_latest_file "research")
  local plan=$(get_latest_file "plan")
  local review=$(get_latest_file "review")
  [ -n "$research" ] && echo "  📄 Research: $(basename "$research")" || echo "  ⬜ Research: none"
  [ -n "$plan" ]     && echo "  📄 Plan:     $(basename "$plan")"     || echo "  ⬜ Plan: none"
  [ -n "$review" ]   && echo "  📄 Review:   $(basename "$review")"   || echo "  ⬜ Review: none"
  echo ""
}

case "$1" in
  research|r)
    shift
    start_session
    SESSION_ID="$TIMESTAMP"
    OUTFILE="$PIPELINE_DIR/research-${SESSION_ID}.md"
    PROMPT="$*"

    echo "🔍 Gemini (Researcher) — Research & Free Tasks"
    echo "==============================================="
    echo "📄 Output → $OUTFILE"
    echo ""

    if ! command -v gemini &> /dev/null; then
      echo "Gemini CLI not installed. Install: npm install -g @google/gemini-cli"
      echo ""
      echo "Fallback: Running with Claude instead..."
      claude -p <<EOF | tee_clean "$OUTFILE"
You are acting as a RESEARCHER. Research the following topic and save your findings.
After research, write a summary in markdown to the file: $OUTFILE

Topic: $PROMPT
EOF
    else
      gemini <<EOF
Research the following topic. Write a comprehensive summary in markdown.
Save your findings to: $OUTFILE

Topic: $PROMPT
EOF
    fi

    echo ""
    echo "✅ Research saved → $OUTFILE"
    ;;

  plan|p)
    shift
    OUTFILE="$PIPELINE_DIR/plan-${SESSION_ID}.md"
    PROMPT="$*"
    LATEST_RESEARCH=$(get_latest_file "research")

    echo "🧠 Claude Code (Architect) — Planning & Analysis"
    echo "================================================="
    echo "📄 Output → $OUTFILE"

    CONTEXT=""
    if [ -n "$LATEST_RESEARCH" ]; then
      echo "📎 Attaching research → $(basename "$LATEST_RESEARCH")"
      CONTEXT="

## Reference: Research findings
$(read_truncated "$LATEST_RESEARCH")
"
    fi

    claude -p <<EOF | tee_clean "$OUTFILE"
You are acting as an ARCHITECT. Analyze and create a detailed implementation plan.

## Task
$PROMPT
$CONTEXT

## Instructions
1. Analyze the requirement thoroughly
2. Design the architecture (entities, APIs, components)
3. Break down into specific implementation steps
4. Identify edge cases and risks
5. Write the complete plan to: $OUTFILE

The plan should be detailed enough for another AI (Codex) to implement without further questions.
Format: Markdown with clear sections, code snippets for schemas/interfaces, and step-by-step tasks.
EOF

    echo ""
    echo "✅ Plan saved → $OUTFILE"
    echo ""
    echo "Next step: ./ai-workflow.sh build \"implement the plan\""
    ;;

  build|b)
    shift
    PROMPT="$*"
    LATEST_PLAN=$(get_latest_file "plan")

    echo "🔨 Codex (Builder) — Code Implementation"
    echo "========================================="

    if ! command -v codex &> /dev/null; then
      echo "Codex CLI not installed. Install: npm install -g @openai/codex"
      exit 1
    fi

    if [ -n "$LATEST_PLAN" ]; then
      echo "📎 Attaching plan → $(basename "$LATEST_PLAN")"
      codex <<EOF
Implement the code according to this plan:

--- START PLAN ---
$(read_truncated "$LATEST_PLAN")
--- END PLAN ---

Additional instructions: $PROMPT

Follow the plan step by step. Create all files mentioned. Follow existing codebase patterns.
EOF
    else
      echo "⚠️  No plan found. Running Codex with your prompt directly."
      codex <<EOF
$PROMPT
EOF
    fi

    echo ""
    echo "✅ Build complete"
    echo "Next step: ./ai-workflow.sh review"
    ;;

  edit|e)
    shift
    echo "✏️  Cursor (Workbench) — Opening in Cursor Editor"
    echo "================================================="
    if command -v cursor &> /dev/null; then
      cursor "$PROJECT_DIR" "$@"
    else
      echo "Cursor CLI not installed. Open Cursor > Cmd+Shift+P > 'Install cursor command'"
      exit 1
    fi
    ;;

  review|rv)
    shift
    OUTFILE="$PIPELINE_DIR/review-${SESSION_ID}.md"
    LATEST_PLAN=$(get_latest_file "plan")

    echo "🔍 Claude Code (Review) — Code Review"
    echo "======================================="
    echo "📄 Output → $OUTFILE"

    DIFF=$(git diff --stat 2>/dev/null)
    DIFF_DETAIL=$(git diff 2>/dev/null | head -c 50000)
    UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null)

    PLAN_REF=""
    if [ -n "$LATEST_PLAN" ]; then
      echo "📎 Comparing against plan → $(basename "$LATEST_PLAN")"
      PLAN_REF="
## Original Plan
$(read_truncated "$LATEST_PLAN")
"
    fi

    claude -p <<EOF | tee_clean "$OUTFILE"
You are acting as a CODE REVIEWER. Review all recent changes thoroughly.
$PLAN_REF

## Changes Summary
$DIFF

## New/Untracked Files
$UNTRACKED

## Diff Detail (first ~50KB)
$DIFF_DETAIL

## Review Checklist
1. Does the implementation match the plan?
2. Any bugs, security issues, or edge cases?
3. Code quality: naming, structure, patterns
4. Missing error handling?
5. Missing tests?
6. Performance concerns?

Write your review to: $OUTFILE
Format: Markdown with sections for each concern, severity levels (🔴 critical, 🟡 warning, 🟢 good).
$*
EOF

    echo ""
    echo "✅ Review saved → $OUTFILE"
    ;;

  pipeline|pl)
    echo "📊 Pipeline Status"
    echo "==================="
    show_pipeline_status

    echo "Recent pipeline files:"
    ls -lt "$PIPELINE_DIR"/*.md 2>/dev/null | head -10 | while read -r line; do
      echo "  $line"
    done
    if [ ! "$(ls -A "$PIPELINE_DIR" 2>/dev/null)" ]; then
      echo "  (empty — start with: ./ai-workflow.sh research \"...\")"
    fi
    ;;

  clean|c)
    echo "🧹 Clean pipeline files"
    echo "========================"
    if [ "$(ls -A "$PIPELINE_DIR" 2>/dev/null)" ]; then
      echo "Files to remove:"
      ls "$PIPELINE_DIR"/*.md 2>/dev/null
      echo ""
      read -p "Delete all pipeline files? (y/N): " confirm
      if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        rm -f "$PIPELINE_DIR"/*.md "$SESSION_FILE"
        echo "✅ Cleaned (session reset)"
      else
        echo "Cancelled"
      fi
    else
      echo "Pipeline is already clean."
    fi
    ;;

  status|s)
    echo "📊 AI Tools Status"
    echo "==================="
    echo ""
    printf "%-20s %s\n" "Tool" "Status"
    printf "%-20s %s\n" "----" "------"

    if command -v claude &> /dev/null; then
      printf "%-20s ✅ %s\n" "Claude Code CLI" "$(claude --version 2>/dev/null)"
    else
      printf "%-20s ❌ Not installed\n" "Claude Code CLI"
    fi

    if command -v codex &> /dev/null; then
      printf "%-20s ✅ %s\n" "Codex CLI" "$(codex --version 2>/dev/null)"
    else
      printf "%-20s ❌ Not installed\n" "Codex CLI"
    fi

    if command -v gemini &> /dev/null; then
      printf "%-20s ✅ %s\n" "Gemini CLI" "$(gemini --version 2>/dev/null)"
    else
      printf "%-20s ❌ Not installed\n" "Gemini CLI"
    fi

    if command -v cursor &> /dev/null; then
      printf "%-20s ✅ Available\n" "Cursor CLI"
    else
      printf "%-20s ❌ Not installed\n" "Cursor CLI"
    fi

    show_pipeline_status

    echo "Config files:"
    for f in CLAUDE.md AGENTS.md GEMINI.md .cursor/rules/project.mdc; do
      if [ -f "$PROJECT_DIR/$f" ]; then
        printf "  ✅ %s\n" "$f"
      else
        printf "  ❌ %s (missing)\n" "$f"
      fi
    done
    ;;

  *)
    echo "AI Workflow for Bao Gia"
    echo "========================"
    echo ""
    echo "Usage: ./ai-workflow.sh <command> [args...]"
    echo ""
    echo "Commands:"
    echo "  research, r   — Gemini: Research topic, save to pipeline"
    echo "  plan,     p   — Claude: Create plan (auto-reads research)"
    echo "  build,    b   — Codex: Implement code (auto-reads plan)"
    echo "  edit,     e   — Cursor: Open in editor for quick edits"
    echo "  review,   rv  — Claude: Review changes (auto-reads plan + git diff)"
    echo "  pipeline, pl  — Show pipeline files status"
    echo "  clean,    c   — Clean pipeline files for new task"
    echo "  status,   s   — Show installed tools & pipeline status"
    echo ""
    echo "Workflow (auto-connected pipeline):"
    echo ""
    echo "  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐"
    echo "  │ research  │───▶│  plan    │───▶│  build   │───▶│  review  │"
    echo "  │ (Gemini)  │    │ (Claude) │    │ (Codex)  │    │ (Claude) │"
    echo "  └──────────┘    └──────────┘    └──────────┘    └──────────┘"
    echo "    saves to        reads research   reads plan     reads plan"
    echo "    research.md     saves plan.md    implements     + git diff"
    echo ""
    echo "  All files stored in: docs/ai-pipeline/"
    echo ""
    echo "Example:"
    echo "  ./ai-workflow.sh research 'best PDF lib for NestJS'"
    echo "  ./ai-workflow.sh plan 'add PDF export for quotations'"
    echo "  ./ai-workflow.sh build"
    echo "  ./ai-workflow.sh review"
    echo "  ./ai-workflow.sh clean  # reset for next task"
    ;;
esac
