import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Wallet, TrendingUp, User, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { WalletPopover as WalletMenu } from "./WalletHoverCard";

// Use the shared WalletPopover from WalletHoverCard to avoid duplication

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
    <header className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div
              style={{ background: "rgb(255, 122, 0)", color: "white" }}
              className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center icon-tile"
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span
              style={{ color: "rgb(255, 122, 0)" }}
              className="text-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent"
            >
              DilliFi
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                style={
                  currentView === item.id
                    ? { color: "#ff7a00" }
                    : { color: "#ffff" }
                }
                className={`transition-colors ${
                  currentView === item.id
                    ? "text-[#ff7a00] font-medium"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <WalletMenu
                user={user}
                onLogout={onLogout}
                onViewChange={onViewChange}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Button onClick={onLogin}>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
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
                          ? "bg-orange-500/10 text-orange-400 font-medium"
                          : "text-gray-300 hover:bg-neutral-800"
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
