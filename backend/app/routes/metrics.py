from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services import metrics_service

router = APIRouter()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    """Retorna os grandes números: receita total e número de pedidos."""
    return metrics_service.get_summary_metrics(db)

@router.get("/sales-by-month")
def get_sales_by_month(db: Session = Depends(get_db)):
    """Retorna a receita agregada por mês."""
    return metrics_service.get_sales_by_month(db)

@router.get("/sales-by-state")
def get_sales_by_state(db: Session = Depends(get_db)):
    """Retorna a receita agregada por estado."""
    return metrics_service.get_sales_by_state(db)

@router.get("/top-categories")
def get_top_categories(db: Session = Depends(get_db)):
    """Retorna as top 5 categorias mais vendidas geradoras de receita."""
    return metrics_service.get_top_categories(db)
