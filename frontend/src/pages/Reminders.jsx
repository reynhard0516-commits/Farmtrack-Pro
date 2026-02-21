import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Bell, 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  Calendar as CalendarIcon,
  Clock,
  Tractor,
  Car,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { format, isPast, isFuture, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const reminderTypes = ["date_based", "hours_based", "mileage_based"];

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
    "General Maintenance"
  ];

  const [formData, setFormData] = useState({
    equipment_id: "",
    reminder_type: "date_based",
    service_type: "",
    due_date: null,
    due_hours: "",
    due_mileage: "",
    is_active: true,
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [remindersRes, equipmentRes] = await Promise.all([
        axios.get(`${API}/reminders`),
        axios.get(`${API}/equipment`)
      ]);
      setReminders(remindersRes.data);
      setEquipment(equipmentRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
        due_hours: formData.due_hours ? parseFloat(formData.due_hours) : null,
        due_mileage: formData.due_mileage ? parseFloat(formData.due_mileage) : null,
      };

      if (selectedReminder) {
        await axios.put(`${API}/reminders/${selectedReminder.id}`, payload);
        toast.success("Reminder updated successfully");
      } else {
        await axios.post(`${API}/reminders`, payload);
        toast.success("Reminder created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving reminder:", error);
      toast.error("Failed to save reminder");
    }
  };

  const handleDelete = async () => {
    if (!selectedReminder) return;
    try {
      await axios.delete(`${API}/reminders/${selectedReminder.id}`);
      toast.success("Reminder deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedReminder(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error("Failed to delete reminder");
    }
  };

  const toggleActive = async (reminder) => {
    try {
      const payload = {
        equipment_id: reminder.equipment_id,
        reminder_type: reminder.reminder_type,
        service_type: reminder.service_type,
        due_date: reminder.due_date,
        due_hours: reminder.due_hours,
        due_mileage: reminder.due_mileage,
        is_active: !reminder.is_active,
        notes: reminder.notes
      };
      await axios.put(`${API}/reminders/${reminder.id}`, payload);
      toast.success(`Reminder ${!reminder.is_active ? "activated" : "deactivated"}`);
      fetchData();
    } catch (error) {
      console.error("Error toggling reminder:", error);
      toast.error("Failed to update reminder");
    }
  };

  const openEditDialog = (reminder) => {
    setSelectedReminder(reminder);
    setFormData({
      equipment_id: reminder.equipment_id,
      reminder_type: reminder.reminder_type,
      service_type: reminder.service_type,
      due_date: reminder.due_date ? new Date(reminder.due_date) : null,
      due_hours: reminder.due_hours?.toString() || "",
      due_mileage: reminder.due_mileage?.toString() || "",
      is_active: reminder.is_active,
      notes: reminder.notes || ""
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setSelectedReminder(null);
    resetForm();
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      equipment_id: "",
      reminder_type: "date_based",
      service_type: "",
      due_date: null,
      due_hours: "",
      due_mileage: "",
      is_active: true,
      notes: ""
    });
    setSelectedReminder(null);
  };

  const getEquipmentName = (equipmentId) => {
    const equip = equipment.find(e => e.id === equipmentId);
    return equip ? equip.name : "Unknown";
  };

  const getEquipmentType = (equipmentId) => {
    const equip = equipment.find(e => e.id === equipmentId);
    return equip?.equipment_type || "other";
  };

  const getEquipmentData = (equipmentId) => {
    return equipment.find(e => e.id === equipmentId);
  };

  const getReminderStatus = (reminder) => {
    if (!reminder.is_active) return "inactive";
    
    if (reminder.reminder_type === "date_based" && reminder.due_date) {
      const dueDate = new Date(reminder.due_date);
      if (isPast(dueDate)) return "overdue";
      const daysUntil = differenceInDays(dueDate, new Date());
      if (daysUntil <= 7) return "upcoming";
      return "active";
    }
    
    if (reminder.reminder_type === "hours_based" && reminder.due_hours) {
      const equip = getEquipmentData(reminder.equipment_id);
      if (equip && equip.current_hours >= reminder.due_hours) return "overdue";
      if (equip && (reminder.due_hours - equip.current_hours) <= 50) return "upcoming";
      return "active";
    }
    
    if (reminder.reminder_type === "mileage_based" && reminder.due_mileage) {
      const equip = getEquipmentData(reminder.equipment_id);
      if (equip && equip.current_mileage >= reminder.due_mileage) return "overdue";
      if (equip && (reminder.due_mileage - equip.current_mileage) <= 500) return "upcoming";
      return "active";
    }
    
    return "active";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "overdue":
        return <Badge className="bg-red-500 text-white uppercase text-xs font-bold">Overdue</Badge>;
      case "upcoming":
        return <Badge className="bg-orange-500 text-white uppercase text-xs font-bold">Due Soon</Badge>;
      case "active":
        return <Badge className="bg-green-500 text-white uppercase text-xs font-bold">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="uppercase text-xs font-bold">Inactive</Badge>;
      default:
        return null;
    }
  };

  const filteredReminders = reminders.filter((r) => {
    const equipName = getEquipmentName(r.equipment_id);
    const matchesSearch = 
      equipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    const status = getReminderStatus(r);
    return matchesSearch && status === filterStatus;
  });

  const overdueCount = reminders.filter(r => getReminderStatus(r) === "overdue").length;
  const upcomingCount = reminders.filter(r => getReminderStatus(r) === "upcoming").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="reminders-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="reminders-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Service Reminders
          </h1>
          <p className="text-slate-600 mt-1">Set up alerts for upcoming maintenance</p>
        </div>
        <Button 
          onClick={openAddDialog}
          className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-6 font-bold uppercase tracking-wider btn-industrial"
          data-testid="add-reminder-btn"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`stat-card ${overdueCount > 0 ? "border-red-500" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${overdueCount > 0 ? "text-red-500 status-badge-pulse" : "text-slate-300"}`} />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overdue</p>
                <p className={`text-2xl font-bold font-mono ${overdueCount > 0 ? "text-red-600" : "text-slate-900"}`}>
                  {overdueCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`stat-card ${upcomingCount > 0 ? "border-orange-500" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className={`h-5 w-5 ${upcomingCount > 0 ? "text-orange-500" : "text-slate-300"}`} />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Soon</p>
                <p className="text-2xl font-bold font-mono text-slate-900">{upcomingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active</p>
                <p className="text-2xl font-bold font-mono text-slate-900">
                  {reminders.filter(r => r.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold font-mono text-slate-900">{reminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search reminders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-2 border-slate-300 bg-slate-50"
            data-testid="reminder-search"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48 h-12 border-2 border-slate-300 bg-slate-50" data-testid="status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reminders</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="upcoming">Due Soon</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="empty-state" data-testid="reminders-empty">
          <Bell className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Reminders Found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm || filterStatus !== "all" 
              ? "Try adjusting your search or filters" 
              : "Set up reminders to never miss a service"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <Button onClick={openAddDialog} className="btn-industrial bg-slate-900 text-white" data-testid="add-first-reminder-btn">
              <Plus className="h-5 w-5 mr-2" />
              Add Reminder
            </Button>
          )}
        </div>
      ) : (
        <Card className="border-2 border-slate-200">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100" data-testid="reminders-list">
              {filteredReminders.map((reminder) => {
                const status = getReminderStatus(reminder);
                return (
                  <div 
                    key={reminder.id} 
                    className={`p-4 transition-colors ${
                      status === "overdue" ? "bg-red-50" : 
                      status === "upcoming" ? "bg-orange-50" : 
                      !reminder.is_active ? "bg-slate-100 opacity-60" : "hover:bg-slate-50"
                    }`}
                    data-testid={`reminder-row-${reminder.id}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${getEquipmentType(reminder.equipment_id) === "tractor" ? "bg-green-100" : "bg-blue-100"}`}>
                          {getEquipmentType(reminder.equipment_id) === "tractor" ? (
                            <Tractor className="h-5 w-5 text-green-600" />
                          ) : (
                            <Car className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-slate-900">{getEquipmentName(reminder.equipment_id)}</span>
                            <Badge variant="outline">{reminder.service_type}</Badge>
                            {getStatusBadge(status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            {reminder.reminder_type === "date_based" && reminder.due_date && (
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                Due: {format(new Date(reminder.due_date), "MMM d, yyyy")}
                              </span>
                            )}
                            {reminder.reminder_type === "hours_based" && reminder.due_hours && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Due at: {reminder.due_hours.toLocaleString()} hours
                              </span>
                            )}
                            {reminder.reminder_type === "mileage_based" && reminder.due_mileage && (
                              <span className="font-mono">
                                Due at: {reminder.due_mileage.toLocaleString()} mi
                              </span>
                            )}
                          </div>
                          {reminder.notes && (
                            <p className="text-sm text-slate-500 mt-1">{reminder.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${reminder.id}`} className="text-sm text-slate-500">
                            {reminder.is_active ? "Active" : "Inactive"}
                          </Label>
                          <Switch
                            id={`active-${reminder.id}`}
                            checked={reminder.is_active}
                            onCheckedChange={() => toggleActive(reminder)}
                            data-testid={`toggle-reminder-${reminder.id}`}
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="border-2 border-slate-300 hover:border-slate-900"
                          onClick={() => openEditDialog(reminder)}
                          data-testid={`edit-reminder-${reminder.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="border-2 border-red-300 hover:border-red-600 hover:bg-red-50 text-red-600"
                          onClick={() => {
                            setSelectedReminder(reminder);
                            setDeleteDialogOpen(true);
                          }}
                          data-testid={`delete-reminder-${reminder.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {selectedReminder ? "Edit Reminder" : "Add Reminder"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="reminder-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Equipment *</Label>
                <Select value={formData.equipment_id} onValueChange={(v) => setFormData({ ...formData, equipment_id: v })}>
                  <SelectTrigger className="h-12 border-2 border-slate-300 bg-slate-50" data-testid="reminder-equipment-select">
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
                <Label className="text-sm font-bold uppercase tracking-wider">Reminder Type *</Label>
                <Select value={formData.reminder_type} onValueChange={(v) => setFormData({ ...formData, reminder_type: v })}>
                  <SelectTrigger className="h-12 border-2 border-slate-300 bg-slate-50" data-testid="reminder-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_based">Date Based</SelectItem>
                    <SelectItem value="hours_based">Hours Based</SelectItem>
                    <SelectItem value="mileage_based">Mileage Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wider">Service Type *</Label>
                <Select value={formData.service_type} onValueChange={(v) => setFormData({ ...formData, service_type: v })}>
                  <SelectTrigger className="h-12 border-2 border-slate-300 bg-slate-50" data-testid="reminder-service-select">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.reminder_type === "date_based" && (
                <div className="col-span-2">
                  <Label className="text-sm font-bold uppercase tracking-wider">Due Date *</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal border-2 border-slate-300 bg-slate-50",
                          !formData.due_date && "text-muted-foreground"
                        )}
                        data-testid="reminder-date-picker"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.due_date}
                        onSelect={(date) => {
                          setFormData({ ...formData, due_date: date });
                          setDatePickerOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {formData.reminder_type === "hours_based" && (
                <div className="col-span-2">
                  <Label className="text-sm font-bold uppercase tracking-wider">Due at Hours *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.due_hours}
                    onChange={(e) => setFormData({ ...formData, due_hours: e.target.value })}
                    className="h-12 border-2 border-slate-300 bg-slate-50"
                    placeholder="1500"
                    data-testid="reminder-hours-input"
                  />
                </div>
              )}

              {formData.reminder_type === "mileage_based" && (
                <div className="col-span-2">
                  <Label className="text-sm font-bold uppercase tracking-wider">Due at Mileage *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.due_mileage}
                    onChange={(e) => setFormData({ ...formData, due_mileage: e.target.value })}
                    className="h-12 border-2 border-slate-300 bg-slate-50"
                    placeholder="50000"
                    data-testid="reminder-mileage-input"
                  />
                </div>
              )}

              <div className="col-span-2 flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  data-testid="reminder-active-switch"
                />
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Reminder is active
                </Label>
              </div>

              <div className="col-span-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border-2 border-slate-300 bg-slate-50"
                  placeholder="Any additional notes..."
                  rows={2}
                  data-testid="reminder-notes-input"
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
                data-testid="reminder-submit-btn"
              >
                {selectedReminder ? "Update" : "Add"} Reminder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this reminder. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="confirm-delete-reminder-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reminders;
