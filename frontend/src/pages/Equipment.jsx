import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Tractor, Car, Plus, Pencil, Trash2, Eye, Search, Cog } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    equipment_type: "tractor",
    make: "",
    model: "",
    year: "",
    serial_number: "",
    current_hours: "",
    current_mileage: "",
    notes: "",
    image_url: ""
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`);
      setEquipment(response.data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast.error("Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        current_hours: formData.current_hours ? parseFloat(formData.current_hours) : 0,
        current_mileage: formData.current_mileage ? parseFloat(formData.current_mileage) : 0,
      };

      if (selectedEquipment) {
        await axios.put(`${API}/equipment/${selectedEquipment.id}`, payload);
        toast.success("Equipment updated successfully");
      } else {
        await axios.post(`${API}/equipment`, payload);
        toast.success("Equipment added successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchEquipment();
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast.error("Failed to save equipment");
    }
  };

  const handleDelete = async () => {
    if (!selectedEquipment) return;
    try {
      await axios.delete(`${API}/equipment/${selectedEquipment.id}`);
      toast.success("Equipment deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedEquipment(null);
      fetchEquipment();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment");
    }
  };

  const openEditDialog = (equip) => {
    setSelectedEquipment(equip);
    setFormData({
      name: equip.name,
      equipment_type: equip.equipment_type,
      make: equip.make || "",
      model: equip.model || "",
      year: equip.year?.toString() || "",
      serial_number: equip.serial_number || "",
      current_hours: equip.current_hours?.toString() || "",
      current_mileage: equip.current_mileage?.toString() || "",
      notes: equip.notes || "",
      image_url: equip.image_url || ""
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setSelectedEquipment(null);
    resetForm();
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      equipment_type: "tractor",
      make: "",
      model: "",
      year: "",
      serial_number: "",
      current_hours: "",
      current_mileage: "",
      notes: "",
      image_url: ""
    });
    setSelectedEquipment(null);
  };

  const filteredEquipment = equipment.filter((e) => {
    const matchesSearch = 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || e.equipment_type === filterType;
    return matchesSearch && matchesType;
  });

  const getEquipmentIcon = (type) => {
    switch (type) {
      case "tractor":
        return <Tractor className="h-6 w-6" />;
      case "vehicle":
        return <Car className="h-6 w-6" />;
      default:
        return <Cog className="h-6 w-6" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="equipment-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="equipment-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Equipment
          </h1>
          <p className="text-slate-600 mt-1">Manage your tractors, vehicles, and other farm equipment</p>
        </div>
        <Button 
          onClick={openAddDialog}
          className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-6 font-bold uppercase tracking-wider btn-industrial"
          data-testid="add-equipment-btn"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-2 border-slate-300 bg-slate-50"
            data-testid="equipment-search"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48 h-12 border-2 border-slate-300 bg-slate-50" data-testid="equipment-type-filter">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="tractor">Tractors</SelectItem>
            <SelectItem value="vehicle">Vehicles</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="empty-state" data-testid="equipment-empty">
          <Tractor className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Equipment Found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm || filterType !== "all" 
              ? "Try adjusting your search or filters" 
              : "Add your first piece of equipment to get started"}
          </p>
          {!searchTerm && filterType === "all" && (
            <Button onClick={openAddDialog} className="btn-industrial bg-slate-900 text-white" data-testid="add-first-equipment-btn">
              <Plus className="h-5 w-5 mr-2" />
              Add Equipment
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="equipment-grid">
          {filteredEquipment.map((equip) => (
            <Card 
              key={equip.id} 
              className="equipment-card border-2 border-slate-200 overflow-hidden"
              data-testid={`equipment-card-${equip.id}`}
            >
              <div className={`h-2 ${equip.equipment_type === "tractor" ? "bg-green-500" : equip.equipment_type === "vehicle" ? "bg-blue-500" : "bg-slate-500"}`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${equip.equipment_type === "tractor" ? "bg-green-100 text-green-600" : equip.equipment_type === "vehicle" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"}`}>
                    {getEquipmentIcon(equip.equipment_type)}
                  </div>
                  <Badge className={`${getTypeBadgeClass(equip.equipment_type)} uppercase text-xs font-bold`}>
                    {equip.equipment_type}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-1">{equip.name}</h3>
                <p className="text-slate-600 mb-4">
                  {equip.make} {equip.model} {equip.year && `(${equip.year})`}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  {equip.equipment_type === "tractor" && equip.current_hours > 0 && (
                    <div>
                      <span className="text-slate-500 uppercase text-xs font-bold tracking-wider">Hours</span>
                      <p className="font-mono font-medium text-lg">{equip.current_hours.toLocaleString()}</p>
                    </div>
                  )}
                  {equip.current_mileage > 0 && (
                    <div>
                      <span className="text-slate-500 uppercase text-xs font-bold tracking-wider">Mileage</span>
                      <p className="font-mono font-medium text-lg">{equip.current_mileage.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={`/equipment/${equip.id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-2 border-slate-300 hover:border-slate-900" data-testid={`view-equipment-${equip.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="border-2 border-slate-300 hover:border-slate-900"
                    onClick={() => openEditDialog(equip)}
                    data-testid={`edit-equipment-${equip.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="border-2 border-red-300 hover:border-red-600 hover:bg-red-50 text-red-600"
                    onClick={() => {
                      setSelectedEquipment(equip);
                      setDeleteDialogOpen(true);
                    }}
                    data-testid={`delete-equipment-${equip.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {selectedEquipment ? "Edit Equipment" : "Add Equipment"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="equipment-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="e.g., John Deere 8R"
                  data-testid="equipment-name-input"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-sm font-bold uppercase tracking-wider">Type *</Label>
                <Select value={formData.equipment_type} onValueChange={(v) => setFormData({ ...formData, equipment_type: v })}>
                  <SelectTrigger className="h-12 border-2 border-slate-300 bg-slate-50" data-testid="equipment-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tractor">Tractor</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year" className="text-sm font-bold uppercase tracking-wider">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="2024"
                  data-testid="equipment-year-input"
                />
              </div>
              <div>
                <Label htmlFor="make" className="text-sm font-bold uppercase tracking-wider">Make</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="John Deere"
                  data-testid="equipment-make-input"
                />
              </div>
              <div>
                <Label htmlFor="model" className="text-sm font-bold uppercase tracking-wider">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="8R 410"
                  data-testid="equipment-model-input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="serial" className="text-sm font-bold uppercase tracking-wider">Serial Number</Label>
                <Input
                  id="serial"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="1RW8410RXXX123456"
                  data-testid="equipment-serial-input"
                />
              </div>
              <div>
                <Label htmlFor="hours" className="text-sm font-bold uppercase tracking-wider">Current Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.1"
                  value={formData.current_hours}
                  onChange={(e) => setFormData({ ...formData, current_hours: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="1250"
                  data-testid="equipment-hours-input"
                />
              </div>
              <div>
                <Label htmlFor="mileage" className="text-sm font-bold uppercase tracking-wider">Current Mileage</Label>
                <Input
                  id="mileage"
                  type="number"
                  step="0.1"
                  value={formData.current_mileage}
                  onChange={(e) => setFormData({ ...formData, current_mileage: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="45000"
                  data-testid="equipment-mileage-input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes" className="text-sm font-bold uppercase tracking-wider">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border-2 border-slate-300 bg-slate-50"
                  placeholder="Any additional notes..."
                  rows={3}
                  data-testid="equipment-notes-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-2">
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 btn-industrial" data-testid="equipment-submit-btn">
                {selectedEquipment ? "Update" : "Add"} Equipment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Equipment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedEquipment?.name}</strong> and all its service records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="confirm-delete-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Equipment;
