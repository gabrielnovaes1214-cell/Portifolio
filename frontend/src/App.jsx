import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ShoppingCart, BarChart2 } from 'lucide-react';
import { salesApi } from './services/api';
import UploadForm from './components/UploadForm';
import StatCard from './components/StatCard';
import DashboardCharts from './components/DashboardCharts';
import './App.css';

function App() {
  const [summary, setSummary] = useState(null);
  const [salesByMonth, setSalesByMonth] = useState([]);
  const [salesByState, setSalesByState] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const [summaryRes, monthRes, stateRes, catRes] = await Promise.all([
        salesApi.getSummary(),
        salesApi.getSalesByMonth(),
        salesApi.getSalesByState(),
        salesApi.getTopCategories(),
      ]);
      setSummary(summaryRes.data);
      setSalesByMonth(monthRes.data);
      setSalesByState(stateRes.data);
      setTopCategories(catRes.data);
    } catch (err) {
      // If data doesn't exist yet, silently ignore — user needs to upload first
      const status = err.response?.status;
      if (status !== 404 && status !== 500) {
        setMetricsError('Não foi possível carregar os dados. Verifique se o backend está online.');
      }
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const formatCurrency = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const hasData = summary || salesByMonth.length > 0;

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <BarChart2 className="brand-icon" />
            <div>
              <h1 className="brand-title">Sales Intelligence</h1>
              <span className="brand-subtitle">Olist Dataset Analytics</span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Upload Section */}
        <UploadForm onUploadSuccess={fetchMetrics} />

        {/* Metrics Error */}
        {metricsError && (
          <div className="feedback-alert error" style={{ marginTop: '1rem' }}>
            <span>{metricsError}</span>
          </div>
        )}

        {/* Summary Cards */}
        {(metricsLoading || hasData) && (
          <section className="section">
            <h2 className="section-title">Visão Geral</h2>
            <div className="stats-grid">
              <StatCard
                title="Receita Total"
                value={formatCurrency(summary?.revenue)}
                icon={TrendingUp}
                loading={metricsLoading}
              />
              <StatCard
                title="Total de Pedidos"
                value={formatNumber(summary?.orders)}
                icon={ShoppingCart}
                loading={metricsLoading}
              />
            </div>
          </section>
        )}

        {/* Charts */}
        {(metricsLoading || hasData) && (
          <section className="section">
            <h2 className="section-title">Análise de Vendas</h2>
            <DashboardCharts
              salesByMonth={salesByMonth}
              salesByState={salesByState}
              topCategories={topCategories}
              loading={metricsLoading}
            />
          </section>
        )}

        {/* Empty state — only when not loading and no data */}
        {!metricsLoading && !hasData && !metricsError && (
          <div className="empty-state">
            <BarChart2 size={48} className="empty-icon" />
            <h2>Pronto para começar</h2>
            <p>Faça o upload dos 4 arquivos do dataset Olist acima<br/>para visualizar os dados de vendas.</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Sales Intelligence App · Portfólio · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
