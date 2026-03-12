import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { salesApi } from '../services/api';

const UploadForm = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState({
    orders_file: null,
    customers_file: null,
    order_items_file: null,
    products_file: null,
  });
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');

  const handleFileChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({
        ...prev,
        [fieldName]: e.target.files[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all files are present
    const missing = Object.entries(files).filter(([_, file]) => !file).map(([key]) => key);
    if (missing.length > 0) {
      setStatus('error');
      setMessage(`Faltam arquivos: ${missing.join(', ')}`);
      return;
    }

    setStatus('uploading');
    setMessage('Enviando e processando arquivos...');

    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => {
      formData.append(key, file);
    });

    try {
      const response = await salesApi.uploadFiles(formData);
      setStatus('success');
      setMessage(response.data.message || 'Arquivos processados com sucesso!');
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Ocorreu um erro ao enviar os arquivos.');
    }
  };

  return (
    <div className="upload-section">
      <div className="upload-header">
        <UploadCloud className="upload-icon" />
        <h2>Upload de Dados Olist</h2>
        <p>Selecione os 4 arquivos CSV do dataset para processamento.</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-inputs-grid">
          <div className="file-input-group">
            <label>Orders Dataset</label>
            <input 
              type="file" 
              accept=".csv" 
              onChange={(e) => handleFileChange(e, 'orders_file')} 
              required 
            />
          </div>
          <div className="file-input-group">
            <label>Customers Dataset</label>
            <input 
              type="file" 
              accept=".csv" 
              onChange={(e) => handleFileChange(e, 'customers_file')} 
              required 
            />
          </div>
          <div className="file-input-group">
            <label>Order Items Dataset</label>
            <input 
              type="file" 
              accept=".csv" 
              onChange={(e) => handleFileChange(e, 'order_items_file')} 
              required 
            />
          </div>
          <div className="file-input-group">
            <label>Products Dataset</label>
            <input 
              type="file" 
              accept=".csv" 
              onChange={(e) => handleFileChange(e, 'products_file')} 
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={status === 'uploading'}
          className={`upload-btn ${status === 'uploading' ? 'uploading' : ''}`}
        >
          {status === 'uploading' ? (
            <><Loader2 className="spinner" /> Processando...</>
          ) : (
            'Processar Dados'
          )}
        </button>
      </form>

      {status === 'success' && (
        <div className="feedback-alert success">
          <CheckCircle size={20} />
          <span>{message}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="feedback-alert error">
          <AlertCircle size={20} />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
