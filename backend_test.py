import requests
import sys
from datetime import datetime, timezone
import json

class FarmTrackAPITester:
    def __init__(self, base_url="https://vehicle-service-hub-19.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {
            'equipment': [],
            'filters': [],
            'services': [],
            'reminders': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Raw response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic API health"""
        return self.run_test("API Health Check", "GET", "", 200)

    # ==================== EQUIPMENT TESTS ====================
    def test_create_equipment(self):
        """Test equipment creation"""
        test_equipment = {
            "name": "Test Tractor John Deere 8R",
            "equipment_type": "tractor",
            "make": "John Deere",
            "model": "8R 410",
            "year": 2024,
            "serial_number": "1RW8410RXXX123456",
            "current_hours": 1250.5,
            "current_mileage": 0,
            "notes": "Test equipment for API testing"
        }
        success, response = self.run_test("Create Equipment", "POST", "equipment", 200, test_equipment)
        if success and 'id' in response:
            self.created_ids['equipment'].append(response['id'])
            return response['id']
        return None

    def test_get_all_equipment(self):
        """Test getting all equipment"""
        return self.run_test("Get All Equipment", "GET", "equipment", 200)

    def test_get_equipment_by_id(self, equipment_id):
        """Test getting specific equipment"""
        if not equipment_id:
            print("⚠️  Skipping test - no equipment ID available")
            return False, {}
        return self.run_test("Get Equipment by ID", "GET", f"equipment/{equipment_id}", 200)

    def test_update_equipment(self, equipment_id):
        """Test equipment update"""
        if not equipment_id:
            print("⚠️  Skipping test - no equipment ID available")
            return False, {}
        
        update_data = {
            "name": "Updated Test Tractor",
            "equipment_type": "tractor",
            "make": "John Deere",
            "model": "8R 410",
            "year": 2024,
            "serial_number": "1RW8410RXXX123456",
            "current_hours": 1300.0,
            "current_mileage": 0,
            "notes": "Updated equipment for API testing"
        }
        return self.run_test("Update Equipment", "PUT", f"equipment/{equipment_id}", 200, update_data)

    # ==================== FILTER TESTS ====================
    def test_create_filter(self):
        """Test filter creation"""
        test_filter = {
            "name": "Test Oil Filter",
            "part_number": "RE504836",
            "filter_type": "Oil Filter",
            "compatible_equipment": [],
            "quantity_in_stock": 25,
            "reorder_level": 5,
            "unit_price": 24.99,
            "supplier": "John Deere Parts",
            "notes": "Test filter for API testing"
        }
        success, response = self.run_test("Create Filter", "POST", "filters", 200, test_filter)
        if success and 'id' in response:
            self.created_ids['filters'].append(response['id'])
            return response['id']
        return None

    def test_get_all_filters(self):
        """Test getting all filters"""
        return self.run_test("Get All Filters", "GET", "filters", 200)

    def test_get_filter_by_id(self, filter_id):
        """Test getting specific filter"""
        if not filter_id:
            print("⚠️  Skipping test - no filter ID available")
            return False, {}
        return self.run_test("Get Filter by ID", "GET", f"filters/{filter_id}", 200)

    def test_update_filter(self, filter_id):
        """Test filter update"""
        if not filter_id:
            print("⚠️  Skipping test - no filter ID available")
            return False, {}
        
        update_data = {
            "name": "Updated Test Oil Filter",
            "part_number": "RE504836",
            "filter_type": "Oil Filter",
            "compatible_equipment": [],
            "quantity_in_stock": 20,
            "reorder_level": 5,
            "unit_price": 26.99,
            "supplier": "John Deere Parts",
            "notes": "Updated filter for API testing"
        }
        return self.run_test("Update Filter", "PUT", f"filters/{filter_id}", 200, update_data)

    def test_low_stock_filters(self):
        """Test low stock filters endpoint"""
        return self.run_test("Get Low Stock Filters", "GET", "filters/low-stock", 200)

    # ==================== SERVICE TESTS ====================
    def test_create_service(self, equipment_id, filter_id):
        """Test service record creation"""
        if not equipment_id:
            print("⚠️  Skipping test - no equipment ID available")
            return None

        test_service = {
            "equipment_id": equipment_id,
            "service_date": datetime.now(timezone.utc).isoformat(),
            "service_type": "Oil Change",
            "description": "Regular oil change and maintenance",
            "hours_at_service": 1275.0,
            "mileage_at_service": 0,
            "cost": 150.00,
            "technician": "John Smith",
            "filters_used": [
                {
                    "filter_id": filter_id,
                    "filter_name": "Test Oil Filter",
                    "quantity": 1
                }
            ] if filter_id else [],
            "next_service_date": datetime.now(timezone.utc).isoformat(),
            "next_service_hours": 1500.0,
            "next_service_mileage": 0,
            "notes": "Test service record"
        }
        success, response = self.run_test("Create Service Record", "POST", "services", 200, test_service)
        if success and 'id' in response:
            self.created_ids['services'].append(response['id'])
            return response['id']
        return None

    def test_get_all_services(self):
        """Test getting all service records"""
        return self.run_test("Get All Services", "GET", "services", 200)

    def test_get_service_by_id(self, service_id):
        """Test getting specific service record"""
        if not service_id:
            print("⚠️  Skipping test - no service ID available")
            return False, {}
        return self.run_test("Get Service by ID", "GET", f"services/{service_id}", 200)

    def test_get_equipment_services(self, equipment_id):
        """Test getting services for specific equipment"""
        if not equipment_id:
            print("⚠️  Skipping test - no equipment ID available")
            return False, {}
        return self.run_test("Get Equipment Services", "GET", f"services/equipment/{equipment_id}", 200)

    def test_update_service(self, service_id, equipment_id):
        """Test service record update"""
        if not service_id or not equipment_id:
            print("⚠️  Skipping test - no service or equipment ID available")
            return False, {}
        
        update_data = {
            "equipment_id": equipment_id,
            "service_date": datetime.now(timezone.utc).isoformat(),
            "service_type": "Filter Replacement",
            "description": "Updated service description",
            "hours_at_service": 1280.0,
            "mileage_at_service": 0,
            "cost": 175.00,
            "technician": "Jane Doe",
            "filters_used": [],
            "next_service_date": datetime.now(timezone.utc).isoformat(),
            "next_service_hours": 1600.0,
            "next_service_mileage": 0,
            "notes": "Updated service record"
        }
        return self.run_test("Update Service Record", "PUT", f"services/{service_id}", 200, update_data)

    # ==================== REMINDER TESTS ====================
    def test_create_reminder(self, equipment_id):
        """Test reminder creation"""
        if not equipment_id:
            print("⚠️  Skipping test - no equipment ID available")
            return None

        test_reminder = {
            "equipment_id": equipment_id,
            "reminder_type": "date_based",
            "service_type": "Oil Change",
            "due_date": datetime.now(timezone.utc).isoformat(),
            "due_hours": None,
            "due_mileage": None,
            "is_active": True,
            "notes": "Test reminder"
        }
        success, response = self.run_test("Create Reminder", "POST", "reminders", 200, test_reminder)
        if success and 'id' in response:
            self.created_ids['reminders'].append(response['id'])
            return response['id']
        return None

    def test_get_all_reminders(self):
        """Test getting all reminders"""
        return self.run_test("Get All Reminders", "GET", "reminders", 200)

    def test_get_reminder_by_id(self, reminder_id):
        """Test getting specific reminder"""
        if not reminder_id:
            print("⚠️  Skipping test - no reminder ID available")
            return False, {}
        return self.run_test("Get Reminder by ID", "GET", f"reminders/{reminder_id}", 200)

    def test_get_equipment_reminders(self, equipment_id):
        """Test getting reminders for specific equipment"""
        if not equipment_id:
            print("⚠️  Skipping test - no equipment ID available")
            return False, {}
        return self.run_test("Get Equipment Reminders", "GET", f"reminders/equipment/{equipment_id}", 200)

    def test_update_reminder(self, reminder_id, equipment_id):
        """Test reminder update"""
        if not reminder_id or not equipment_id:
            print("⚠️  Skipping test - no reminder or equipment ID available")
            return False, {}
        
        update_data = {
            "equipment_id": equipment_id,
            "reminder_type": "hours_based",
            "service_type": "Filter Replacement",
            "due_date": None,
            "due_hours": 1600.0,
            "due_mileage": None,
            "is_active": False,
            "notes": "Updated reminder"
        }
        return self.run_test("Update Reminder", "PUT", f"reminders/{reminder_id}", 200, update_data)

    # ==================== DASHBOARD TESTS ====================
    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        return self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)

    def test_dashboard_alerts(self):
        """Test dashboard alerts endpoint"""
        return self.run_test("Dashboard Alerts", "GET", "dashboard/alerts", 200)

    def test_recent_services(self):
        """Test recent services endpoint"""
        return self.run_test("Recent Services", "GET", "dashboard/recent-services", 200)

    # ==================== DELETE TESTS ====================
    def test_delete_service(self, service_id):
        """Test service deletion"""
        if not service_id:
            print("⚠️  Skipping test - no service ID available")
            return False, {}
        return self.run_test("Delete Service", "DELETE", f"services/{service_id}", 200)

    def test_delete_reminder(self, reminder_id):
        """Test reminder deletion"""
        if not reminder_id:
            print("⚠️  Skipping test - no reminder ID available")
            return False, {}
        return self.run_test("Delete Reminder", "DELETE", f"reminders/{reminder_id}", 200)

    def test_delete_filter(self, filter_id):
        """Test filter deletion"""
        if not filter_id:
            print("⚠️  Skipping test - no filter ID available")
            return False, {}
        return self.run_test("Delete Filter", "DELETE", f"filters/{filter_id}", 200)

    def test_delete_equipment(self, equipment_id):
        """Test equipment deletion"""
        if not equipment_id:
            print("⚠️  Skipping test - no equipment ID available")
            return False, {}
        return self.run_test("Delete Equipment", "DELETE", f"equipment/{equipment_id}", 200)

def main():
    print("🚜 FarmTrack Pro API Testing Suite")
    print("=" * 50)
    
    tester = FarmTrackAPITester()
    
    # Test API health
    tester.test_health_check()
    
    # Test Equipment CRUD
    print("\n🔧 EQUIPMENT TESTS")
    equipment_id = tester.test_create_equipment()
    tester.test_get_all_equipment()
    tester.test_get_equipment_by_id(equipment_id)
    tester.test_update_equipment(equipment_id)
    
    # Test Filter CRUD
    print("\n🔍 FILTER TESTS")
    filter_id = tester.test_create_filter()
    tester.test_get_all_filters()
    tester.test_get_filter_by_id(filter_id)
    tester.test_update_filter(filter_id)
    tester.test_low_stock_filters()
    
    # Test Service CRUD
    print("\n🔨 SERVICE TESTS")
    service_id = tester.test_create_service(equipment_id, filter_id)
    tester.test_get_all_services()
    tester.test_get_service_by_id(service_id)
    tester.test_get_equipment_services(equipment_id)
    tester.test_update_service(service_id, equipment_id)
    
    # Test Reminder CRUD
    print("\n⏰ REMINDER TESTS")
    reminder_id = tester.test_create_reminder(equipment_id)
    tester.test_get_all_reminders()
    tester.test_get_reminder_by_id(reminder_id)
    tester.test_get_equipment_reminders(equipment_id)
    tester.test_update_reminder(reminder_id, equipment_id)
    
    # Test Dashboard
    print("\n📊 DASHBOARD TESTS")
    tester.test_dashboard_stats()
    tester.test_dashboard_alerts()
    tester.test_recent_services()
    
    # Test Deletions
    print("\n🗑️  DELETE TESTS")
    tester.test_delete_service(service_id)
    tester.test_delete_reminder(reminder_id)
    tester.test_delete_filter(filter_id)
    tester.test_delete_equipment(equipment_id)
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())