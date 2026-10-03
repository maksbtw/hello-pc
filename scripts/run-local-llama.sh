#!/usr/bin/env bash
set -euo pipefail

case "${1:-8b}" in
  8b)
    model="$HOME/.local/share/llama.cpp/models/Qwen3-8B-Q4_K_M.gguf"
    ;;
  small)
    model="$HOME/.local/share/llama.cpp/models/Qwen3-0.6B-Q8_0.gguf"
    ;;
  *)
    echo "Usage: $0 [8b|small]" >&2
    exit 2
    ;;
esac

if [[ ! -f "$model" ]]; then
  echo "Model not found: $model" >&2
  exit 1
fi

exec "$HOME/.local/bin/llama-server" \
  -m "$model" \
  --n-gpu-layers auto -c 2048 \
  --host 127.0.0.1 --port 8081
