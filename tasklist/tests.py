from datetime import datetime
from datetime import timedelta
from django.test import TestCase
from django.test import Client
from main.models import Event

# Create your tests here.
class TasklistModelsTestCase(TestCase):

    def setUp(self):
        self.client = Client()
        self.event = None

    def test_can_create_event(self):
        new_event_data = {
            "name" : "Generic Test Event",
            "start_date" : datetime.today(),
            "end_date" : datetime.today() + timedelta(days=7),
            "travel_in_date" : datetime.today(),
            "travel_out_date" : datetime.today() + timedelta(days=7),
            "timetracking_url" : "https://eventscloud.com",
            "external_project_url" : "https://eventscloud.com",
            "sharepoint_url" : "https://eventscloud.com",
            "addEventForm" : "",
        }
        new_project_data = {
            "printer_type" : 0,
            "production_redwood_id" : 9990,
            "production_show_code" : "GTE9990",
            "test_redwood_id" : 9990,
            "test_show_code" : "GTE9990",
            "account_manager_id": 0,
            "project_manager_id": 0,
            "solutions_specialist_id": 0,
            "lead_retrieval_specialist_id": 0,

        }
        response = self.client.post('/home/', new_event_data.update(new_project_data))
        print(response)