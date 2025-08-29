export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Jackson Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">12,345</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🎮</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Games</p>
              <p className="text-2xl font-semibold text-gray-900">89</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">$45,231</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-semibold text-gray-900">24.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">👤</div>
                <div>
                  <p className="font-medium text-gray-900">Neil Jackson</p>
                  <p className="text-sm text-gray-600">neil.jackson@gmail.com</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⭐ Gold
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">👤</div>
                <div>
                  <p className="font-medium text-gray-900">Samuel Joh</p>
                  <p className="text-sm text-gray-600">samthegamer@gmail.com</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                ⭐ Silver
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">👤</div>
                <div>
                  <p className="font-medium text-gray-900">Patricia G</p>
                  <p className="text-sm text-gray-600">patricia.gam@gmail.com</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                ⭐ Bronze
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-teal-50 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors">
              <div className="flex items-center">
                <span className="text-lg mr-3">👥</span>
                <span className="font-medium text-teal-900">Manage Users</span>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
              <div className="flex items-center">
                <span className="text-lg mr-3">🎮</span>
                <span className="font-medium text-blue-900">Create New Game</span>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
              <div className="flex items-center">
                <span className="text-lg mr-3">📊</span>
                <span className="font-medium text-green-900">View Analytics</span>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
              <div className="flex items-center">
                <span className="text-lg mr-3">⚙️</span>
                <span className="font-medium text-purple-900">System Settings</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
