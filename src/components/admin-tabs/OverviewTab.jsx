import React from 'react';
import { ShoppingCart, TrendingUp, Users, MessageSquare, Mail, Package } from 'lucide-react';

export default function OverviewTab({ overview }) {
  if (!overview) {
    return <div className="text-center py-12 text-slate-500">Loading overview...</div>;
  }

  const cards = [
    {
      title: 'Total Orders',
      value: overview.totalOrders,
      subtitle: `Regular: ${overview.regularOrders} | Bulk: ${overview.bulkOrders} | Samples: ${overview.freeSamples}`,
      icon: ShoppingCart,
      color: 'blue',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Revenue',
      value: `₹${(overview.totalRevenue || 0).toLocaleString()}`,
      subtitle: 'From completed orders',
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Users',
      value: overview.totalUsers,
      subtitle: 'Active customers',
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Messages',
      value: overview.unreadMessages,
      subtitle: `${overview.totalMessages} total`,
      icon: MessageSquare,
      color: 'orange',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Newsletter',
      value: overview.newsletterSubscribers,
      subtitle: 'Active subscribers',
      icon: Mail,
      color: 'red',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Products',
      value: overview.totalProducts || 0,
      subtitle: 'Items in stock',
      icon: Package,
      color: 'indigo',
      bgColor: 'bg-indigo-50'
    }
  ];

  const colorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600'
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`${card.bgColor} rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
                  <p className="text-xs text-slate-500 mt-3">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon size={24} className={colorMap[card.color]} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-green-600">{overview.totalOrders}</p>
            <p className="text-sm text-slate-600 mt-2">Total Orders</p>
          </div>
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-blue-600">{overview.totalUsers}</p>
            <p className="text-sm text-slate-600 mt-2">Active Users</p>
          </div>
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-purple-600">{overview.unreadMessages}</p>
            <p className="text-sm text-slate-600 mt-2">Unread Messages</p>
          </div>
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-orange-600">{overview.newsletterSubscribers}</p>
            <p className="text-sm text-slate-600 mt-2">Newsletter Subs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
