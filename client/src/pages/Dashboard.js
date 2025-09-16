import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI, syncAPI } from '../services/api';
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
} from 'recharts';
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function StatCard({ title, value, icon: Icon, change, changeType, loading }) {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-secondary-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-secondary-900">
                {loading ? '...' : value}
              </div>
              {change !== undefined && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {changeType === 'increase' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="ml-1">{change}%</span>
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: dashboardData, isLoading, refetch } = useQuery(
    ['dashboard', user?.tenantId, dateRange],
    () => analyticsAPI.getDashboardStats(user?.tenantId, dateRange),
    {
      enabled: !!user?.tenantId,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const handleSync = async (type) => {
    try {
      toast.loading(`Starting ${type} sync...`);
      await syncAPI[`sync${type.charAt(0).toUpperCase() + type.slice(1)}`](user.tenantId);
      toast.success(`${type} sync completed successfully!`);
      refetch();
    } catch (error) {
      toast.error(`Failed to sync ${type}: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleFullSync = async () => {
    try {
      toast.loading('Starting full sync...');
      await syncAPI.fullSync(user.tenantId);
      toast.success('Full sync completed successfully!');
      refetch();
    } catch (error) {
      toast.error(`Failed to sync: ${error.response?.data?.error || error.message}`);
    }
  };

  if (!user?.tenantId) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">No tenant associated with your account.</p>
      </div>
    );
  }

  const overview = dashboardData?.data?.overview || {};
  const ordersByDate = dashboardData?.data?.ordersByDate || [];
  const topCustomers = dashboardData?.data?.topCustomers || [];
  const topProducts = dashboardData?.data?.topProducts || [];
  const recentOrders = dashboardData?.data?.recentOrders || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600">Welcome back, {user.firstName}!</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleSync('customers')}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Customers
          </button>
          <button
            onClick={() => handleSync('products')}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Products
          </button>
          <button
            onClick={() => handleSync('orders')}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Orders
          </button>
          <button
            onClick={handleFullSync}
            className="btn btn-primary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Full Sync
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-secondary-400" />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-secondary-700">From:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-secondary-700">To:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={overview.totalCustomers?.toLocaleString()}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title="Total Products"
          value={overview.totalProducts?.toLocaleString()}
          icon={Package}
          loading={isLoading}
        />
        <StatCard
          title="Total Orders"
          value={overview.totalOrders?.toLocaleString()}
          icon={ShoppingCart}
          loading={isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${overview.totalRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Date */}
        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Orders by Date</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Date */}
        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Revenue by Date</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customers and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Top 5 Customers</h3>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
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

        {/* Top Products */}
        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Top 5 Products</h3>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-b-0">
                <div>
                  <p className="font-medium text-secondary-900">{product.title}</p>
                  <p className="text-sm text-secondary-500">{product.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-secondary-900">₹{product.totalRevenue?.toLocaleString()}</p>
                  <p className="text-sm text-secondary-500">{product.totalQuantity} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                    #{order.orderNumber || order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {order.customer ? (
                      <div>
                        <div className="font-medium text-secondary-900">{order.customer.name}</div>
                        <div>{order.customer.email}</div>
                      </div>
                    ) : (
                      'Guest'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.financialStatus === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.financialStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    ₹{order.totalPrice?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
