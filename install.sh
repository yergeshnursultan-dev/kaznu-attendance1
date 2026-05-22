#!/bin/bash
clear
echo ""
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║     KazNU Smart Attendance — Орнату              ║"
echo "  ║     Бір рет іске қосыңыз / Run once only         ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo ""

# ── Python тексеру ──────────────────────────────────────
echo "[1/5] Python тексерілуде..."
if ! command -v python3 &>/dev/null; then
    echo ""
    echo "  ҚАТЕ: Python орнатылмаған!"
    echo "  https://www.python.org/downloads/ сайтынан жүктеп алыңыз"
    echo ""
    exit 1
fi
python3 --version
echo "  [OK] Python табылды"
echo ""

# ── Node.js тексеру ─────────────────────────────────────
echo "[2/5] Node.js тексерілуде..."
if ! command -v node &>/dev/null; then
    echo ""
    echo "  ҚАТЕ: Node.js орнатылмаған!"
    echo "  https://nodejs.org сайтынан LTS нұсқасын жүктеп алыңыз"
    echo ""
    exit 1
fi
node --version
echo "  [OK] Node.js табылды"
echo ""

# ── Python библиотекалары ───────────────────────────────
echo "[3/5] Python библиотекалары орнатылуда..."
echo "  (бірінші рет 2-3 минут кетуі мүмкін)"
echo ""
python3 -m pip install --upgrade pip --quiet
python3 -m pip install fastapi uvicorn[standard] sqlalchemy opencv-python numpy Pillow python-multipart aiofiles onnxruntime --quiet
if [ $? -ne 0 ]; then
    echo "  ҚАТЕ: Python библиотекалары орнатылмады!"
    exit 1
fi
echo "  [OK] Python библиотекалары дайын"
echo ""

# ── ONNX модельдері ─────────────────────────────────────
echo "[4/5] AI модельдері тексерілуде..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$SCRIPT_DIR/backend/face_detection_yunet_2023mar.onnx" ]; then
    echo "  YuNet детектор жүктелуде..."
    python3 -c "import urllib.request; urllib.request.urlretrieve('https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx', '$SCRIPT_DIR/backend/face_detection_yunet_2023mar.onnx'); print('  [OK] YuNet')"
else
    echo "  [OK] YuNet модель бар"
fi

if [ ! -f "$SCRIPT_DIR/backend/face_recognition_sface_2021dec.onnx" ]; then
    echo "  SFace recognizer жүктелуде..."
    python3 -c "import urllib.request; urllib.request.urlretrieve('https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx', '$SCRIPT_DIR/backend/face_recognition_sface_2021dec.onnx'); print('  [OK] SFace')"
else
    echo "  [OK] SFace модель бар"
fi
echo ""

# ── npm пакеттері ───────────────────────────────────────
echo "[5/5] Frontend пакеттері орнатылуда..."
cd "$SCRIPT_DIR/frontend"
npm install --silent
if [ $? -ne 0 ]; then
    echo "  ҚАТЕ: npm install сәтсіз!"
    exit 1
fi
echo "  [OK] Frontend пакеттері дайын"
echo ""

# ── faces папкасы ───────────────────────────────────────
mkdir -p "$SCRIPT_DIR/backend/faces"

echo ""
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║  Орнату аяқталды!                                ║"
echo "  ║                                                  ║"
echo "  ║  Енді start.sh іске қосыңыз                      ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo ""
