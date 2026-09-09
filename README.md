# 🚀 Project Setup & Run Instructions

Follow the steps below to run the **Lost & Found System** locally.

## 1. Frontend

Open a terminal and navigate to the frontend directory:

```bash
cd D:\lost-found-system\lost-found-system\frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## 2. Backend

Open a **new terminal** and navigate to the backend directory:

```bash
cd D:\lost-found-system\lost-found-system\backend
```

Install dependencies:

```bash
npm install
```

Start the backend server:

```bash
nodemon server.js
```

---

## 3. Python AI Image Matching

Open another **new terminal** and navigate to the AI directory:

```bash
cd D:\lost-found-system\lost-found-system\backend\ai
```

### Create Virtual Environment

If the virtual environment has not been created yet:

```bash
python -m venv venv
```

### Activate Virtual Environment

**Windows CMD:**

```bash
venv\Scripts\activate
```

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

### Install Python Dependencies

If a `requirements.txt` file is available:

```bash
pip install -r requirements.txt
```

### Run the AI Image Matching Script

```bash
python image_match.py
```

---

## 📌 Running All Services

The project requires **three separate terminals**:

| Terminal   | Service           | Command                 |
| ---------- | ----------------- | ----------------------- |
| Terminal 1 | Frontend          | `npm run dev`           |
| Terminal 2 | Backend           | `nodemon server.js`     |
| Terminal 3 | AI Image Matching | `python image_match.py` |

### ⚠️ Notes

- Make sure **Node.js** and **Python** are installed.
- Make sure all required dependencies are installed before starting the services.
- The Python virtual environment must be activated before running the AI script.
- Keep all three terminals running while using the complete application.
