# 📊 Sales Intelligence App

A full-stack portfolio project for analytics and visualization of the **Brazilian E-Commerce (Olist) dataset**.

Upload four CSV files from the Olist dataset, trigger an automated ETL pipeline, and explore the resulting metrics through an interactive dashboard — all locally, with no cloud dependencies.

---

## ✨ Features

- **CSV Upload** — single-form upload of 4 Olist datasets with client-side validation
- **ETL Pipeline** — automatic data cleaning, join of datasets, and persistence to SQLite
- **Summary Cards** — total revenue and order count at a glance
- **Monthly Revenue Chart** — line chart of revenue over time
- **Revenue by State** — horizontal bar chart for top 10 Brazilian states
- **Top 5 Categories** — horizontal bar chart of highest-grossing product categories
- **Loading & Error States** — visual feedback throughout upload and data fetching
- **Responsive Layout** — clean, mobile-friendly single-page dashboard

---

## 🗂️ Project Structure

```
sales-intelligence-app/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py           # App entrypoint, CORS, router registration
│   │   ├── routes/
│   │   │   ├── upload.py     # POST /api/upload
│   │   │   └── metrics.py    # GET /api/metrics/*
│   │   ├── etl/
│   │   │   └── processor.py  # ETL: read CSVs, join, clean, persist
│   │   ├── models/
│   │   │   └── sales.py      # SQLAlchemy ORM model (AnalyticsSales)
│   │   ├── services/
│   │   │   └── metrics_service.py  # Aggregation queries
│   │   └── database/
│   │       └── connection.py # SQLite engine & session factory
│   ├── data/raw/             # Uploaded CSV files (auto-created)
│   ├── requirements.txt
│   └── sales_intelligence.db # SQLite database (auto-created)
│
└── frontend/                 # React + Vite application
    ├── src/
    │   ├── services/
    │   │   └── api.js        # Axios client (centralized base URL)
    │   ├── components/
    │   │   ├── UploadForm.jsx    # Upload UI + form submit logic
    │   │   ├── StatCard.jsx      # Reusable metric card
    │   │   └── DashboardCharts.jsx  # Recharts: line + bar charts
    │   ├── App.jsx           # Orchestrator: state, fetch, layout
    │   ├── App.css           # Component styles & design system
    │   ├── index.css         # Global reset, CSS variables, typography
    │   └── main.jsx          # ReactDOM entrypoint
    ├── .env.example          # Environment variable template
    └── package.json
```

---

## 🧱 Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI |
| Data processing | Pandas |
| Database | SQLite via SQLAlchemy |
| Frontend | React 19 + Vite |
| HTTP client | Axios |
| Charts | Recharts |
| Icons | Lucide React |

---

## 🔄 Data Flow

```
User selects 4 CSV files
        ↓
UploadForm.jsx → POST /api/upload (multipart/form-data)
        ↓
upload.py saves files to /data/raw/
        ↓
etl/processor.py reads CSVs with Pandas
  → joins orders + customers + order_items + products
  → filters only "delivered" orders
  → drops rows with null price or date
  → persists to SQLite (table: analytics_sales)
        ↓
Frontend calls GET /api/metrics/* endpoints
        ↓
metrics_service.py aggregates data via SQLAlchemy
        ↓
Dashboard renders cards + charts
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload 4 CSV files, trigger ETL pipeline |
| `GET` | `/api/metrics/summary` | Total revenue and order count |
| `GET` | `/api/metrics/sales-by-month` | Revenue aggregated by month (`YYYY-MM`) |
| `GET` | `/api/metrics/sales-by-state` | Revenue by Brazilian state |
| `GET` | `/api/metrics/top-categories` | Top 5 revenue-generating product categories |

---

## 🗂️ Required Olist Files

Download the dataset from [Kaggle — Brazilian E-Commerce by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce).

You need these 4 files:

| Upload Field | Expected File |
|---|---|
| **Orders Dataset** | `olist_orders_dataset.csv` |
| **Customers Dataset** | `olist_customers_dataset.csv` |
| **Order Items Dataset** | `olist_order_items_dataset.csv` |
| **Products Dataset** | `olist_products_dataset.csv` |

---

## 🚀 Running Locally

### Backend

```bash
# From the project root:
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

Backend will be available at **`http://localhost:8000`**.  
Interactive API docs at **`http://localhost:8000/docs`**.

---

### Frontend

```bash
# From the project root:
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend will be available at **`http://localhost:5173`**.

---

## ⚙️ Environment Variables (Frontend)

Copy `frontend/.env.example` to `frontend/.env` if you need to point to a different backend URL:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | Backend base URL |

If running the backend on the default port, no configuration is needed.

---

## 🔮 Possible Future Improvements

- **Authentication** — protect upload and metrics endpoints with API key or JWT
- **Date Range Filter** — allow filtering charts by a custom date period
- **Additional Datasets** — integrate sellers, reviews, and geolocation data
- **Export** — download charts as PNG or metrics as CSV
- **Persistent Upload History** — track previously uploaded datasets with timestamps
- **Deployment** — containerize with Docker and deploy backend to Railway/Render, frontend to Vercel/Netlify
- **Unit Tests** — add pytest coverage for ETL and metrics service functions

---

## 📄 License

MIT
