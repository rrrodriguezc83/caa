#!/usr/bin/env bash
# Claude Code status line: git branch | model name | context usage

input=$(cat)

# Git branch (skip optional locks to avoid conflicts)
current_dir=$(echo "$input" | jq -r '.workspace.current_dir')
branch=$(git -C "$current_dir" --no-optional-locks symbolic-ref --short HEAD 2>/dev/null \
  || git -C "$current_dir" --no-optional-locks rev-parse --short HEAD 2>/dev/null)

# Model display name
model=$(echo "$input" | jq -r '.model.display_name // .model.id // "unknown"')

# Context usage percentage (pre-calculated)
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')

# Build status parts
parts=()

if [ -n "$branch" ]; then
  parts+=("$(printf '\033[32mbranch:%s\033[0m' "$branch")")
fi

parts+=("$(printf '\033[34mmodel:%s\033[0m' "$model")")

if [ -n "$used" ]; then
  used_int=$(printf '%.0f' "$used")
  if [ "$used_int" -ge 80 ]; then
    color='\033[31m'
  elif [ "$used_int" -ge 50 ]; then
    color='\033[33m'
  else
    color='\033[36m'
  fi
  parts+=("$(printf "${color}ctx:%d%%\033[0m" "$used_int")")
fi

# Join parts with separator
printf '%s' "$(IFS=' | '; echo "${parts[*]}")"
