import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { SelfVerification } from "./SelfVerification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Plus,
  X,
  Code,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface CreateStrategyProps {
  user: any;
  onStrategyCreated: (strategy: any) => void;
}

export function CreateStrategy({
  user,
  onStrategyCreated,
}: CreateStrategyProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    riskLevel: "",
    price: "",
    priceToken: "ETH",
    priceTokenOther: "",
    tags: [] as string[],
    code: "",
    parameters: [] as {
      name: string;
      type: string;
      defaultValue: string;
      description: string;
    }[],
  });

  const [currentTag, setCurrentTag] = useState("");
  const [success, setSuccess] = useState(false);

  const [currentParam, setCurrentParam] = useState({
    name: "",
    type: "number",
    defaultValue: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [isVerified, setIsVerified] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState<string | null>(null);

  const categories = [
    "Yield Farming",
    "Arbitrage",
    "Scalping",
    "Grid Trading",
    "Mean Reversion",
    "Momentum",
    "Market Making",
    "Options",
    "NFT",
    "Other",
  ];

  const riskLevels = ["Low", "Medium", "High"];
  const paramTypes = ["number", "string", "boolean", "percentage"];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const addTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addParameter = () => {
    if (currentParam.name && currentParam.defaultValue) {
      setFormData((prev) => ({
        ...prev,
        parameters: [...prev.parameters, { ...currentParam }],
      }));
      setCurrentParam({
        name: "",
        type: "number",
        defaultValue: "",
        description: "",
      });
    }
  };

  const removeParameter = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Strategy name is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.category) return "Category is required";
    if (!formData.riskLevel) return "Risk level is required";
    if (!formData.price.trim()) return "Price is required";
    if (!formData.priceToken) return "Price token is required";
    if (formData.priceToken === "OTHER" && !formData.priceTokenOther.trim())
      return "Please provide a token symbol";
    if (!formData.code.trim()) return "Strategy code is required";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Please sign in to create a strategy");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!isVerified) {
      setError(
        "Identity verification required: please verify age (18+) before creating a strategy."
      );
      return;
    }

    if (!isVerified) {
      setError(
        "Identity verification required: please verify age (18+) before creating a strategy."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Local mock: create strategy object without Supabase
      await new Promise((r) => setTimeout(r, 500));
      const strategyId = "strategy_" + Date.now();
      const strategy = {
        id: strategyId,
        ...formData,
        priceToken:
          formData.priceToken === "OTHER"
            ? formData.priceTokenOther
            : formData.priceToken,
        creator: user.name || user.email,
        creatorId: user.id,
        createdAt: new Date().toISOString(),
        status: "active",
        performance: "+0.0%",
        users: 0,
        totalValue: "$0",
      };

      setSuccess(true);
      onStrategyCreated(strategy);

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        riskLevel: "",
        price: "",
        priceToken: "ETH",
        priceTokenOther: "",
        tags: [],
        code: "",
        parameters: [],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to create and deploy trading strategies.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  function handleVerified(result?: { address?: string }) {
    setIsVerified(true);
    if (result?.address) {
      setVerifiedAddress(result.address);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Trading Strategy
          </h1>
          <p className="text-gray-600">
            Build and deploy your own automated trading strategy
          </p>
        </div>
        {/* <SelfVerification1 /> */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Verification status:{" "}
            {isVerified ? (
              <span className="text-green-600">
                Verified
                {verifiedAddress
                  ? ` (${verifiedAddress.slice(0, 6)}…${verifiedAddress.slice(
                      -4
                    )})`
                  : ""}
              </span>
            ) : (
              <span className="text-red-600">Not verified</span>
            )}
          </div>
          <SelfVerification
            onVerified={handleVerified}
            userAddress={user?.walletAddress ?? null}
          />
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Strategy created successfully! It's now available in the
              marketplace.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="code">Strategy Code</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide basic details about your trading strategy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Strategy Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Advanced DeFi Yield Strategy"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <div className="flex gap-2">
                        <Input
                          id="price"
                          name="price"
                          placeholder="e.g., 0.5"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                        <Select
                          value={formData.priceToken}
                          onValueChange={(value) =>
                            handleSelectChange("priceToken", value)
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Token" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ETH">ETH</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="DAI">DAI</SelectItem>
                            <SelectItem value="BTC">BTC</SelectItem>
                            <SelectItem value="OTHER">Other...</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.priceToken === "OTHER" && (
                        <div className="mt-2">
                          <Label htmlFor="priceTokenOther">
                            Custom token symbol
                          </Label>
                          <Input
                            id="priceTokenOther"
                            name="priceTokenOther"
                            placeholder="e.g., ARB, OP, PEPE"
                            value={formData.priceTokenOther}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe what your strategy does, its approach, and expected performance..."
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleSelectChange("category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Risk Level</Label>
                      <Select
                        value={formData.riskLevel}
                        onValueChange={(value) =>
                          handleSelectChange("riskLevel", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          {riskLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        placeholder="Add a tag..."
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center space-x-1"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parameters">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Strategy Parameters</span>
                  </CardTitle>
                  <CardDescription>
                    Define configurable parameters that users can adjust
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="param-name">Parameter Name</Label>
                      <Input
                        id="param-name"
                        placeholder="e.g., stopLoss"
                        value={currentParam.name}
                        onChange={(e) =>
                          setCurrentParam((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={currentParam.type}
                        onValueChange={(value) =>
                          setCurrentParam((prev) => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paramTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="param-default">Default Value</Label>
                      <Input
                        id="param-default"
                        placeholder="e.g., 5"
                        value={currentParam.defaultValue}
                        onChange={(e) =>
                          setCurrentParam((prev) => ({
                            ...prev,
                            defaultValue: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="param-description">Description</Label>
                      <Input
                        id="param-description"
                        placeholder="Brief description"
                        value={currentParam.description}
                        onChange={(e) =>
                          setCurrentParam((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button
                        type="button"
                        onClick={addParameter}
                        variant="outline"
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Parameter
                      </Button>
                    </div>
                  </div>

                  {formData.parameters.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Configured Parameters</h4>
                      {formData.parameters.map((param, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white border rounded-lg"
                        >
                          <div>
                            <span className="font-medium">{param.name}</span>
                            <span className="text-gray-500 ml-2">
                              ({param.type})
                            </span>
                            <span className="text-gray-600 ml-2">
                              = {param.defaultValue}
                            </span>
                            {param.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {param.description}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeParameter(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>Strategy Implementation</span>
                  </CardTitle>
                  <CardDescription>
                    Write your trading strategy logic in JavaScript/TypeScript
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label htmlFor="code">Strategy Code</Label>
                    <Textarea
                      id="code"
                      name="code"
                      placeholder={`// Example strategy structure
async function executeStrategy(params) {
  // Your trading logic here
  const { stopLoss, takeProfit, amount } = params;
  
  // Market analysis
  const marketData = await getMarketData();
  
  // Trading decision
  if (shouldBuy(marketData)) {
    return await placeBuyOrder(amount);
  }
  
  return null;
}

// Helper functions
function shouldBuy(data) {
  // Your buy logic
  return data.price < data.support;
}

async function placeBuyOrder(amount) {
  // Order execution logic
  return { success: true, orderId: 'order_123' };
}`}
                      rows={20}
                      value={formData.code}
                      onChange={handleInputChange}
                      className="font-mono text-sm"
                      required
                    />
                    <p className="text-sm text-gray-600">
                      Your strategy should export an{" "}
                      <code>executeStrategy</code> function that accepts the
                      configured parameters.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Strategy...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Create Strategy
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
