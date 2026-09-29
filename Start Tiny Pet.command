#!/bin/bash
cd "$(dirname "$0")"
command -v npm >/dev/null 2>&1 || { echo "Node.js/npm is required."; read -p "Press Enter to close..."; exit 1; }
[ -d node_modules ] || npm install
npm start
