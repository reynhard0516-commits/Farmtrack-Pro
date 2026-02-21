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
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Filters = () => {
  const [filters, setFilters] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filterTypes = [
    "Oil Filter",
    "Air Filter",
    "Fuel Filter",
    "Hydraulic Filter",
    "Transmission Filter",
    "Cabin Filter",
    "Other"
  ];

  const [formData, setFormData] = useState({
    name: "",
    part_number: "",
    filter_type: "",
    compatible_equipment: [],
    quantity_in_stock: "",
    reorder_level: "5",
    unit_price: "",
    supplier: "",
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filtersRes, equipmentRes] = await Promise.all([
        axios.get(`${API}/filters`),
        axios.get(`${API}/equipment`)
      ]);
      setFilters(filtersRes.data);
      setEquipment(equipmentRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load filters");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity_in_stock: parseInt(formData.quantity_in_stock) || 0,
        reorder_level: parseInt(formData.reorder_level) || 5,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
      };

      if (selectedFilter) {
        await axios.put(`${API}/filters/${selectedFilter.id}`, payload);
        toast.success("Filter updated successfully");
      } else {
        await axios.post(`${API}/filters`, payload);
        toast.success("Filter added successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving filter:", error);
      toast.error("Failed to save filter");
    }
  };

  const handleDelete = async () => {
    if (!selectedFilter) return;
    try {
      await axios.delete(`${API}/filters/${selectedFilter.id}`);
      toast.success("Filter deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedFilter(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting filter:", error);
      toast.error("Failed to delete filter");
    }
  };

  const openEditDialog = (filter) => {
    setSelectedFilter(filter);
    setFormData({
      name: filter.name,
      part_number: filter.part_number,
      filter_type: filter.filter_type,
      compatible_equipment: filter.compatible_equipment || [],
      quantity_in_stock: filter.quantity_in_stock?.toString() || "",
      reorder_level: filter.reorder_level?.toString() || "5",
      unit_price: filter.unit_price?.toString() || "",
      supplier: filter.supplier || "",
      notes: filter.notes || ""
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setSelectedFilter(null);
    resetForm();
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      part_number: "",
      filter_type: "",
      compatible_equipment: [],
      quantity_in_stock: "",
      reorder_level: "5",
      unit_price: "",
      supplier: "",
      notes: ""
    });
    setSelectedFilter(null);
  };

  const isLowStock = (filter) => {
    return filter.quantity_in_stock <= filter.reorder_level;
  };

  const filteredFilters = filters.filter((f) => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || f.filter_type === filterType;
    return matchesSearch && matchesType;
  });

  const lowStockCount = filters.filter(isLowStock).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="filters-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="filters-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Filter Inventory
          </h1>
          <p className="text-slate-600 mt-1">Manage filter stock and part numbers</p>
        </div>
        <Button 
          onClick={openAddDialog}
          className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-6 font-bold uppercase tracking-wider btn-industrial"
          data-testid="add-filter-btn"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Filter
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 flex items-center gap-3" data-testid="low-stock-alert">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
          <div>
            <p className="font-bold text-orange-800">Low Stock Alert</p>
            <p className="text-orange-700">{lowStockCount} filter(s) are at or below reorder level</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search filters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-2 border-slate-300 bg-slate-50"
            data-testid="filter-search"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48 h-12 border-2 border-slate-300 bg-slate-50" data-testid="filter-type-filter">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {filterTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filters Grid */}
      {filteredFilters.length === 0 ? (
        <div className="empty-state" data-testid="filters-empty">
          <Package className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Filters Found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm || filterType !== "all" 
              ? "Try adjusting your search or filters" 
              : "Add your first filter to track inventory"}
          </p>
          {!searchTerm && filterType === "all" && (
            <Button onClick={openAddDialog} className="btn-industrial bg-slate-900 text-white" data-testid="add-first-filter-btn">
              <Plus className="h-5 w-5 mr-2" />
              Add Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="filters-grid">
          {filteredFilters.map((filter) => (
            <Card 
              key={filter.id} 
              className={`equipment-card border-2 overflow-hidden ${isLowStock(filter) ? "border-orange-400" : "border-slate-200"}`}
              data-testid={`filter-card-${filter.id}`}
            >
              <div className={`h-2 ${isLowStock(filter) ? "bg-orange-500" : "bg-slate-500"}`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isLowStock(filter) ? "bg-orange-100" : "bg-slate-100"}`}>
                    <Package className={`h-6 w-6 ${isLowStock(filter) ? "text-orange-600" : "text-slate-600"}`} />
                  </div>
                  {isLowStock(filter) && (
                    <Badge className="bg-orange-500 text-white uppercase text-xs font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Low Stock
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-1">{filter.name}</h3>
                <p className="text-sm font-mono text-slate-600 mb-2">{filter.part_number}</p>
                <Badge variant="outline" className="mb-4">{filter.filter_type}</Badge>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-slate-500 uppercase text-xs font-bold tracking-wider">In Stock</span>
                    <p className={`font-mono font-bold text-2xl ${isLowStock(filter) ? "text-orange-600" : "text-slate-900"}`}>
                      {filter.quantity_in_stock}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-xs font-bold tracking-wider">Reorder At</span>
                    <p className="font-mono font-medium text-lg text-slate-600">{filter.reorder_level}</p>
                  </div>
                  {filter.unit_price && (
                    <div>
                      <span className="text-slate-500 uppercase text-xs font-bold tracking-wider">Unit Price</span>
                      <p className="font-mono font-medium text-lg">${filter.unit_price.toFixed(2)}</p>
                    </div>
                  )}
                  {filter.supplier && (
                    <div>
                      <span className="text-slate-500 uppercase text-xs font-bold tracking-wider">Supplier</span>
                      <p className="text-sm truncate">{filter.supplier}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-2 border-slate-300 hover:border-slate-900"
                    onClick={() => openEditDialog(filter)}
                    data-testid={`edit-filter-${filter.id}`}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="border-2 border-red-300 hover:border-red-600 hover:bg-red-50 text-red-600"
                    onClick={() => {
                      setSelectedFilter(filter);
                      setDeleteDialogOpen(true);
                    }}
                    data-testid={`delete-filter-${filter.id}`}
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
              {selectedFilter ? "Edit Filter" : "Add Filter"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="filter-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Filter Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="e.g., Engine Oil Filter"
                  data-testid="filter-name-input"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Part Number *</Label>
                <Input
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  required
                  className="h-12 border-2 border-slate-300 bg-slate-50 font-mono"
                  placeholder="RE504836"
                  data-testid="filter-part-number-input"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Filter Type *</Label>
                <Select value={formData.filter_type} onValueChange={(v) => setFormData({ ...formData, filter_type: v })}>
                  <SelectTrigger className="h-12 border-2 border-slate-300 bg-slate-50" data-testid="filter-type-select">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Quantity in Stock *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantity_in_stock}
                  onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })}
                  required
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="10"
                  data-testid="filter-quantity-input"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Reorder Level</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="5"
                  data-testid="filter-reorder-input"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Unit Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="24.99"
                  data-testid="filter-price-input"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Supplier</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="h-12 border-2 border-slate-300 bg-slate-50"
                  placeholder="John Deere Parts"
                  data-testid="filter-supplier-input"
                />
              </div>

              <div className="col-span-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border-2 border-slate-300 bg-slate-50"
                  placeholder="Any additional notes..."
                  rows={2}
                  data-testid="filter-notes-input"
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
                disabled={!formData.name || !formData.part_number || !formData.filter_type}
                data-testid="filter-submit-btn"
              >
                {selectedFilter ? "Update" : "Add"} Filter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Filter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedFilter?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="confirm-delete-filter-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Filters;
