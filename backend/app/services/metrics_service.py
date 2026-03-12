from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.sales import AnalyticsSales

def get_summary_metrics(db: Session):
    total_revenue = db.query(func.sum(AnalyticsSales.price)).scalar() or 0.0
    total_orders = db.query(func.count(func.distinct(AnalyticsSales.order_id))).scalar() or 0
    
    return {
        "revenue": round(total_revenue, 2),
        "orders": total_orders
    }

def get_sales_by_month(db: Session):
    # No SQLite, extraímos mês e ano via strftime
    query = db.query(
        func.strftime('%Y-%m', AnalyticsSales.order_date).label('month'),
        func.sum(AnalyticsSales.price).label('revenue')
    ).group_by('month').order_by('month').all()
    
    # Formata a resposta para facilitar no Recharts (ex: [{name: '2026-03', value: 100}])
    return [{"month": row.month, "revenue": round(row.revenue, 2)} for row in query if row.month]

def get_sales_by_state(db: Session):
    query = db.query(
        AnalyticsSales.customer_state,
        func.sum(AnalyticsSales.price).label('revenue')
    ).group_by(AnalyticsSales.customer_state).order_by(func.sum(AnalyticsSales.price).desc()).all()
    
    return [{"state": row.customer_state, "revenue": round(row.revenue, 2)} for row in query]

def get_top_categories(db: Session):
    query = db.query(
        AnalyticsSales.product_category,
        func.sum(AnalyticsSales.price).label('revenue')
    ).group_by(AnalyticsSales.product_category).order_by(func.sum(AnalyticsSales.price).desc()).limit(5).all()
    
    return [{"category": row.product_category, "revenue": round(row.revenue, 2)} for row in query]
