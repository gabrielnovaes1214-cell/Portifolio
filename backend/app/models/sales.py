from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database.connection import Base

class AnalyticsSales(Base):
    """
    Tabela analítica simplificada para a V1 focada em BI/Dashboard.
    Contém as colunas estritamente necessárias das vendas.
    """
    __tablename__ = "analytics_sales"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, index=True)
    order_date = Column(DateTime)
    customer_state = Column(String)
    product_category = Column(String)
    price = Column(Float)
