import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3,
  Play,
  Pause,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface DashboardProps {
  user: any;
  onViewChange: (view: string) => void;
}

export function Dashboard({ user, onViewChange }: DashboardProps) {
  const [activeStrategies, setActiveStrategies] = useState<any[]>([]);
  const [purchasedStrategies, setPurchasedStrategies] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState({
    totalValue: 127450,
    dailyChange: 3120,
    dailyChangePercent: 2.5,
    totalStrategies: 8,
    activeStrategies: 5,
    totalEarnings: 45230
  });

  // Mock data - in a real app, this would come from your backend
  useEffect(() => {
    // Simulate loading user's strategies and purchases
    const mockActiveStrategies = [
      {
        id: '1',
        name: 'My DeFi Yield Strategy',
        status: 'running',
        performance: '+15.3%',
        dailyPnL: '+$1,245',
        totalValue: '$12,450',
        startedAt: '2024-01-15',
        users: 45
      },
      {
        id: '2',
        name: 'Arbitrage Bot v2',
        status: 'paused',
        performance: '+8.7%',
        dailyPnL: '+$234',
        totalValue: '$5,670',
        startedAt: '2024-02-01',
        users: 23
      },
      {
        id: '3',
        name: 'Grid Trading Pro',
        status: 'running',
        performance: '+22.1%',
        dailyPnL: '+$876',
        totalValue: '$8,900',
        startedAt: '2024-01-20',
        users: 67
      }
    ];

    const mockPurchasedStrategies = [
      {
        id: '4',
        name: 'Momentum Scalper',
        creator: 'TechAnalyst',
        performance: '+18.5%',
        dailyPnL: '+$567',
        totalInvested: '$3,000',
        purchasedAt: '2024-02-15',
        status: 'running'
      },
      {
        id: '5',
        name: 'Mean Reversion Pro',
        creator: 'StatArb',
        performance: '+12.3%',
        dailyPnL: '+$123',
        totalInvested: '$1,500',
        purchasedAt: '2024-02-20',
        status: 'running'
      }
    ];

    setActiveStrategies(mockActiveStrategies);
    setPurchasedStrategies(mockPurchasedStrategies);
  }, [user]);

  const handleStrategyAction = (strategyId: string, action: string) => {
    if (action === 'pause' || action === 'resume') {
      setActiveStrategies(prev => prev.map(strategy => 
        strategy.id === strategyId 
          ? { ...strategy, status: action === 'pause' ? 'paused' : 'running' }
          : strategy
      ));
    }
    // Handle other actions like edit, delete, etc.
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'stopped':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your dashboard</h1>
            <Button onClick={() => onViewChange('home')}>Go to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name || user.email}
          </h1>
          <p className="text-gray-600">
            Manage your trading strategies and monitor performance
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className={`${portfolio.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.dailyChange >= 0 ? '+' : ''}${portfolio.dailyChange.toLocaleString()} ({portfolio.dailyChangePercent >= 0 ? '+' : ''}{portfolio.dailyChangePercent}%)
                </span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolio.activeStrategies}</div>
              <p className="text-xs text-muted-foreground">
                of {portfolio.totalStrategies} total strategies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolio.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All-time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strategy Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">135</div>
              <p className="text-xs text-muted-foreground">
                Total subscribers to your strategies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Strategies Management */}
        <Tabs defaultValue="my-strategies" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-strategies">My Strategies</TabsTrigger>
            <TabsTrigger value="purchased">Purchased Strategies</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="my-strategies">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Strategies</CardTitle>
                    <CardDescription>
                      Strategies you've created and deployed
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => onViewChange('create')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    Create New Strategy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeStrategies.map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{strategy.name}</h4>
                          <Badge className={getStatusColor(strategy.status)}>
                            {strategy.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium text-green-600">{strategy.performance}</span>
                            <p>Performance</p>
                          </div>
                          <div>
                            <span className="font-medium">{strategy.dailyPnL}</span>
                            <p>Daily P&L</p>
                          </div>
                          <div>
                            <span className="font-medium">{strategy.totalValue}</span>
                            <p>Total Value</p>
                          </div>
                          <div>
                            <span className="font-medium">{strategy.users}</span>
                            <p>Subscribers</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStrategyAction(strategy.id, strategy.status === 'running' ? 'pause' : 'resume')}
                        >
                          {strategy.status === 'running' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {activeStrategies.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't created any strategies yet</p>
                      <Button 
                        onClick={() => onViewChange('create')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        Create Your First Strategy
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchased">
            <Card>
              <CardHeader>
                <CardTitle>Purchased Strategies</CardTitle>
                <CardDescription>
                  Strategies you've purchased from other creators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchasedStrategies.map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{strategy.name}</h4>
                          <span className="text-sm text-gray-600">by {strategy.creator}</span>
                          <Badge className={getStatusColor(strategy.status)}>
                            {strategy.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium text-green-600">{strategy.performance}</span>
                            <p>Performance</p>
                          </div>
                          <div>
                            <span className="font-medium">{strategy.dailyPnL}</span>
                            <p>Daily P&L</p>
                          </div>
                          <div>
                            <span className="font-medium">{strategy.totalInvested}</span>
                            <p>Invested</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {purchasedStrategies.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't purchased any strategies yet</p>
                      <Button 
                        onClick={() => onViewChange('marketplace')}
                        variant="outline"
                      >
                        Browse Marketplace
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Chart</CardTitle>
                  <CardDescription>Portfolio performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Performance Chart</p>
                      <p className="text-sm opacity-75">Coming Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategy Distribution</CardTitle>
                  <CardDescription>Breakdown by strategy type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Distribution Chart</p>
                      <p className="text-sm">Coming Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}