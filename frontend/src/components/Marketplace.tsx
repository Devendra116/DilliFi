import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Search,
  Star,
  Users,
  TrendingUp,
  Filter,
  DollarSign,
  BarChart3,
  Shield,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { useRouter } from "next/navigation";
import { listStrategies, getUserPurchases } from "@/lib/strategiesApi";

interface MarketplaceProps {
  user: any;
  onPurchase: (strategyId: string) => void;
}

export type Strategy = {
  id: string;
  name: string;
  description: string;
  creator: string;
  creatorAvatar: string;
  category: string;
  performance: string;
  performanceValue: number;
  risk: "Low" | "Medium" | "High";
  price: string;
  priceUSD: string;
  rating: number;
  users: number;
  totalValue: string;
  createdAt: string;
  tags: string[];
  verified: boolean;
};

export function Marketplace({ user, onPurchase }: MarketplaceProps) {
  const router = useRouter();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [sortBy, setSortBy] = useState("performance");
  const [loading, setLoading] = useState(true);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  // Map API strategy payload to card model
  function mapApiToCard(item: any, idx: number): Strategy {
    const s = item?.strategy ?? item;
    const name = s?.name ?? `Strategy ${idx + 1}`;
    const desc = s?.desc ?? "";
    const creatorAddr = s?.creator?.address || item?.userAddress || "";
    const category = s?.execution_steps?.[0]?.integration_type || "Custom";
    const feeAmount = s?.fee?.amount;
    const price = typeof feeAmount === "number" ? `${feeAmount} TOKEN` : s?.price || "—";
    return {
      id: String(item?._id ?? item?.id ?? idx + 1),
      name,
      description: desc,
      creator: creatorAddr ? `${creatorAddr.slice(0, 6)}…${creatorAddr.slice(-4)}` : "Unknown",
      creatorAvatar: "/api/placeholder/40/40",
      category,
      performance: "New",
      performanceValue: 0,
      risk: "Medium",
      price,
      priceUSD: "",
      rating: 0,
      users: 0,
      totalValue: "$0",
      createdAt: item?.createdAt || new Date().toISOString(),
      tags: (s?.triggers?.map((t: any) => t?.type).filter(Boolean) as string[]) || [],
      verified: true,
    };
  }

  // Mock data - in a real app, this would come from your backend
  const mockStrategies: Strategy[] = [
    {
      id: "1",
      name: "DeFi Yield Maximizer",
      description:
        "Automatically compounds yields across multiple DeFi protocols for maximum returns.",
      creator: "CryptoAlpha",
      creatorAvatar: "/api/placeholder/40/40",
      category: "Yield Farming",
      performance: "+127.3%",
      performanceValue: 127.3,
      risk: "Medium",
      price: "0.5 ETH",
      priceUSD: "$1,250",
      rating: 4.8,
      users: 1240,
      totalValue: "$2.4M",
      createdAt: "2024-01-15",
      tags: ["DeFi", "Yield", "Auto-compound"],
      verified: true,
    },
    {
      id: "2",
      name: "Arbitrage Hunter",
      description:
        "Exploits price differences across exchanges for consistent, low-risk profits.",
      creator: "QuantTrader",
      creatorAvatar: "/api/placeholder/40/40",
      category: "Arbitrage",
      performance: "+89.1%",
      performanceValue: 89.1,
      risk: "Low",
      price: "0.3 ETH",
      priceUSD: "$750",
      rating: 4.9,
      users: 856,
      totalValue: "$1.8M",
      createdAt: "2024-02-01",
      tags: ["Arbitrage", "Low-risk", "CEX-DEX"],
      verified: true,
    },
    {
      id: "3",
      name: "Momentum Scalper",
      description:
        "High-frequency trading strategy that captures small price movements.",
      creator: "TechAnalyst",
      creatorAvatar: "/api/placeholder/40/40",
      category: "Scalping",
      performance: "+156.7%",
      performanceValue: 156.7,
      risk: "High",
      price: "0.8 ETH",
      priceUSD: "$2,000",
      rating: 4.6,
      users: 634,
      totalValue: "$3.1M",
      createdAt: "2024-01-10",
      tags: ["Scalping", "High-frequency", "Technical"],
      verified: false,
    },
    {
      id: "4",
      name: "Grid Trading Bot",
      description:
        "Places buy and sell orders at predetermined intervals to profit from volatility.",
      creator: "GridMaster",
      creatorAvatar: "/api/placeholder/40/40",
      category: "Grid Trading",
      performance: "+65.4%",
      performanceValue: 65.4,
      risk: "Medium",
      price: "0.25 ETH",
      priceUSD: "$625",
      rating: 4.3,
      users: 445,
      totalValue: "$890K",
      createdAt: "2024-03-01",
      tags: ["Grid", "Volatility", "Range-bound"],
      verified: true,
    },
    {
      id: "5",
      name: "Mean Reversion Strategy",
      description:
        "Identifies oversold/overbought conditions and trades accordingly.",
      creator: "StatArb",
      creatorAvatar: "/api/placeholder/40/40",
      category: "Mean Reversion",
      performance: "+42.8%",
      performanceValue: 42.8,
      risk: "Low",
      price: "0.2 ETH",
      priceUSD: "$500",
      rating: 4.4,
      users: 323,
      totalValue: "$650K",
      createdAt: "2024-02-15",
      tags: ["Statistical", "Reversion", "Contrarian"],
      verified: true,
    },
    {
      id: "6",
      name: "NFT Floor Sweeper",
      description:
        "Automated NFT floor price buying strategy with rarity analysis.",
      creator: "NFTGuru",
      creatorAvatar: "/api/placeholder/40/40",
      category: "NFT",
      performance: "+203.1%",
      performanceValue: 203.1,
      risk: "High",
      price: "1.2 ETH",
      priceUSD: "$3,000",
      rating: 4.7,
      users: 189,
      totalValue: "$1.2M",
      createdAt: "2024-01-20",
      tags: ["NFT", "Floor", "Rarity"],
      verified: false,
    },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data: any = await listStrategies();
        const cards = Array.isArray(data) ? data.map((it, i) => mapApiToCard(it, i)) : [];
        setStrategies(cards);
        setFilteredStrategies(cards);
      } catch (e) {
        setStrategies([]);
        setFilteredStrategies([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load purchased strategy IDs for the signed-in user
  useEffect(() => {
    const loadPurchases = async () => {
      try {
        if (!user?.walletAddress) {
          setPurchasedIds(new Set());
          return;
        }
        const res: any = await getUserPurchases(user.walletAddress);
        const arr = res?.data?.purchases ?? res?.purchases ?? res ?? [];
        const ids = (Array.isArray(arr) ? arr : [])
          .map((p: any) =>
            String(
              p?.strategyId ??
                p?.strategy_id ??
                p?.strategy?._id ??
                p?.strategy?.id ??
                p?.strategy ??
                p?.id ??
                ""
            )
          )
          .filter(Boolean);
        setPurchasedIds(new Set(ids));
      } catch {
        setPurchasedIds(new Set());
      }
    };
    loadPurchases();
  }, [user?.walletAddress]);

  useEffect(() => {
    let filtered = strategies.filter((strategy) => {
      const matchesSearch =
        strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.creator.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || strategy.category === selectedCategory;
      const matchesRisk =
        selectedRisk === "all" || strategy.risk === selectedRisk;

      return matchesSearch && matchesCategory && matchesRisk;
    });

    // Sort strategies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "performance":
          return b.performanceValue - a.performanceValue;
        case "rating":
          return b.rating - a.rating;
        case "users":
          return b.users - a.users;
        case "price":
          return parseFloat(a.price) - parseFloat(b.price);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredStrategies(filtered);
  }, [strategies, searchTerm, selectedCategory, selectedRisk, sortBy]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "High":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handlePurchase = (strategyId: string) => {
    if (!user) {
      alert("Please sign in to purchase strategies");
      return;
    }
    onPurchase(strategyId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/4"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4"
                >
                  <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
                  <div className="h-32 bg-neutral-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Strategy Marketplace
          </h1>
          <p className="text-gray-300">
            Discover and deploy proven trading strategies from the community
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search strategies..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Yield Farming">Yield Farming</SelectItem>
                  <SelectItem value="Arbitrage">Arbitrage</SelectItem>
                  <SelectItem value="Scalping">Scalping</SelectItem>
                  <SelectItem value="Grid Trading">Grid Trading</SelectItem>
                  <SelectItem value="Mean Reversion">Mean Reversion</SelectItem>
                  <SelectItem value="NFT">NFT</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                <SelectTrigger>
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="Low">Low Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Best Performance</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="users">Most Popular</SelectItem>
                  <SelectItem value="price">Lowest Price</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredStrategies.length} of {strategies.length}{" "}
            strategies
          </p>
        </div>

        {/* Strategy Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStrategies.map((strategy) => (
            <Card
              key={strategy.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() =>
                router.push(`/strategy/${encodeURIComponent(strategy.id)}`)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/strategy/${encodeURIComponent(strategy.id)}`);
                }
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={strategy.creatorAvatar}
                        alt={strategy.creator}
                      />
                      <AvatarFallback>
                        {strategy.creator.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">
                          {strategy.name}
                        </CardTitle>
                        {strategy.verified && (
                          <Shield className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        by {strategy.creator}
                      </p>
                    </div>
                  </div>
                  <Badge className={getRiskColor(strategy.risk)}>
                    {strategy.risk}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {strategy.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      <span>Performance</span>
                    </div>
                    <p className="font-semibold text-green-600">
                      {strategy.performance}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <BarChart3 className="w-4 h-4" />
                      <span>Total Value</span>
                    </div>
                    <p className="font-semibold">{strategy.totalValue}</p>
                  </div>
                </div>

                {/* Rating and Users */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{strategy.rating}</span>
                    <span className="text-gray-400">
                      ({strategy.users} users)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(strategy.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {strategy.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Price and Purchase */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-semibold">{strategy.price}</p>
                      <p className="text-sm text-gray-400">
                        {strategy.priceUSD}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {strategy.category}
                    </Badge>
                  </div>
                  <Button
                    style={{ background: "rgb(255, 122, 0)" }}
                    className="w-full bg-orange-500 to-amber-600 text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePurchase(strategy.id);
                    }}
                    disabled={purchasedIds.has(String(strategy.id))}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    {purchasedIds.has(String(strategy.id)) ? "Purchased" : "Purchase"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStrategies.length === 0 && !loading && (
          <div className="text-center py-12">
            <Alert className="max-w-md mx-auto">
              <AlertDescription>
                No strategies found matching your filters. Try adjusting your
                search criteria.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
