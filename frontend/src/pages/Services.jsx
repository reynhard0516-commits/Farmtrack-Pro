import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Wrench, 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar as CalendarIcon,
  Search,
  Tractor,
  Car,
  Package,
  X
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Services = () => {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEquipment, setFilterEquipment] = useState("all");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [nextDatePickerOpen, setNextDatePickerOpen] = useState(false);

  const defaultFormData = {
    equipment_id: location.state?.equipmentId || "",
    service_date: new Date(),
    service_type: "",
    description: "",
    hours_at_service: "",
    mileage_at_service: "",
    cost: "",
    technician: "",
    filters_used: [],
    next_service_date: null,
    next_service_hours: "",
    next_service_mileage: "",
    notes: ""
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const serviceTypes = [
    "Oil Change",
    "Filter Replacement",
    "Inspection",
    "Tire Service",
    "Brake Service",
    "Engine Tune-up",
    "Transmission Service",
    "Hydraulic Service",
    "Electrical Repair",
    "General Maintenance",
    "Repair",
    "Other"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.equipmentId) {
      setFormData(prev => ({ ...prev, equipment_id: location.state.equipmentId }));
      setDialogOpen(true);
    }
  }, [location.state]);

  const fetchData = async () => {
    try {
      const [servicesRes, equipmentRes, filtersRes] = await Promise.all([
        axios.get(`${API}/services`),
        axios.get(`${API}/equipment`),
        axios.get(`${API}/filters`)
      ]);
      setServices(servicesRes.data);
      setEquipment(equipmentRes.data);
      setFilters(filtersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        service_date: formData.service_date.toISOString(),
        hours_at_service: formData.hours_at_service ? parseFloat(formData.hours_at_service) : null,
        mileage_at_service: formData.mileage_at_service ? parseFloat(formData.mileage_at_service) : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        next_service_date: formData.next_service_date ? formData.next_service_date.toISOString() : null,
        next_service_hours: formData.next_service_hours ? parseFloat(formData.next_service_hours) : null,
        next_service_mileage: formData.next_service_mileage ? parseFloat(formData.next_service_mileage) : null,
        filters_used: selectedFilters.map(f => ({
          filter_id: f.id,
          filter_name: f.name,
          quantity: f.quantity || 1
        }))
      };

      if (selectedService) {
        await axios.put(`${API}/services/${selectedService.id}`, payload);
        toast.success("Service record updated successfully");
      } else {
        await axios.post(`${API}/services`, payload);
        toast.success("Service record added successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service record");
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    try {
      await axios.delete(`${API}/services/${selectedService.id}`);
      toast.success("Service record deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedService(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service record");
    }
  };

  const openEditDialog = (service) => {
    setSelectedService(service);
    setFormData({
      equipment_id: service.equipment_id,
      service_date: new Date(service.service_date),
      service_type: service.service_type,
      description: service.description || "",
      hours_at_service: service.hours_at_service?.toString() || "",
      mileage_at_service: service.mileage_at_service?.toString() || "",
      cost: service.cost?.toString() || "",
      technician: service.technician || "",
      filters_used: service.filters_used || [],
      next_service_date: service.next_service_date ? new Date(service.next_service_date) : null,
      next_service_hours: service.next_service_hours?.toString() || "",
      next_service_mileage: service.next_service_mileage?.toString() || "",
      notes: service.notes || ""
    });
    setSelectedFilters(service.filters_used?.map(f => ({
      id: f.filter_id,
      name: f.filter_name,
      quantity: f.quantity
    })) || []);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setSelectedService(null);
    resetForm();
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setSelectedFilters([]);
    setSelectedService(null);
  };

  const addFilter = (filter) => {
    if (!selectedFilters.find(f => f.id === filter.id)) {
      setSelectedFilters([...selectedFilters, { ...filter, quantity: 1 }]);
    }
  };

  const removeFilter = (filterId) => {
    setSelectedFilters(selectedFilters.filter(f => f.id !== filterId));
  };

  const updateFilterQuantity = (filterId, quantity) => {
    setSelectedFilters(selectedFilters.map(f => 
      f.id === filterId ? { ...f, quantity: parseInt(quantity) || 1 } : f
    ));
  };

  const getEquipmentName = (equipmentId) => {
    const equip = equipment.find(e => e.id === equipmentId);
    return equip ? equip.name : "Unknown";
  };

  const getEquipmentType = (equipmentId) => {
    const equip = equipment.find(e => e.id === equipmentId);
    return equip?.equipment_type || "other";
  };

  const filteredServices = services.filter((s) => {
    const equipName = getEquipmentName(s.equipment_id);
    const matchesSearch = 
      equipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.technician?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEquipment = filterEquipment === "all" || s.equipment_id === filterEquipment;
    return matchesSearch && matchesEquipment;
  }).sort((a, b) => new Date(b.service_date) - new Date(a.service_date));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="services-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="services-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Service Records
          </h1>
          <p className="text-slate-600 mt-1">Track all maintenance and service history</p>
        </div>
        <Button 
          onClick={openAddDialog}
          className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-6 font-bold uppercase tracking-wider btn-industrial"
          data-testid="add-service-btn"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-2 border-slate-300 bg-slate-50"
            data-testid="service-search"
          />
        </div>
        <Select value={filterEquipment} onValueChange={setFilterEquipment}>
          <SelectTrigger className="w-full sm:w-64 h-12 border-2 border-slate-300 bg-slate-50" data-testid="equipment-filter">
            <SelectValue placeholder="Filter by equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Equipment</SelectItem>
            {equipment.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="empty-state" data-testid="services-empty">
          <Wrench className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Service Records Found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm || filterEquipment !== "all" 
              ? "Try adjusting your search or filters" 
              : "Add your first service record to track maintenance"}
          </p>
          {!searchTerm && filterEquipment === "all" && (
            <Button onClick={openAddDialog} className="btn-industrial bg-slate-900 text-white" data-testid="add-first-service-btn">
              <Plus className="h-5 w-5 mr-2" />
              Add Service
            </Button>
          )}
        </div>
      ) : (
        <Card className="border-2 border-slate-200">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100" data-testid="services-list">
              {filteredServices.map((service) => (
                <div key={service.id} className="p-4 hover:bg-slate-50 transition-colors" data-testid={`service-row-${service.id}`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${getEquipmentType(service.equipment_id) === "tractor" ? "bg-green-100" : "bg-blue-100"}`}>
                        {getEquipmentType(service.equipment_id) === "tractor" ? (
                          <Tractor className="h-5 w-5 text-green-600" />
                        ) : (
                          <Car className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">{getEquipmentName(service.equipment_id)}</span>
                          <Badge variant="outline">{service.service_type}</Badge>
                          {service.cost && (
                            <Badge className="bg-green-100 text-green-800 font-mono">${service.cost.toFixed(2)}</Badge>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(service.service_date), "MMM d, yyyy")}
                          </span>
                          {service.hours_at_service && (
                            <span>{service.hours_at_service.toLocaleString()} hrs</span>
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
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="border-2 border-slate-300 hover:border-slate-900"
                        onClick={() => openEditDialog(service)}
                        data-testid={`edit-service-${service.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="border-2 border-red-300 hover:border-red-600 hover:bg-red-50 text-red-600"
                        onClick={() => {
                          setSelectedService(service);
                          setDeleteDialogOpen(true);
                        }}
                        data-testid={`delete-service-${service.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {selectedService ? "Edit Service Record" : "Add Service Record"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="service-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Equipment *</Label>
                <Select value={formData.equipment_id} onValueChange={(v) => setFormData({ ...formData, equipment_id: v })}>
                  <SelectTrigger className="h-12 border-2 border-slate-300 bg-slate-50" data-testid="service-equipment-select">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Service Date *</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal border-2 border-slate-300 bg-slate-50",
                        !formData.service_date && "text-muted-foreground"
                      )}
                      data-testid="service-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.service_date ? format(formData.service_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.service_date}
                      onSelect={(date) => {
                        setFormData({ ...formData, service_date: date });
                        setDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Service Type *</Label>
                <Select value={formData.service_type} onValueChange={(v) => setFormData({ ...formData, service_type: v })}>
                  <SelectTrigger className="h-12 border-2 border-slate-300 bg-slate-50" data-testid="service-type-select">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-2 border-slate-300 bg-slate-50"
                  placeholder="Service details..."
                  rows={2}
                  data-testid="service-description-input"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Hours at Service</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.hours_at_service}
                  onChange={(e) => setFormData({ ...formData, hours_at_service: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="1250"
                  data-testid="service-hours-input"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Mileage at Service</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.mileage_at_service}
                  onChange={(e) => setFormData({ ...formData, mileage_at_service: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="45000"
                  data-testid="service-mileage-input"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="150.00"
                  data-testid="service-cost-input"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Technician</Label>
                <Input
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="John Smith"
                  data-testid="service-technician-input"
                />
              </div>

              {/* Filters Used */}
              <div className="col-span-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Filters Used</Label>
                <Select onValueChange={(v) => {
                  const filter = filters.find(f => f.id === v);
                  if (filter) addFilter(filter);
                }}>
                  <SelectTrigger className="h-12 border-2 border-slate-300 bg-slate-50" data-testid="add-filter-select">
                    <SelectValue placeholder="Add filter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.map((f) => (
                      <SelectItem key={f.id} value={f.id} disabled={selectedFilters.find(sf => sf.id === f.id)}>
                        {f.name} ({f.part_number}) - Stock: {f.quantity_in_stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFilters.length > 0 && (
                  <div className="mt-2 space-y-2" data-testid="selected-filters">
                    {selectedFilters.map((filter) => (
                      <div key={filter.id} className="flex items-center gap-2 p-2 bg-slate-100 rounded">
                        <Package className="h-4 w-4 text-slate-500" />
                        <span className="flex-1 font-medium">{filter.name}</span>
                        <Input
                          type="number"
                          min="1"
                          value={filter.quantity}
                          onChange={(e) => updateFilterQuantity(filter.id, e.target.value)}
                          className="w-16 h-8 border border-slate-300"
                        />
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Service */}
              <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
                <Label className="text-sm font-bold uppercase tracking-wider text-orange-600">Next Service Due</Label>
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Next Service Date</Label>
                <Popover open={nextDatePickerOpen} onOpenChange={setNextDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal border-2 border-slate-300 bg-slate-50",
                        !formData.next_service_date && "text-muted-foreground"
                      )}
                      data-testid="next-service-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.next_service_date ? format(formData.next_service_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.next_service_date}
                      onSelect={(date) => {
                        setFormData({ ...formData, next_service_date: date });
                        setNextDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">At Hours</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.next_service_hours}
                  onChange={(e) => setFormData({ ...formData, next_service_hours: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="1500"
                  data-testid="next-service-hours-input"
                />
              </div>

              <div className="col-span-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border-2 border-slate-300 bg-slate-50"
                  placeholder="Additional notes..."
                  rows={2}
                  data-testid="service-notes-input"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-2">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-slate-900 text-white hover:bg-slate-800 btn-industrial"
                disabled={!formData.equipment_id || !formData.service_type}
                data-testid="service-submit-btn"
              >
                {selectedService ? "Update" : "Add"} Service
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Service Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this service record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="confirm-delete-service-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Services;
