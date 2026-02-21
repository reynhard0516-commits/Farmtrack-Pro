import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tractor, 
  Car, 
  Wrench, 
  Package, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, alertsRes, servicesRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/dashboard/alerts`),
        axios.get(`${API}/dashboard/recent-services`)
      ]);
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
      setRecentServices(servicesRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Overview of your farm equipment and services</p>
        </div>
        <Link to="/equipment">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-6 font-bold uppercase tracking-wider btn-industrial" data-testid="add-equipment-btn">
            Add Equipment
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="stats-grid">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Tractor className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tractors</p>
                <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {stats?.tractors || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vehicles</p>
                <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {stats?.vehicles || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Services</p>
                <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {stats?.total_services || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Low Stock</p>
                <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {stats?.low_stock_filters || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-slate-200">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="flex items-center gap-2 text-lg uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alerts & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p className="font-medium">All clear! No alerts at this time.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100" data-testid="alerts-list">
                {alerts.slice(0, 5).map((alert, index) => (
                  <div 
                    key={index}
                    className={`p-4 ${
                      alert.severity === "high" ? "alert-high" : 
                      alert.severity === "medium" ? "alert-medium" : "alert-low"
                    }`}
                    data-testid={`alert-item-${index}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {alert.type === "overdue" && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
                        {alert.type === "upcoming" && <Clock className="h-5 w-5 text-orange-600 mt-0.5" />}
                        {alert.type === "low_stock" && <Package className="h-5 w-5 text-orange-600 mt-0.5" />}
                        <div>
                          <p className="font-medium text-slate-900">{alert.message}</p>
                          {alert.due_date && (
                            <p className="text-sm text-slate-500 mt-1">
                              Due: {format(new Date(alert.due_date), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={alert.severity === "high" ? "destructive" : "secondary"}
                        className="uppercase text-xs"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Services */}
        <Card className="border-2 border-slate-200">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="flex items-center gap-2 text-lg uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              <Wrench className="h-5 w-5 text-orange-500" />
              Recent Services
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentServices.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Wrench className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p className="font-medium">No service records yet.</p>
                <Link to="/services">
                  <Button variant="outline" className="mt-4" data-testid="add-first-service-btn">
                    Add First Service
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100" data-testid="recent-services-list">
                {recentServices.slice(0, 5).map((service, index) => (
                  <div key={service.id} className="p-4 hover:bg-slate-50 transition-colors" data-testid={`service-item-${index}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${service.equipment_type === "tractor" ? "bg-green-100" : "bg-blue-100"}`}>
                          {service.equipment_type === "tractor" ? (
                            <Tractor className="h-4 w-4 text-green-600" />
                          ) : (
                            <Car className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{service.equipment_name}</p>
                          <p className="text-sm text-slate-500">{service.service_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {format(new Date(service.service_date), "MMM d, yyyy")}
                        </p>
                        {service.cost && (
                          <p className="text-sm text-slate-500">${service.cost.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recentServices.length > 0 && (
              <div className="p-4 border-t border-slate-100">
                <Link to="/services">
                  <Button variant="outline" className="w-full" data-testid="view-all-services-btn">
                    View All Services
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={`stat-card ${stats?.overdue_services_count > 0 ? "border-red-500" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overdue</p>
                <p className={`text-3xl font-bold ${stats?.overdue_services_count > 0 ? "text-red-600" : "text-slate-900"}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {stats?.overdue_services_count || 0}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${stats?.overdue_services_count > 0 ? "text-red-500 status-badge-pulse" : "text-slate-300"}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`stat-card ${stats?.upcoming_services_count > 0 ? "border-orange-500" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Upcoming</p>
                <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {stats?.upcoming_services_count || 0}
                </p>
              </div>
              <Calendar className={`h-8 w-8 ${stats?.upcoming_services_count > 0 ? "text-orange-500" : "text-slate-300"}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Reminders</p>
                <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {stats?.active_reminders || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
