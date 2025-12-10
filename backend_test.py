import requests
import sys
import json
from datetime import datetime, timedelta

class FamilyTreeAPITester:
    def __init__(self, base_url="https://kin-connect-16.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.family_id = None
        self.member_id = None
        self.event_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                except:
                    pass

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_login(self):
        """Test universal login"""
        success, response = self.run_test(
            "Universal Login",
            "POST",
            "auth/login",
            200,
            data={"username": "onefam", "password": "Welcome1"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"✅ Token received: {self.token[:20]}...")
            return True
        return False

    def test_invalid_login(self):
        """Test invalid login credentials"""
        success, _ = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"username": "wrong", "password": "wrong"}
        )
        return success

    def test_create_family(self):
        """Test family creation"""
        success, response = self.run_test(
            "Create Family",
            "POST",
            "families",
            200,
            data={"name": f"Test Family {datetime.now().strftime('%H%M%S')}"}
        )
        if success and 'id' in response:
            self.family_id = response['id']
            print(f"✅ Family created with ID: {self.family_id}")
            return True
        return False

    def test_get_families(self):
        """Test getting families list"""
        success, response = self.run_test(
            "Get Families",
            "GET",
            "families",
            200
        )
        if success and isinstance(response, list):
            print(f"✅ Found {len(response)} families")
            return True
        return False

    def test_create_family_member(self):
        """Test creating a family member"""
        if not self.family_id:
            print("❌ No family ID available for member creation")
            return False

        member_data = {
            "first_name": "John",
            "last_name": "Doe",
            "address": "123 Main St, City, State",
            "birthday": "1990-01-15",
            "anniversary": "2015-06-20",
            "comments": "Test member for API testing",
            "parent_id": None,
            "photo_base64": None
        }

        success, response = self.run_test(
            "Create Family Member",
            "POST",
            f"families/{self.family_id}/members",
            200,
            data=member_data
        )
        if success and 'id' in response:
            self.member_id = response['id']
            print(f"✅ Member created with ID: {self.member_id}")
            return True
        return False

    def test_get_family_members(self):
        """Test getting family members"""
        if not self.family_id:
            print("❌ No family ID available")
            return False

        success, response = self.run_test(
            "Get Family Members",
            "GET",
            f"families/{self.family_id}/members",
            200
        )
        if success and isinstance(response, list):
            print(f"✅ Found {len(response)} members")
            return True
        return False

    def test_update_family_member(self):
        """Test updating a family member"""
        if not self.family_id or not self.member_id:
            print("❌ No family or member ID available")
            return False

        update_data = {
            "first_name": "Jane",
            "comments": "Updated test member"
        }

        success, response = self.run_test(
            "Update Family Member",
            "PUT",
            f"families/{self.family_id}/members/{self.member_id}",
            200,
            data=update_data
        )
        return success

    def test_create_custom_event(self):
        """Test creating a custom event"""
        if not self.family_id:
            print("❌ No family ID available")
            return False

        event_data = {
            "event_name": "Family Reunion",
            "event_date": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            "member_id": self.member_id
        }

        success, response = self.run_test(
            "Create Custom Event",
            "POST",
            f"families/{self.family_id}/events",
            200,
            data=event_data
        )
        if success and 'id' in response:
            self.event_id = response['id']
            print(f"✅ Event created with ID: {self.event_id}")
            return True
        return False

    def test_get_custom_events(self):
        """Test getting custom events"""
        if not self.family_id:
            print("❌ No family ID available")
            return False

        success, response = self.run_test(
            "Get Custom Events",
            "GET",
            f"families/{self.family_id}/events",
            200
        )
        if success and isinstance(response, list):
            print(f"✅ Found {len(response)} events")
            return True
        return False

    def test_get_alerts(self):
        """Test getting alerts"""
        if not self.family_id:
            print("❌ No family ID available")
            return False

        success, response = self.run_test(
            "Get Alerts",
            "GET",
            f"families/{self.family_id}/alerts",
            200
        )
        if success and isinstance(response, list):
            print(f"✅ Found {len(response)} alerts")
            return True
        return False

    def test_events_calendar(self):
        """Test events calendar endpoint"""
        if not self.family_id:
            print("❌ No family ID available")
            return False

        success, response = self.run_test(
            "Get Events Calendar",
            "GET",
            f"families/{self.family_id}/events-calendar",
            200
        )
        if success and isinstance(response, list):
            print(f"✅ Found {len(response)} calendar events")
            return True
        return False

    def test_send_alert_emails(self):
        """Test sending alert emails"""
        if not self.family_id:
            print("❌ No family ID available")
            return False

        email_data = {
            "email": "test@example.com",
            "family_id": self.family_id
        }

        success, response = self.run_test(
            "Send Alert Emails",
            "POST",
            f"families/{self.family_id}/send-alerts",
            200,
            data=email_data
        )
        return success

    def test_delete_custom_event(self):
        """Test deleting a custom event"""
        if not self.family_id or not self.event_id:
            print("❌ No family or event ID available")
            return False

        success, response = self.run_test(
            "Delete Custom Event",
            "DELETE",
            f"families/{self.family_id}/events/{self.event_id}",
            200
        )
        return success

    def test_delete_family_member(self):
        """Test deleting a family member"""
        if not self.family_id or not self.member_id:
            print("❌ No family or member ID available")
            return False

        success, response = self.run_test(
            "Delete Family Member",
            "DELETE",
            f"families/{self.family_id}/members/{self.member_id}",
            200
        )
        return success

    def test_delete_family(self):
        """Test deleting a family"""
        if not self.family_id:
            print("❌ No family ID available")
            return False

        success, response = self.run_test(
            "Delete Family",
            "DELETE",
            f"families/{self.family_id}",
            200
        )
        return success

def main():
    print("🚀 Starting Family Tree API Tests")
    print("=" * 50)
    
    tester = FamilyTreeAPITester()

    # Authentication Tests
    print("\n📋 AUTHENTICATION TESTS")
    if not tester.test_login():
        print("❌ Login failed, stopping tests")
        return 1
    
    tester.test_invalid_login()

    # Family Management Tests
    print("\n📋 FAMILY MANAGEMENT TESTS")
    if not tester.test_create_family():
        print("❌ Family creation failed, stopping tests")
        return 1
    
    tester.test_get_families()

    # Family Member Tests
    print("\n📋 FAMILY MEMBER TESTS")
    tester.test_create_family_member()
    tester.test_get_family_members()
    tester.test_update_family_member()

    # Events Tests
    print("\n📋 EVENTS TESTS")
    tester.test_create_custom_event()
    tester.test_get_custom_events()
    tester.test_get_alerts()
    tester.test_events_calendar()
    tester.test_send_alert_emails()

    # Cleanup Tests
    print("\n📋 CLEANUP TESTS")
    tester.test_delete_custom_event()
    tester.test_delete_family_member()
    tester.test_delete_family()

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend API tests mostly successful!")
        return 0
    else:
        print("⚠️ Backend API has significant issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())