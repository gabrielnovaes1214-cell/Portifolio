import os
import shutil
from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.etl.processor import process_olist_datasets

router = APIRouter()

# Setup raw data path relative to backend root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
os.makedirs(RAW_DATA_DIR, exist_ok=True)

@router.post("/upload")
async def upload_csv(
    orders_file: UploadFile = File(...),
    customers_file: UploadFile = File(...),
    order_items_file: UploadFile = File(...),
    products_file: UploadFile = File(...)
    , db: Session = Depends(get_db)
):
    """
    Recebe os 4 arquivos CSV do dataset Olist explicitamente:
    - orders_file: olist_orders_dataset.csv
    - customers_file: olist_customers_dataset.csv
    - order_items_file: olist_order_items_dataset.csv
    - products_file: olist_products_dataset.csv
    """
    
    # 1. Mapeamento dos arquivos recebidos
    files_mapping = {
        "olist_orders_dataset.csv": orders_file,
        "olist_customers_dataset.csv": customers_file,
        "olist_order_items_dataset.csv": order_items_file,
        "olist_products_dataset.csv": products_file
    }

    # 2. Salvar fisicamente os arquivos mapeados
    file_paths = {}
    for expected_name, file_obj in files_mapping.items():
        if not file_obj.filename.endswith('.csv'):
             raise HTTPException(status_code=400, detail=f"O arquivo enviado para {expected_name} não é um CSV.")
             
        file_path = os.path.join(RAW_DATA_DIR, expected_name) # always force correct name
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file_obj.file, buffer)
        file_paths[expected_name] = file_path
            
    try:
        # 3. Etapa ETL: Lê os 4 Olist CSVs, processa, faz os Joins e persiste
        etl_result, preview_data = process_olist_datasets(file_paths, db)
        
        return {
            "message": "Olist datasets uploaded and processed successfully",
            "files_processed": list(files_mapping.keys()),
            "etl_result": etl_result,
            "preview": preview_data
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar os arquivos Olist: {str(e)}")
