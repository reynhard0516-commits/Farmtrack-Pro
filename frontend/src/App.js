import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { 
  Tractor, 
  Car, 
  Wrench, 
  Package, 
  Bell, 
  LayoutDashboard, 
  Menu, 
  X 
} from "lucide-react";

// Pages
import Dashboard from "@/pages/Dashboard";
import Equipment from "@/pages/Equipment";
import EquipmentDetail from "@/pages/EquipmentDetail";
import Services from "@/pages/Services";
import Filters from "@/pages/Filters";
import Reminders from "@/pages/Reminders";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/equipment", icon: Tractor, label: "Equipment" },
    { path: "/services", icon: Wrench, label: "Services" },
    { path: "/filters", icon: Package, label: "Filters" },
    { path: "/reminders", icon: Bell, label: "Reminders" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="app-header" data-testid="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded">
                <Tractor className="h-6 w-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight uppercase" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                FarmTrack Pro
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" data-testid="desktop-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`nav-link flex items-center gap-2 px-4 py-2 text-sm font-medium text-white uppercase tracking-wider ${
                    isActive(item.path) ? "active" : ""
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div 
        className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}
        data-testid="mobile-nav-drawer"
      >
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded">
              <Tractor className="h-6 w-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg uppercase" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              FarmTrack Pro
            </span>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              className={`flex items-center gap-3 px-4 py-3 rounded text-white font-medium ${
                isActive(item.path) ? "bg-orange-500" : "hover:bg-slate-700"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/filters" element={<Filters />} />
            <Route path="/reminders" element={<Reminders />} />
          </Routes>
        </main>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
