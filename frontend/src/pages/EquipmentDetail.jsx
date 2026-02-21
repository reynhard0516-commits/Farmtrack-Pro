import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tractor, 
  Car, 
  Cog, 
  ArrowLeft, 
  Wrench, 
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Package
} from "lucide-react";
import { format } from "date-fns";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [equipRes, servicesRes] = await Promise.all([
        axios.get(`${API}/equipment/${id}`),
        axios.get(`${API}/services/equipment/${id}`)
      ]);
      setEquipment(equipRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Error fetching equipment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentIcon = (type) => {
    switch (type) {
      case "tractor":
        return <Tractor className="h-8 w-8" />;
      case "vehicle":
        return <Car className="h-8 w-8" />;
      default:
        return <Cog className="h-8 w-8" />;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "tractor":
        return "badge-tractor";
      case "vehicle":
        return "badge-vehicle";
      default:
        return "badge-other";
    }
  };

  const calculateTotalCost = () => {
    return services.reduce((sum, s) => sum + (s.cost || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="equipment-detail-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-12" data-testid="equipment-not-found">
        <h2 className="text-2xl font-bold text-slate-700">Equipment Not Found</h2>
        <Link to="/equipment">
          <Button className="mt-4">Back to Equipment</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="equipment-detail">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="border-2 border-slate-300"
        data-testid="back-btn"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Equipment Header */}
      <Card className="border-2 border-slate-200 overflow-hidden">
        <div className={`h-2 ${equipment.equipment_type === "tractor" ? "bg-green-500" : equipment.equipment_type === "vehicle" ? "bg-blue-500" : "bg-slate-500"}`} />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-lg ${equipment.equipment_type === "tractor" ? "bg-green-100 text-green-600" : equipment.equipment_type === "vehicle" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"}`}>
                {getEquipmentIcon(equipment.equipment_type)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                    {equipment.name}
                  </h1>
                  <Badge className={`${getTypeBadgeClass(equipment.equipment_type)} uppercase text-xs font-bold`}>
                    {equipment.equipment_type}
                  </Badge>
                </div>
                <p className="text-lg text-slate-600">
                  {equipment.make} {equipment.model} {equipment.year && `(${equipment.year})`}
                </p>
                {equipment.serial_number && (
                  <p className="text-sm text-slate-500 font-mono mt-1">SN: {equipment.serial_number}</p>
                )}
              </div>
            </div>
            
            <Link to="/services" state={{ equipmentId: equipment.id }}>
              <Button className="bg-orange-500 text-white hover:bg-orange-600 h-12 px-6 font-bold uppercase tracking-wider btn-industrial" data-testid="add-service-btn">
                <Plus className="h-5 w-5 mr-2" />
                Add Service
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {equipment.equipment_type === "tractor" && (
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hours</p>
                  <p className="text-2xl font-bold font-mono">{equipment.current_hours?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mileage</p>
                <p className="text-2xl font-bold font-mono">{equipment.current_mileage?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Services</p>
                <p className="text-2xl font-bold font-mono">{services.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Cost</p>
                <p className="text-2xl font-bold font-mono">${calculateTotalCost().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {equipment.notes && (
        <Card className="border-2 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{equipment.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Service History */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="bg-slate-900 text-white">
          <CardTitle className="flex items-center gap-2 text-lg uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            <Wrench className="h-5 w-5 text-orange-500" />
            Service History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="p-8 text-center">
              <Wrench className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">No service records yet</p>
              <Link to="/services" state={{ equipmentId: equipment.id }}>
                <Button className="mt-4 btn-industrial bg-slate-900 text-white" data-testid="add-first-service-btn">
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Service
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100" data-testid="service-history">
              {services.sort((a, b) => new Date(b.service_date) - new Date(a.service_date)).map((service) => (
                <div key={service.id} className="p-4 hover:bg-slate-50 transition-colors" data-testid={`service-record-${service.id}`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{service.service_type}</span>
                        {service.cost && (
                          <Badge variant="outline" className="font-mono">${service.cost.toFixed(2)}</Badge>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(service.service_date), "MMM d, yyyy")}
                        </span>
                        {service.hours_at_service && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {service.hours_at_service.toLocaleString()} hrs
                          </span>
                        )}
                        {service.mileage_at_service && (
                          <span className="font-mono">{service.mileage_at_service.toLocaleString()} mi</span>
                        )}
                        {service.technician && (
                          <span>Tech: {service.technician}</span>
                        )}
                      </div>
                      {service.filters_used && service.filters_used.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          <div className="flex flex-wrap gap-1">
                            {service.filters_used.map((filter, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {filter.filter_name} x{filter.quantity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {service.next_service_date && (
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Service</p>
                        <p className="text-sm font-medium text-orange-600">
                          {format(new Date(service.next_service_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentDetail;
