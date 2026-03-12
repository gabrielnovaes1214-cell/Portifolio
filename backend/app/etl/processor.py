import pandas as pd
from sqlalchemy.orm import Session
from app.models.sales import AnalyticsSales
from typing import Dict, Tuple

def read_csv_robust(file_path: str) -> pd.DataFrame:
    """ Função utilitária mantida. """
    try:
        df = pd.read_csv(file_path, sep=None, engine='python', on_bad_lines='skip', encoding='utf-8')
    except Exception:
        try:
            df = pd.read_csv(file_path, sep=';', engine='python', on_bad_lines='skip', encoding='latin1')
        except Exception as e:
            raise ValueError(f"Não foi possível ler o arquivo CSV ({file_path}). Detalhes: {str(e)}")
    return df

def process_olist_datasets(file_paths: Dict[str, str], db: Session) -> Tuple[dict, dict]:
    """
    Realiza o Join das 4 entidades obrigatórias Olist.
    """
    
    # 1. Leitura robusta individual
    df_orders = read_csv_robust(file_paths["olist_orders_dataset.csv"])
    df_customers = read_csv_robust(file_paths["olist_customers_dataset.csv"])
    df_items = read_csv_robust(file_paths["olist_order_items_dataset.csv"])
    df_products = read_csv_robust(file_paths["olist_products_dataset.csv"])
    
    # 2. Joins Sucessivos (Merge)
    # 2.1 Orders + Customers (Chave: customer_id)
    # Traz o 'customer_state' para a Order
    df_merged = pd.merge(
        df_orders[['order_id', 'customer_id', 'order_purchase_timestamp']],
        df_customers[['customer_id', 'customer_state']],
        on='customer_id', how='inner'
    )
    
    # 2.2 Merged + Order Items (Chave: order_id)
    # Traz o 'price' e 'product_id'.
    # NOTA: A granularidade final do df passa a ser por ITEM VENDIDO,
    # então pedidos com 2 itens terão 2 linhas no Analytics com a mesma order_id.
    df_merged = pd.merge(
        df_merged,
        df_items[['order_id', 'product_id', 'price']],
        on='order_id', how='inner'
    )
    
    # 2.3 Merged + Products (Chave: product_id)
    # Traz a 'product_category_name'
    df_merged = pd.merge(
        df_merged,
        df_products[['product_id', 'product_category_name']],
        on='product_id', how='left'  # left join para não perder o item se ele não tiver o mapeamento de categoria
    )
    
    # 3. Limpeza Específica Pós-Join
    # Renomear para o padrão AnalyticsSales V1
    df_merged.rename(columns={
        'order_purchase_timestamp': 'order_date',
        'product_category_name': 'category'
    }, inplace=True)
    
    # Selecionar as colunas estritamente permitidas
    df_clean = df_merged[['order_id', 'order_date', 'customer_state', 'category', 'price']].copy()
    
    # Drops de linhas impossíveis de analisar
    df_clean.dropna(subset=['order_id', 'price', 'order_date'], inplace=True)
    
    # Tratamento de Nulos com "Unknown"
    df_clean['customer_state'] = df_clean['customer_state'].fillna("Unknown")
    df_clean['category'] = df_clean['category'].fillna("Unknown")
    
    # Conversões explícitas
    df_clean['order_date'] = pd.to_datetime(df_clean['order_date'], errors='coerce')
    df_clean.dropna(subset=['order_date'], inplace=True)
    df_clean['price'] = pd.to_numeric(df_clean['price'], errors='coerce').fillna(0.0)

    # 4. Persistência
    db.query(AnalyticsSales).delete()
    db.commit()

    records = df_clean.to_dict(orient="records")
    
    db_items = [
        AnalyticsSales(
            order_id=str(row["order_id"]),
            order_date=row["order_date"],
            customer_state=str(row["customer_state"]),
            product_category=str(row["category"]),
            price=float(row["price"])
        )
        for row in records
    ]
    
    db.bulk_save_objects(db_items)
    db.commit()
    
    # 5. Criar Preview Seguro (Nulos via Fillna("") pro JSON)
    preview_df = df_clean.head(5).fillna("")
    
    preview_data = {
        "columns": preview_df.columns.tolist(),
        "head": preview_df.to_dict(orient="records")
    }

    etl_result = {
        "rows_processed": len(records),
        "granularity": "item_level", # Explicitando o escopo
        "notes": "Métricas de Orders exigirão count(distinct order_id)."
    }
    
    return etl_result, preview_data
