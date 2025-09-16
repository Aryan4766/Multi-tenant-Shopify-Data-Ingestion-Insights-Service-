import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  Users,
  ShoppingCart,
  Package,
  Calendar,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function Analytics() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('customers');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: customerData, isLoading: customersLoading } = useQuery(
    ['customerAnalytics', user?.tenantId, dateRange],
    () => analyticsAPI.getCustomerAnalytics(user?.tenantId, dateRange),
    { enabled: !!user?.tenantId && activeTab === 'customers' }
  );

  const { data: orderData, isLoading: ordersLoading } = useQuery(
    ['orderAnalytics', user?.tenantId, dateRange],
    () => analyticsAPI.getOrderAnalytics(user?.tenantId, dateRange),
    { enabled: !!user?.tenantId && activeTab === 'orders' }
  );

  const { data: productData, isLoading: productsLoading } = useQuery(
    ['productAnalytics', user?.tenantId, dateRange],
    () => analyticsAPI.getProductAnalytics(user?.tenantId, dateRange),
    { enabled: !!user?.tenantId && activeTab === 'products' }
  );

  const tabs = [
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'products', name: 'Products', icon: Package },
  ];

  const renderCustomerAnalytics = () => {
    const customers = customerData?.data?.customers || [];
    
    if (customersLoading) {
      return <div className="text-center py-8">Loading customer analytics...</div>;
    }

    // Customer acquisition over time
    const acquisitionData = customers
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .reduce((acc, customer) => {
        const date = new Date(customer.createdAt).toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, []);

    // Customer spending distribution
    const spendingRanges = [
      { range: '₹0-100', count: 0, min: 0, max: 100 },
      { range: '₹100-500', count: 0, min: 100, max: 500 },
      { range: '₹500-1000', count: 0, min: 500, max: 1000 },
      { range: '₹1000-5000', count: 0, min: 1000, max: 5000 },
      { range: '₹5000+', count: 0, min: 5000, max: Infinity },
    ];

    customers.forEach(customer => {
      const spent = customer.totalSpent || 0;
      const range = spendingRanges.find(r => spent >= r.min && spent < r.max);
      if (range) range.count += 1;
    });

    return (
      <div className="space-y-6">
        {/* Customer Acquisition Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Customer Acquisition Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={acquisitionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Spending Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Customer Spending Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingRanges}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, count }) => `${range}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {spendingRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Top Customers</h3>
            <div className="space-y-3">
              {customers.slice(0, 10).map((customer, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-secondary-900">{customer.name || 'Unknown'}</p>
                    <p className="text-sm text-secondary-500">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-secondary-900">₹{customer.totalSpent?.toLocaleString()}</p>
                    <p className="text-sm text-secondary-500">{customer.totalOrders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderAnalytics = () => {
    const orders = orderData?.data?.orders || [];
    const statusDistribution = orderData?.data?.statusDistribution || [];
    
    if (ordersLoading) {
      return <div className="text-center py-8">Loading order analytics...</div>;
    }

    // Orders over time
    const ordersOverTime = orders
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.count += 1;
          existing.revenue += order.totalPrice || 0;
        } else {
          acc.push({ date, count: 1, revenue: order.totalPrice || 0 });
        }
        return acc;
      }, []);

    return (
      <div className="space-y-6">
        {/* Orders Over Time */}
        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Orders Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Orders" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Order Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Orders</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {orders.slice(0, 20).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-secondary-900">#{order.orderNumber || order.id}</p>
                    <p className="text-sm text-secondary-500">
                      {order.customer ? order.customer.name : 'Guest'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-secondary-900">₹{order.totalPrice?.toLocaleString()}</p>
                    <p className="text-sm text-secondary-500">{order.financialStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductAnalytics = () => {
    const products = productData?.data?.products || [];
    
    if (productsLoading) {
      return <div className="text-center py-8">Loading product analytics...</div>;
    }

    // Product performance chart
    const productPerformance = products.slice(0, 10).map(product => ({
      name: product.title.length > 20 ? product.title.substring(0, 20) + '...' : product.title,
      revenue: product.totalRevenue || 0,
      quantity: product.totalQuantity || 0,
    }));

    return (
      <div className="space-y-6">
        {/* Product Performance */}
        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Top Products by Revenue</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={200} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Sales vs Revenue Scatter */}
        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Product Sales vs Revenue</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={productPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quantity" name="Quantity Sold" />
                <YAxis dataKey="revenue" name="Revenue" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey="revenue" fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Details Table */}
        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Product Performance Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                      {product.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {product.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {product.productType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {product.orderCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {product.totalQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      ₹{product.totalRevenue?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (!user?.tenantId) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">No tenant associated with your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Analytics</h1>
          <p className="text-secondary-600">Detailed insights into your business performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-secondary-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input"
            />
            <span className="text-secondary-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'customers' && renderCustomerAnalytics()}
        {activeTab === 'orders' && renderOrderAnalytics()}
        {activeTab === 'products' && renderProductAnalytics()}
      </div>
    </div>
  );
}

export default Analytics;
