import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Wallet, TrendingUp, User, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { WalletHoverCard } from "./WalletHoverCard";

export function WalletPopover({ user, onLogout, onViewChange }: any) {
  const [open, setOpen] = useState(false);

  const shorten = (addr?: string, n = 4) => {
    if (!addr) return "";
    return addr.slice(0, 2 + n) + "…" + addr.slice(-n);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 rounded-full px-3 flex items-center gap-2"
          onMouseEnter={() => setOpen(true)}
        >
          <Wallet className="w-4 h-4" />
          <span className="font-medium">
            {shorten(user.walletAddress || user.id, 6)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <WalletHoverCard
          address={user.walletAddress || user.id}
          onDisconnect={onLogout}
        />
        <div className="mt-3 pt-3 border-t flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("profile")}
          >
            <User className="w-4 h-4 mr-2" /> Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("dashboard")}
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
}

export function Header({
  currentView,
  onViewChange,
  user,
  onLogin,
  onLogout,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Home", id: "home" },
    { name: "Marketplace", id: "marketplace" },
    { name: "Create Strategy", id: "create" },
    { name: "My Dashboard", id: "dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StrategyForge
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`transition-colors ${
                  currentView === item.id
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <WalletPopover
                user={user}
                onLogout={onLogout}
                onViewChange={onViewChange}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={onLogin}>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                  onClick={onLogin}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setIsOpen(false);
                      }}
                      className={`text-left py-2 px-4 rounded-lg transition-colors ${
                        currentView === item.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
