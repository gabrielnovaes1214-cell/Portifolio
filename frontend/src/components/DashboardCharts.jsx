import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: "compact",
    compactDisplay: "short"
  }).format(value);
};

// Converts '2017-01' → 'Jan/17'
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const formatMonth = (value) => {
  if (!value || !value.includes('-')) return value;
  const [year, month] = value.split('-');
  return `${MONTHS[parseInt(month, 10) - 1]}/${year.slice(2)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        <p className="intro">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const DashboardCharts = ({ salesByMonth, salesByState, topCategories, loading }) => {
  if (loading) {
    return (
      <div className="charts-grid skeleton-loaders">
        <div className="chart-card shimmer" style={{ height: '300px' }}></div>
        <div className="chart-card shimmer" style={{ height: '300px' }}></div>
        <div className="chart-card shimmer" style={{ height: '300px' }}></div>
      </div>
    );
  }

  if (!salesByMonth?.length && !salesByState?.length && !topCategories?.length) {
    return (
       <div className="charts-empty">
          <p>Nenhum dado disponível. Faça upload dos arquivos para visualizar os gráficos.</p>
       </div>
    );
  }

  // Transform salesByMonth if necessary. Assuming [{month: '2017-01', revenue: 1000}, ...]
  // Transform salesByState. Assuming [{state: 'SP', revenue: 1000}, ...]
  // Transform topCategories. Assuming [{category_name: 'beleza_saude', revenue: 1000}, ...]

  return (
    <div className="charts-grid">
      <div className="chart-card chart-full-width">
        <h3>Receita Mensal</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 12}} tickFormatter={formatMonth} />
              <YAxis stroke="#64748b" tickFormatter={formatCurrency} tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>Receita por Estado (Top 10)</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByState?.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" stroke="#64748b" tickFormatter={formatCurrency} tick={{fontSize: 12}} />
              <YAxis dataKey="state" type="category" stroke="#64748b" tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>Top 5 Categorias</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCategories} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" stroke="#64748b" tickFormatter={formatCurrency} tick={{fontSize: 12}} />
              {/* Category names can be long, so we give them more left margin and a custom tick if needed, but for now just YAxis string */}
              <YAxis dataKey="category" type="category" stroke="#64748b" tick={{fontSize: 11}} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
