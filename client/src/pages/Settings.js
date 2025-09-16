import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { tenantAPI, syncAPI } from '../services/api';
import { User, Building, RefreshCw, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

function Settings() {
  const { user, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });

  const { data: tenantData } = useQuery(
    ['tenant', user?.tenantId],
    () => tenantAPI.getById(user?.tenantId),
    { enabled: !!user?.tenantId }
  );

  const updateProfileMutation = useMutation(updateProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries(['tenant', user?.tenantId]);
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleSync = async (type) => {
    try {
      toast.loading(`Starting ${type} sync...`);
      await syncAPI[`sync${type.charAt(0).toUpperCase() + type.slice(1)}`](user.tenantId);
      toast.success(`${type} sync completed successfully!`);
    } catch (error) {
      toast.error(`Failed to sync ${type}: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleFullSync = async () => {
    try {
      toast.loading('Starting full sync...');
      await syncAPI.fullSync(user.tenantId);
      toast.success('Full sync completed successfully!');
    } catch (error) {
      toast.error(`Failed to sync: ${error.response?.data?.error || error.message}`);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'tenant', name: 'Tenant', icon: Building },
    { id: 'sync', name: 'Sync', icon: RefreshCw },
  ];

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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-600">Manage your account and tenant settings</p>
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
      <div className="max-w-2xl">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Profile Information</h3>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="label">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="label">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email}
                    disabled
                    className="input bg-secondary-50"
                  />
                  <p className="mt-1 text-xs text-secondary-500">
                    Email address cannot be changed
                  </p>
                </div>
                <div>
                  <label htmlFor="role" className="label">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={user?.role}
                    disabled
                    className="input bg-secondary-50"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="btn btn-primary flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'tenant' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Tenant Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Tenant Name</label>
                  <input
                    type="text"
                    value={tenantData?.data?.tenant?.name || ''}
                    disabled
                    className="input bg-secondary-50"
                  />
                </div>
                <div>
                  <label className="label">Shopify Domain</label>
                  <input
                    type="text"
                    value={tenantData?.data?.tenant?.shopifyDomain || ''}
                    disabled
                    className="input bg-secondary-50"
                  />
                </div>
                <div>
                  <label className="label">Last Sync</label>
                  <input
                    type="text"
                    value={
                      tenantData?.data?.tenant?.lastSyncAt
                        ? new Date(tenantData.data.tenant.lastSyncAt).toLocaleString()
                        : 'Never'
                    }
                    disabled
                    className="input bg-secondary-50"
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        tenantData?.data?.tenant?.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm text-secondary-700">
                      {tenantData?.data?.tenant?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Data Synchronization</h3>
              <p className="text-sm text-secondary-600 mb-6">
                Manually trigger data synchronization with your Shopify store. This will fetch the latest
                customers, products, and orders from your store.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => handleSync('customers')}
                  className="btn btn-secondary flex flex-col items-center p-4"
                >
                  <RefreshCw className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Sync Customers</span>
                </button>
                
                <button
                  onClick={() => handleSync('products')}
                  className="btn btn-secondary flex flex-col items-center p-4"
                >
                  <RefreshCw className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Sync Products</span>
                </button>
                
                <button
                  onClick={() => handleSync('orders')}
                  className="btn btn-secondary flex flex-col items-center p-4"
                >
                  <RefreshCw className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Sync Orders</span>
                </button>
                
                <button
                  onClick={handleFullSync}
                  className="btn btn-primary flex flex-col items-center p-4"
                >
                  <RefreshCw className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Full Sync</span>
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Sync Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-secondary-100">
                  <span className="text-sm text-secondary-600">Last Sync</span>
                  <span className="text-sm font-medium text-secondary-900">
                    {tenantData?.data?.tenant?.lastSyncAt
                      ? new Date(tenantData.data.tenant.lastSyncAt).toLocaleString()
                      : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-secondary-100">
                  <span className="text-sm text-secondary-600">Auto Sync</span>
                  <span className="text-sm font-medium text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-secondary-600">Next Sync</span>
                  <span className="text-sm font-medium text-secondary-900">
                    Every 6 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
