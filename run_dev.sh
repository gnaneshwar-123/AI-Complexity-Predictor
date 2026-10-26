#!/usr/bin/env bash
# ==============================================================================
# AI-Based Complexity Prediction Tool - Local Development Runner
# B.Tech CSE (AI/ML) Project
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_DIR="$BACKEND_DIR/venv"

echo "================================================================="
echo "   AI-Based Complexity Prediction Tool — Development Runner    "
echo "================================================================="

# 1. Verify Prerequisites
echo "[1/4] Checking environment prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "ERROR: python3 could not be found. Please install Python 3.9+."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "ERROR: node could not be found. Please install Node.js 18+."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm could not be found. Please install npm."
    exit 1
fi

echo "  ✓ Python: $(python3 --version)"
echo "  ✓ Node:   $(node -v)"
echo "  ✓ npm:    v$(npm -v)"

# 2. Setup Backend Virtual Environment
echo ""
echo "[2/4] Verifying Python backend virtual environment..."
if [ ! -d "$VENV_DIR" ]; then
    echo "  Creating virtual environment in backend/venv..."
    python3 -m venv "$VENV_DIR"
    echo "  Installing backend dependencies from requirements.txt..."
    "$VENV_DIR/bin/pip" install --upgrade pip
    "$VENV_DIR/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
else
    echo "  ✓ Backend virtual environment exists."
fi

# 3. Setup Frontend Node Modules
echo ""
echo "[3/4] Verifying Frontend dependencies..."
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "  Installing frontend packages via npm..."
    (cd "$FRONTEND_DIR" && npm install)
else
    echo "  ✓ Frontend node_modules exists."
fi

# 4. Launch Services
echo ""
echo "[4/4] Starting local development services..."
echo "-----------------------------------------------------------------"
echo "  🚀 Frontend:    http://localhost:5173"
echo "  ⚙️  Backend API:  http://localhost:8000"
echo "  📚 Swagger API: http://localhost:8000/docs"
echo "-----------------------------------------------------------------"
echo "Press CTRL+C at any time to gracefully stop all services."
echo ""

# Trap SIGINT and SIGTERM to kill child processes cleanly
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $(jobs -p) 2>/dev/null || true
    echo "All services stopped."
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start FastAPI backend
export PYTHONPATH="$PROJECT_ROOT"
"$VENV_DIR/bin/uvicorn" backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Start Vite frontend
(cd "$FRONTEND_DIR" && npx vite --host 127.0.0.1 --port 5173) &
FRONTEND_PID=$!

wait
