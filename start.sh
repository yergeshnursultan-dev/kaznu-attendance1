#!/bin/bash
clear
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Орнатылу тексеру ────────────────────────────────────
python3 -m pip show fastapi &>/dev/null
if [ $? -ne 0 ]; then
    echo ""
    echo "  [!] Алдымен install.sh іске қосыңыз!"
    echo ""
    exit 1
fi
if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo ""
    echo "  [!] Алдымен install.sh іске қосыңыз!"
    echo ""
    exit 1
fi

echo ""
echo "  ══════════════════════════════════════════"
echo "    KazNU Smart Attendance AI"
echo "    Backend:   http://localhost:8000"
echo "    Frontend:  http://localhost:5173"
echo "  ══════════════════════════════════════════"
echo ""

# Ескі процестерді тоқтату
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1

# Backend іске қосу
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000\""
sleep 4

# Frontend іске қосу
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/frontend' && npm run dev -- --port 5173\""
sleep 6

# Браузер ашу
open "http://localhost:5173"
echo "  Жүйе іске қосылды!"
