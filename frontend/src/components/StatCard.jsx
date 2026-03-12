import React from 'react';

const StatCard = ({ title, value, icon: Icon, loading }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        {Icon && <Icon className="stat-card-icon" />}
      </div>
      <div className="stat-card-value">
        {loading ? (
          <div className="shimmer skeleton-loaders" style={{ height: '32px', width: '100px', borderRadius: '4px' }}></div>
        ) : (
          value
        )}
      </div>
    </div>
  );
};

export default StatCard;
