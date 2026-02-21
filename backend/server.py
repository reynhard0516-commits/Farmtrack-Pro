from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class EquipmentType(str, Enum):
    TRACTOR = "tractor"
    VEHICLE = "vehicle"
    OTHER = "other"

class ServiceStatus(str, Enum):
    COMPLETED = "completed"
    SCHEDULED = "scheduled"
    OVERDUE = "overdue"

# Equipment Models
class EquipmentBase(BaseModel):
    name: str
    equipment_type: EquipmentType
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    serial_number: Optional[str] = None
    current_hours: Optional[float] = 0
    current_mileage: Optional[float] = 0
    notes: Optional[str] = None
    image_url: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    pass

class Equipment(EquipmentBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Filter Models
class FilterBase(BaseModel):
    name: str
    part_number: str
    filter_type: str  # oil, air, fuel, hydraulic, etc.
    compatible_equipment: List[str] = []  # List of equipment IDs
    quantity_in_stock: int = 0
    reorder_level: int = 5
    unit_price: Optional[float] = None
    supplier: Optional[str] = None
    notes: Optional[str] = None

class FilterCreate(FilterBase):
    pass

class Filter(FilterBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Service Record Models
class FilterUsed(BaseModel):
    filter_id: str
    filter_name: str
    quantity: int = 1

class ServiceRecordBase(BaseModel):
    equipment_id: str
    service_date: datetime
    service_type: str  # oil change, filter replacement, inspection, repair, etc.
    description: Optional[str] = None
    hours_at_service: Optional[float] = None
    mileage_at_service: Optional[float] = None
    cost: Optional[float] = None
    technician: Optional[str] = None
    filters_used: List[FilterUsed] = []
    next_service_date: Optional[datetime] = None
    next_service_hours: Optional[float] = None
    next_service_mileage: Optional[float] = None
    notes: Optional[str] = None

class ServiceRecordCreate(ServiceRecordBase):
    pass

class ServiceRecord(ServiceRecordBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Service Reminder Models
class ReminderBase(BaseModel):
    equipment_id: str
    reminder_type: str  # date_based, hours_based, mileage_based
    service_type: str
    due_date: Optional[datetime] = None
    due_hours: Optional[float] = None
    due_mileage: Optional[float] = None
    is_active: bool = True
    notes: Optional[str] = None

class ReminderCreate(ReminderBase):
    pass

class Reminder(ReminderBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper function to convert datetime for MongoDB
def serialize_for_mongo(data: dict) -> dict:
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.isoformat()
        elif isinstance(value, list):
            data[key] = [serialize_for_mongo(item) if isinstance(item, dict) else item for item in value]
        elif isinstance(value, dict):
            data[key] = serialize_for_mongo(value)
    return data

def deserialize_from_mongo(data: dict) -> dict:
    datetime_fields = ['created_at', 'updated_at', 'service_date', 'next_service_date', 'due_date']
    for key in datetime_fields:
        if key in data and isinstance(data[key], str):
            try:
                data[key] = datetime.fromisoformat(data[key])
            except (ValueError, TypeError):
                pass
    return data

# ==================== EQUIPMENT ENDPOINTS ====================

@api_router.post("/equipment", response_model=Equipment)
async def create_equipment(input: EquipmentCreate):
    equipment = Equipment(**input.model_dump())
    doc = serialize_for_mongo(equipment.model_dump())
    await db.equipment.insert_one(doc)
    return equipment

@api_router.get("/equipment", response_model=List[Equipment])
async def get_all_equipment():
    equipment_list = await db.equipment.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_from_mongo(e) for e in equipment_list]

@api_router.get("/equipment/{equipment_id}", response_model=Equipment)
async def get_equipment(equipment_id: str):
    equipment = await db.equipment.find_one({"id": equipment_id}, {"_id": 0})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return deserialize_from_mongo(equipment)

@api_router.put("/equipment/{equipment_id}", response_model=Equipment)
async def update_equipment(equipment_id: str, input: EquipmentCreate):
    existing = await db.equipment.find_one({"id": equipment_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    updated_data = input.model_dump()
    updated_data['id'] = equipment_id
    updated_data['created_at'] = existing.get('created_at')
    updated_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.equipment.update_one({"id": equipment_id}, {"$set": updated_data})
    return deserialize_from_mongo(updated_data)

@api_router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str):
    result = await db.equipment.delete_one({"id": equipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipment not found")
    # Also delete related service records and reminders
    await db.service_records.delete_many({"equipment_id": equipment_id})
    await db.reminders.delete_many({"equipment_id": equipment_id})
    return {"message": "Equipment deleted successfully"}

# ==================== FILTER INVENTORY ENDPOINTS ====================

@api_router.post("/filters", response_model=Filter)
async def create_filter(input: FilterCreate):
    filter_obj = Filter(**input.model_dump())
    doc = serialize_for_mongo(filter_obj.model_dump())
    await db.filters.insert_one(doc)
    return filter_obj

@api_router.get("/filters", response_model=List[Filter])
async def get_all_filters():
    filters = await db.filters.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_from_mongo(f) for f in filters]

@api_router.get("/filters/{filter_id}", response_model=Filter)
async def get_filter(filter_id: str):
    filter_obj = await db.filters.find_one({"id": filter_id}, {"_id": 0})
    if not filter_obj:
        raise HTTPException(status_code=404, detail="Filter not found")
    return deserialize_from_mongo(filter_obj)

@api_router.put("/filters/{filter_id}", response_model=Filter)
async def update_filter(filter_id: str, input: FilterCreate):
    existing = await db.filters.find_one({"id": filter_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Filter not found")
    
    updated_data = input.model_dump()
    updated_data['id'] = filter_id
    updated_data['created_at'] = existing.get('created_at')
    updated_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.filters.update_one({"id": filter_id}, {"$set": updated_data})
    return deserialize_from_mongo(updated_data)

@api_router.delete("/filters/{filter_id}")
async def delete_filter(filter_id: str):
    result = await db.filters.delete_one({"id": filter_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Filter not found")
    return {"message": "Filter deleted successfully"}

@api_router.get("/filters/low-stock", response_model=List[Filter])
async def get_low_stock_filters():
    filters = await db.filters.find({}, {"_id": 0}).to_list(1000)
    low_stock = [f for f in filters if f.get('quantity_in_stock', 0) <= f.get('reorder_level', 5)]
    return [deserialize_from_mongo(f) for f in low_stock]

# ==================== SERVICE RECORD ENDPOINTS ====================

@api_router.post("/services", response_model=ServiceRecord)
async def create_service_record(input: ServiceRecordCreate):
    # Verify equipment exists
    equipment = await db.equipment.find_one({"id": input.equipment_id}, {"_id": 0})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    service = ServiceRecord(**input.model_dump())
    doc = serialize_for_mongo(service.model_dump())
    await db.service_records.insert_one(doc)
    
    # Update equipment hours/mileage if provided
    update_data = {}
    if input.hours_at_service:
        update_data['current_hours'] = input.hours_at_service
    if input.mileage_at_service:
        update_data['current_mileage'] = input.mileage_at_service
    if update_data:
        await db.equipment.update_one({"id": input.equipment_id}, {"$set": update_data})
    
    # Decrease filter inventory if filters were used
    for filter_used in input.filters_used:
        await db.filters.update_one(
            {"id": filter_used.filter_id},
            {"$inc": {"quantity_in_stock": -filter_used.quantity}}
        )
    
    return service

@api_router.get("/services", response_model=List[ServiceRecord])
async def get_all_services():
    services = await db.service_records.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_from_mongo(s) for s in services]

@api_router.get("/services/equipment/{equipment_id}", response_model=List[ServiceRecord])
async def get_equipment_services(equipment_id: str):
    services = await db.service_records.find({"equipment_id": equipment_id}, {"_id": 0}).to_list(1000)
    return [deserialize_from_mongo(s) for s in services]

@api_router.get("/services/{service_id}", response_model=ServiceRecord)
async def get_service(service_id: str):
    service = await db.service_records.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service record not found")
    return deserialize_from_mongo(service)

@api_router.put("/services/{service_id}", response_model=ServiceRecord)
async def update_service(service_id: str, input: ServiceRecordCreate):
    existing = await db.service_records.find_one({"id": service_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    updated_data = input.model_dump()
    updated_data['id'] = service_id
    updated_data['created_at'] = existing.get('created_at')
    updated_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    doc = serialize_for_mongo(updated_data)
    await db.service_records.update_one({"id": service_id}, {"$set": doc})
    return deserialize_from_mongo(updated_data)

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str):
    result = await db.service_records.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service record not found")
    return {"message": "Service record deleted successfully"}

# ==================== REMINDER ENDPOINTS ====================

@api_router.post("/reminders", response_model=Reminder)
async def create_reminder(input: ReminderCreate):
    # Verify equipment exists
    equipment = await db.equipment.find_one({"id": input.equipment_id}, {"_id": 0})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    reminder = Reminder(**input.model_dump())
    doc = serialize_for_mongo(reminder.model_dump())
    await db.reminders.insert_one(doc)
    return reminder

@api_router.get("/reminders", response_model=List[Reminder])
async def get_all_reminders():
    reminders = await db.reminders.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_from_mongo(r) for r in reminders]

@api_router.get("/reminders/equipment/{equipment_id}", response_model=List[Reminder])
async def get_equipment_reminders(equipment_id: str):
    reminders = await db.reminders.find({"equipment_id": equipment_id}, {"_id": 0}).to_list(1000)
    return [deserialize_from_mongo(r) for r in reminders]

@api_router.get("/reminders/{reminder_id}", response_model=Reminder)
async def get_reminder(reminder_id: str):
    reminder = await db.reminders.find_one({"id": reminder_id}, {"_id": 0})
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return deserialize_from_mongo(reminder)

@api_router.put("/reminders/{reminder_id}", response_model=Reminder)
async def update_reminder(reminder_id: str, input: ReminderCreate):
    existing = await db.reminders.find_one({"id": reminder_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    updated_data = input.model_dump()
    updated_data['id'] = reminder_id
    updated_data['created_at'] = existing.get('created_at')
    updated_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    doc = serialize_for_mongo(updated_data)
    await db.reminders.update_one({"id": reminder_id}, {"$set": doc})
    return deserialize_from_mongo(updated_data)

@api_router.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str):
    result = await db.reminders.delete_one({"id": reminder_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder deleted successfully"}

# ==================== DASHBOARD ENDPOINTS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    now = datetime.now(timezone.utc)
    
    # Equipment counts
    total_equipment = await db.equipment.count_documents({})
    tractors = await db.equipment.count_documents({"equipment_type": "tractor"})
    vehicles = await db.equipment.count_documents({"equipment_type": "vehicle"})
    
    # Service counts
    total_services = await db.service_records.count_documents({})
    
    # Get upcoming services (next 30 days)
    upcoming_threshold = (now + timedelta(days=30)).isoformat()
    upcoming_services = await db.service_records.find({
        "next_service_date": {"$lte": upcoming_threshold, "$gte": now.isoformat()}
    }, {"_id": 0}).to_list(100)
    
    # Get overdue services
    overdue_services = await db.service_records.find({
        "next_service_date": {"$lt": now.isoformat()}
    }, {"_id": 0}).to_list(100)
    
    # Low stock filters
    filters = await db.filters.find({}, {"_id": 0}).to_list(1000)
    low_stock_count = len([f for f in filters if f.get('quantity_in_stock', 0) <= f.get('reorder_level', 5)])
    
    # Active reminders
    active_reminders = await db.reminders.count_documents({"is_active": True})
    
    return {
        "total_equipment": total_equipment,
        "tractors": tractors,
        "vehicles": vehicles,
        "total_services": total_services,
        "upcoming_services_count": len(upcoming_services),
        "overdue_services_count": len(overdue_services),
        "low_stock_filters": low_stock_count,
        "active_reminders": active_reminders
    }

@api_router.get("/dashboard/alerts")
async def get_dashboard_alerts():
    now = datetime.now(timezone.utc)
    alerts = []
    
    # Overdue services
    all_services = await db.service_records.find({}, {"_id": 0}).to_list(1000)
    equipment_list = await db.equipment.find({}, {"_id": 0}).to_list(1000)
    equipment_map = {e['id']: e for e in equipment_list}
    
    for service in all_services:
        if service.get('next_service_date'):
            try:
                next_date = datetime.fromisoformat(service['next_service_date']) if isinstance(service['next_service_date'], str) else service['next_service_date']
                equipment = equipment_map.get(service.get('equipment_id'), {})
                if next_date < now:
                    alerts.append({
                        "type": "overdue",
                        "severity": "high",
                        "message": f"Overdue: {service.get('service_type')} for {equipment.get('name', 'Unknown')}",
                        "equipment_id": service.get('equipment_id'),
                        "equipment_name": equipment.get('name', 'Unknown'),
                        "due_date": service.get('next_service_date')
                    })
                elif next_date <= now + timedelta(days=7):
                    alerts.append({
                        "type": "upcoming",
                        "severity": "medium",
                        "message": f"Due soon: {service.get('service_type')} for {equipment.get('name', 'Unknown')}",
                        "equipment_id": service.get('equipment_id'),
                        "equipment_name": equipment.get('name', 'Unknown'),
                        "due_date": service.get('next_service_date')
                    })
            except (ValueError, TypeError, KeyError):
                pass
    
    # Low stock filters
    filters = await db.filters.find({}, {"_id": 0}).to_list(1000)
    for f in filters:
        if f.get('quantity_in_stock', 0) <= f.get('reorder_level', 5):
            alerts.append({
                "type": "low_stock",
                "severity": "medium",
                "message": f"Low stock: {f.get('name')} ({f.get('quantity_in_stock')} remaining)",
                "filter_id": f.get('id'),
                "filter_name": f.get('name')
            })
    
    # Sort by severity
    severity_order = {"high": 0, "medium": 1, "low": 2}
    alerts.sort(key=lambda x: severity_order.get(x.get('severity'), 99))
    
    return alerts

@api_router.get("/dashboard/recent-services")
async def get_recent_services():
    services = await db.service_records.find({}, {"_id": 0}).sort("service_date", -1).to_list(10)
    equipment_list = await db.equipment.find({}, {"_id": 0}).to_list(1000)
    equipment_map = {e['id']: e for e in equipment_list}
    
    result = []
    for service in services:
        equipment = equipment_map.get(service.get('equipment_id'), {})
        service_data = deserialize_from_mongo(service)
        service_data['equipment_name'] = equipment.get('name', 'Unknown')
        service_data['equipment_type'] = equipment.get('equipment_type', 'unknown')
        result.append(service_data)
    
    return result

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "FarmTrack Pro API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
