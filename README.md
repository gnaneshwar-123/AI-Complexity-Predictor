# AI-Based Complexity Prediction Tool

An intelligent, locally-hosted web application and developer tool that analyzes source code and predicts algorithmic time and auxiliary space complexity ($O(1), O(\log n), O(n), O(n \log n), O(n^2), O(n^3), O(2^n)$). 

Developed as a **B.Tech CSE (AI/ML)** engineering project combining **Abstract Syntax Tree (AST) static analysis**, recurrence relation solvers, and a modern developer interface.

---

## 1. Project Overview & Methodology

### The Problem
Traditional complexity estimation relies on runtime execution and benchmarking. However, runtime execution:
1. Poses severe security risks when running untrusted user-submitted code.
2. Yields noisy, hardware-dependent, and input-distribution-biased results.
3. Cannot formally distinguish auxiliary memory from total allocated memory.

### The Solution: Multi-Language Static Complexity Analysis & Automatic Language Detection
This application features an **Automatic Language Detection Engine** supporting:
- **Python** (`.py`)
- **C** (`.c`)
- **C++** (`.cpp`)
- **Java** (`.java`)
- **JavaScript** (`.js`)

Whenever code is pasted into the Monaco Editor:
- The system **automatically detects the programming language** and switches syntax highlighting in real-time.
- The analysis engine traverses syntactic structures (loops, nesting levels, recursion trees, memory allocations) without executing code.
- Accurately estimates asymptotic upper bounds ($O(1), O(\log n), O(n), O(n \log n), O(n^2), O(n^3), O(2^n)$) and auxiliary space across all 5 supported languages.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5 (with reverse proxy to FastAPI backend)
- **Styling:** Tailwind CSS (Dark-mode developer aesthetic)
- **Code Editor:** Monaco Editor (`@monaco-editor/react`) with syntax highlighting
- **Visualizations:** Recharts (Theoretical asymptotic growth curves vs problem size $N$)
- **Icons:** Lucide React

### Backend
- **Web Framework:** FastAPI (Asynchronous, OpenAPI/Swagger interactive documentation)
- **ASGI Server:** Uvicorn
- **Static Parser:** Python `ast` module (safe AST walking, zero code execution)
- **Data Validation:** Pydantic V2 schemas
- **Testing:** pytest & httpx TestClient

---

## 3. Localhost Execution & Setup

The application is completely self-contained and runs 100% locally on your machine with zero external paid APIs.

### Prerequisites (macOS / Linux)
1. **Python 3.9+** (Check with `python3 --version`)
2. **Node.js 18+** (Check with `node -v`)
3. **npm** (Check with `npm -v`)

---

### Option A: Quick Start (Single Script)

A single developer runner script is included at the project root:

```bash
chmod +x run_dev.sh
./run_dev.sh
```

This script automatically:
1. Validates prerequisites (`python3`, `node`, `npm`).
2. Creates the Python virtual environment in `backend/venv/` and installs dependencies if missing.
3. Installs frontend packages in `frontend/node_modules/` if missing.
4. Concurrently boots the FastAPI backend on port `8000` and the Vite frontend on port `5173`.
5. Gracefully handles `CTRL+C` to terminate both processes cleanly.

---

### Option B: Manual Step-by-Step Launch

If you prefer running the backend and frontend in separate terminal windows:

#### Terminal 1: Backend API (FastAPI)
```bash
# 1. Navigate to project root
cd "/Users/leela/Documents/Complexity prediction tool"

# 2. Create and activate virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate

# 3. Install backend dependencies
pip install -r backend/requirements.txt

# 4. Start the FastAPI development server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Terminal 2: Frontend (React + Vite)
```bash
# 1. Navigate to the frontend directory
cd "/Users/leela/Documents/Complexity prediction tool/frontend"

# 2. Install dependencies
npm install

# 3. Start the Vite dev server
npm run dev
```

---

## 4. Local Development URLs

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API Root:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 5. Automated Test Suite

A comprehensive test suite with **34 automated pytest tests** verifies parser robustness, asymptotic bounds, and API behavior.

### Running Backend Tests
```bash
# From the project root with the virtualenv active:
backend/venv/bin/pytest -v
```

### Test Coverage Highlights
- `test_constant_time.py`: Arithmetic, indexing, constant-bound loops ($O(1)$).
- `test_linear_time.py`: `for` in `range(n)`, iteration over collections, sequential loops ($O(n) + O(n) = O(n)$), linear while loops.
- `test_nested_loops.py`: Nested loops ($O(n^2)$), triangular dependent loops ($O(n^2)$), constant inner loops ($O(n)$), triple nested loops ($O(n^3)$), linearithmic loops ($O(n \log n)$).
- `test_logarithmic.py`: Binary search, repeated halving `n //= 2`, repeated doubling `i *= 2`.
- `test_recursion.py`: Factorial linear recursion ($O(n)$ time & space), Merge Sort divide-and-conquer ($O(n \log n)$), Naive Fibonacci tree recursion ($O(2^n)$).
- `test_space_complexity.py`: In-place operations ($O(1)$), list comprehensions ($O(n)$), 2D matrix allocations ($O(n^2)$), array slicing copies ($O(n)$).
- `test_edge_cases.py`: Syntax errors, empty input, comment-only snippets, oversized input guard (>50,000 characters).
- `test_api.py`: FastAPI endpoints (`/api/health`, `/api/examples`, `/api/analyze`, `/api/compare`), input validation, and HTTP error handling.

---

## 6. API Endpoints Reference

### `GET /api/health`
Checks backend engine status, uptime, and version.

### `GET /api/examples`
Returns pre-configured canonical algorithms across various complexity classes (Binary Search, Merge Sort, Bubble Sort, Fibonacci, Matrix Multiplication, Two Sum).

### `POST /api/analyze`
Accepts:
```json
{
  "code": "def search(arr, target):\n    for x in arr:\n        if x == target:\n            return True\n    return False",
  "function_name": null
}
```
Returns:
- `time_complexity`: e.g. `"O(n)"`
- `space_complexity`: e.g. `"O(1)"`
- `confidence`: `"High" | "Medium" | "Low" | "Inconclusive"`
- `confidence_reason`: Documented justification
- `dominant_term`: Primary bottleneck structure
- `detected_loops`: Hierarchy, bounds, step descriptions
- `detected_recursion`: Recurrence relations and stack depths
- `space_allocations`: Dynamic memory and call stack allocations
- `step_by_step_reasoning`: Pedagogical step breakdown
- `assumptions`: Theoretical conditions assumed
- `limitations`: Static analysis constraints
- `optimization_suggestions`: Actionable improvements

### `POST /api/compare`
Compares 2 to 5 code snippets, returning matrix breakdown, relative scalability rankings, and comparative narrative.

---

## 7. Machine Learning Engineering Justification

As part of the **B.Tech CSE (AI/ML)** curriculum, this project intentionally distinguishes between **deterministic static AST parsing** and **probabilistic machine learning models**:
1. **Explainability & Guarantees:** Algorithmic complexity is a formal mathematical property. Unverified ML classifiers often hallucinate complexity classes on novel code structures.
2. **Deterministic Baseline:** The rule-based AST engine serves as a mathematically sound ground-truth pipeline.
3. **Decoupled Architecture for ML Integration:** The backend architecture exposes clean interfaces (`backend.analyzer.complexity_classifier`) allowing seamless plug-in of future scikit-learn or transformer models once trained on a verified, labeled code dataset.

---

## 8. License & Academic Integrity
Built for educational and research purposes. All source code is locally executed without transmitting user code to third-party services.
