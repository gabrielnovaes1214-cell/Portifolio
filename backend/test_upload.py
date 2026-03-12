import os
import pandas as pd
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_upload_olist():
    # 1. Mocking Orders
    df_orders = pd.DataFrame({
        "order_id": ["O1", "O2", "O3"],
        "customer_id": ["C1", "C2", "C3"],
        "order_purchase_timestamp": ["2026-03-01", "2026-03-02", "2026-03-03"]
    })
    
    # 2. Mocking Customers
    df_customers = pd.DataFrame({
        "customer_id": ["C1", "C2", "C3", "C4"],
        "customer_state": ["SP", "RJ", "MG", "SP"]
    })
    
    # 3. Mocking Items (Order O2 has 2 items)
    df_items = pd.DataFrame({
        "order_id": ["O1", "O2", "O2", "O3"],
        "product_id": ["P1", "P2", "P3", "P1"],
        "price": [10.5, 20.0, 5.0, 30.5]
    })
    
    # 4. Mocking Products (P3 intentionally missing category to test 'Unknown' fallback)
    df_products = pd.DataFrame({
        "product_id": ["P1", "P2"],
        "product_category_name": ["Eletronicos", "Moveis"]
    })

    files_mock = {
        "olist_orders_dataset.csv": df_orders,
        "olist_customers_dataset.csv": df_customers,
        "olist_order_items_dataset.csv": df_items,
        "olist_products_dataset.csv": df_products,
    }

    try:
        files_data = []
        open_files = []
        
        field_mapping = {
            "olist_orders_dataset.csv": "orders_file",
            "olist_customers_dataset.csv": "customers_file",
            "olist_order_items_dataset.csv": "order_items_file",
            "olist_products_dataset.csv": "products_file"
        }
        
        for name, df in files_mock.items():
            df.to_csv(name, index=False)
            f = open(name, "rb")
            open_files.append(f)
            field_name = field_mapping[name]
            files_data.append((field_name, (name, f, "text/csv")))
            
        response = client.post("/api/upload", files=files_data)
            
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200
        data = response.json()
        assert "etl_result" in data
        assert data["etl_result"]["rows_processed"] == 4 # O1 (1 item), O2 (2 items), O3 (1 item)
        print("Test passed successfully!")
    finally:
        for f in open_files:
            f.close()
        for name in files_mock.keys():
            if os.path.exists(name):
                os.remove(name)

if __name__ == "__main__":
    test_upload_olist()
