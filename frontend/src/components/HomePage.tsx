import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Star,
  DollarSign,
} from "lucide-react";

interface HomePageProps {
  onViewChange: (view: string) => void;
}

export function HomePage({ onViewChange }: HomePageProps) {
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "AI-Powered Strategies",
      description:
        "Create sophisticated trading strategies using advanced AI algorithms and market analysis.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Transparent",
      description:
        "Built on blockchain technology with smart contracts ensuring transparency and security.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Deployment",
      description:
        "Deploy your strategies instantly across multiple DeFi protocols and exchanges.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description:
        "Access strategies from top traders and contribute to a thriving community.",
    },
  ];

  const topStrategies = [
    {
      id: 1,
      name: "DeFi Yield Maximizer",
      creator: "CryptoAlpha",
      performance: "+127.3%",
      risk: "Medium",
      price: "0.5 ETH",
      rating: 4.8,
      users: 1240,
    },
    {
      id: 2,
      name: "Arbitrage Hunter",
      creator: "QuantTrader",
      performance: "+89.1%",
      risk: "Low",
      price: "0.3 ETH",
      rating: 4.9,
      users: 856,
    },
    {
      id: 3,
      name: "Momentum Scalper",
      creator: "TechAnalyst",
      performance: "+156.7%",
      risk: "High",
      price: "0.8 ETH",
      rating: 4.6,
      users: 634,
    },
  ];

  const stats = [
    { label: "Total Strategies", value: "2,500+" },
    { label: "Active Users", value: "15,000+" },
    { label: "Total Volume", value: "$50M+" },
    { label: "Average ROI", value: "78%" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-bg py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center hero-panel p-8 sm:p-10 shadow-[0_40px_120px_-20px_rgba(255,122,0,0.35),0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-sm">
            <div>
              <Badge
                style={{ color: "#ff7a00", borderColor: "#ff7a00" }}
                className="mb-4 bg-orange-500/10 text-orange-500 hero-bg hover:bg-orange-500/10 border-orange-500/20"
              >
                Web3 Financial Platform
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 font-[Hanuman]">
                Create & Deploy{" "}
                <span
                  style={{ color: "#ff7a00" }}
                  className="bg-clip-text text-orange-500"
                >
                  Financial Strategies
                </span>
              </h1>
              <p className="text-xl text-foreground/70 mb-8 leading-relaxed">
                Build sophisticated trading strategies with AI, deploy them
                instantly across DeFi protocols, or access proven strategies
                from top traders worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  style={{ background: "#ff7a00", color: "white" }}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8"
                  onClick={() => onViewChange("marketplace")}
                >
                  Explore Strategies
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  style={{ background: "black" }}
                  size="lg"
                  variant="outline"
                  onClick={() => onViewChange("create")}
                >
                  Create Strategy
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-card rounded-2xl shadow-2xl p-8 transform rotate-3 relative overflow-hidden border border-border">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500 to-orange-600"></div>
                  <svg
                    className="absolute top-0 left-0 w-full h-full"
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <pattern
                        id="grid"
                        width="10"
                        height="10"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 10 0 L 0 0 0 10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
                </div>

                <div className="space-y-6 relative z-10">
                  {/* Header with enhanced styling */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Portfolio Performance
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Live Trading Results
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 shadow-sm px-3 py-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +24.5%
                    </Badge>
                  </div>

                  {/* Enhanced Chart Area */}
                  <div className="relative h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl border border-orange-500/20 overflow-hidden">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/10"></div>

                    {/* Chart Line SVG */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      preserveAspectRatio="none"
                      viewBox="0 0 300 100"
                    >
                      <defs>
                        <linearGradient
                          id="chartGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop
                            offset="0%"
                            style={{ stopColor: "#f97316", stopOpacity: 0.3 }}
                          />
                          <stop
                            offset="50%"
                            style={{ stopColor: "#ea580c", stopOpacity: 0.3 }}
                          />
                          <stop
                            offset="100%"
                            style={{ stopColor: "#c2410c", stopOpacity: 0.3 }}
                          />
                        </linearGradient>
                        <linearGradient
                          id="chartLine"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" style={{ stopColor: "#f97316" }} />
                          <stop offset="50%" style={{ stopColor: "#ea580c" }} />
                          <stop
                            offset="100%"
                            style={{ stopColor: "#c2410c" }}
                          />
                        </linearGradient>
                      </defs>

                      {/* Background Area */}
                      <path
                        d="M0,80 Q75,60 150,45 T300,35 L300,100 L0,100 Z"
                        fill="url(#chartGradient)"
                      />

                      {/* Chart Line */}
                      <path
                        d="M0,80 Q75,60 150,45 T300,35"
                        fill="none"
                        stroke="url(#chartLine)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Data Points */}
                      <circle
                        cx="75"
                        cy="60"
                        r="3"
                        fill="#f97316"
                        className="drop-shadow-sm"
                      />
                      <circle
                        cx="150"
                        cy="45"
                        r="3"
                        fill="#ea580c"
                        className="drop-shadow-sm"
                      />
                      <circle
                        cx="225"
                        cy="40"
                        r="3"
                        fill="#c2410c"
                        className="drop-shadow-sm"
                      />
                    </svg>

                    {/* Grid Lines */}
                    <div className="absolute inset-0">
                      <div className="h-full w-full">
                        <div className="absolute top-1/4 left-0 w-full h-px bg-gray-200/50"></div>
                        <div className="absolute top-2/4 left-0 w-full h-px bg-gray-200/50"></div>
                        <div className="absolute top-3/4 left-0 w-full h-px bg-gray-200/50"></div>
                      </div>
                    </div>

                    {/* Floating Stats */}
                    <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-border">
                      <div className="flex items-center space-x-1 text-xs">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-muted-foreground">Live</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center space-x-2 mb-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">
                          Total Value
                        </p>
                      </div>
                      <p className="font-semibold text-lg text-foreground">
                        $127,450
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs text-muted-foreground">
                          3 Strategies
                        </span>
                      </div>
                    </div>
                    <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <p className="text-muted-foreground text-sm">
                          24h Change
                        </p>
                      </div>
                      <p className="font-semibold text-lg text-orange-600">
                        +$3,120
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-orange-600">+2.5%</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Strategy Performance</span>
                      <span>Excellent</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-full transition-all duration-500 ease-out"
                        style={{ width: "78%", backgroundColor: "#ff7a00" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card relative mx-4 my-8 rounded-3xl border border-gradient-to-r from-orange-500/30 to-gray-900/30 shadow-[0_0_30px_rgba(249,115,22,0.15),inset_0_1px_0_rgba(249,115,22,0.1)] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center relative p-6 rounded-2xl border border-white/20 bg-gradient-to-br from-white/5 to-gray-900/10 shadow-[0_0_20px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 backdrop-blur-sm card-hover"
              >
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative p-8 mx-4 rounded-3xl border border-gradient-to-r from-orange-500/30 to-gray-900/30 shadow-[0_0_30px_rgba(249,115,22,0.15),inset_0_1px_0_rgba(249,115,22,0.1)] backdrop-blur-sm">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Every Trader
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're a beginner or professional trader, our platform
              provides the tools you need to succeed in the DeFi ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center relative border border-white/20 bg-gradient-to-br from-white/5 to-gray-900/10 shadow-[0_0_20px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-gradient-to-br hover:from-orange-500/10 hover:to-gray-900/20 hover:shadow-[0_0_30px_rgba(249,115,22,0.2),0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Strategies Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Top Performing Strategies
              </h2>
              <p className="text-muted-foreground">
                Discover the most successful strategies from our community
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onViewChange("marketplace")}
            >
              View All
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {topStrategies.map((strategy) => (
              <Card
                key={strategy.id}
                className="hover:shadow-lg transition-shadow border-border bg-card"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-card-foreground">
                        {strategy.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        by {strategy.creator}
                      </p>
                    </div>
                    <Badge
                      className={`${
                        strategy.risk === "Low"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : strategy.risk === "Medium"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {strategy.risk}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Performance
                    </span>
                    <span className="font-semibold text-green-400">
                      {strategy.performance}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-semibold text-card-foreground">
                      {strategy.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-card-foreground">
                        {strategy.rating}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {strategy.users}
                      </span>
                    </div>
                  </div>
                  <Button
                    style={{ background: "rgb(255, 122, 0)" }}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Purchase Strategy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted/50 relative mx-4 my-8 rounded-3xl border border-gradient-to-r from-orange-500/30 to-gray-900/30 shadow-[0_0_30px_rgba(249,115,22,0.15),inset_0_1px_0_rgba(249,115,22,0.1)] backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of traders who are already using DilliFi to maximize
            their returns
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8"
              onClick={() => onViewChange("marketplace")}
            >
              Start Trading
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-orange-500/10 hover:border-orange-500/50 px-8"
              onClick={() => onViewChange("create")}
            >
              Create Strategy
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
