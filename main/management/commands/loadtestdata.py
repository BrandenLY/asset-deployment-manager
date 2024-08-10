from django.core.management.base import BaseCommand, CommandError
from assets.models import Asset, AssetModel, AssetIcon, Shipment, Location

class Command(BaseCommand):
    help = "Populates database with test data."

    def handle(self, *args, **options):

        ## Create Asset Icons
        icon_details = [
            {"name":"Container", "source_name":"Inventory"},
            {"name":"Router", "source_name":"Router"},
            {"name":"Iphone", "source_name":"PhoneIphone"},
            {"name":"Android Phone", "source_name":"PhoneAndroid"},
            {"name":"Charging Station", "source_name":"ChargingStation"},
            {"name":"Chromebook", "source_name":"LaptopChromebook"},
            {"name":"Windows Laptop", "source_name":"LaptopWindows"},
            {"name":"Mac", "source_name":"LaptopMac"},
            {"name":"Printer", "source_name":"Print"},
        ]

        for icon in icon_details:
            try:
                a = AssetIcon.objects.get_or_create(**icon)[0]
                self.stdout.write(
                    self.style.SUCCESS(f"Created Asset Icon Object '{a}'")
                )
            except Exception as e:
                self.stderr.write(
                    self.style.ERROR(e)
                )
                return None

        ## Create Asset Models
        model_details = [
            {"name":"Mobile Device Crate", "description":"", "manufacturer":"Pelican", "model_code":"MDC", "icon": AssetIcon.objects.get(name="Container")},
            {"name":"Zebra Printer Crate", "description":"", "manufacturer":"Pelican", "model_code":"ZPC", "icon": AssetIcon.objects.get(name="Container")},
            {"name":"Iphone 12 Pro Max", "description":"", "manufacturer":"Apple", "model_code":"IPF", "icon": AssetIcon.objects.get(name="Iphone")},
            {"name":"Samsung Galaxy S24", "description":"", "manufacturer":"Samsung", "model_code":"SGS", "icon": AssetIcon.objects.get(name="Android Phone")},
            {"name":"10 Port Charging Station", "description":"", "manufacturer":"Anker", "model_code":"ATP", "icon": AssetIcon.objects.get(name="Charging Station")},
            {"name":"Chromebook", "description":"", "manufacturer":"Google", "model_code":"CHB", "icon": AssetIcon.objects.get(name="Chromebook")},
            {"name":"Windows Laptop", "description":"", "manufacturer":"Microsoft", "model_code":"WIN", "icon": AssetIcon.objects.get(name="Windows Laptop")},
            {"name":"Mac", "description":"", "manufacturer":"Apple", "model_code":"MAC", "icon": AssetIcon.objects.get(name="Mac")},
            {"name":"ZC10L Badge Printer", "description":"", "manufacturer":"Zebra", "model_code":"ZCT", "icon": AssetIcon.objects.get(name="Printer")},
        ]
        
        for model in model_details:
            try:
                m = AssetModel.objects.get_or_create(**model)[0]
                self.stdout.write(
                    self.style.SUCCESS(f"Created Asset Model Object '{m}'")
                )
            except Exception as e:
                self.stderr.write(
                    self.style.ERROR(e)
                )
                return None

        ## Create Assets
        asset_details = [
            {"code":"MDC001", "model":AssetModel.objects.get(model_code="MDC"), "is_container":True},
            {"code":"IPF001", "model":AssetModel.objects.get(model_code="IPF"), "is_container":False},
            {"code":"IPF002", "model":AssetModel.objects.get(model_code="IPF"), "is_container":False},
            {"code":"IPF003", "model":AssetModel.objects.get(model_code="IPF"), "is_container":False},
            {"code":"IPF004", "model":AssetModel.objects.get(model_code="IPF"), "is_container":False},
            {"code":"ZPC001", "model":AssetModel.objects.get(model_code="ZPC"), "is_container":True},
            {"code":"ZCT001", "model":AssetModel.objects.get(model_code="ZCT"), "is_container":False}
        ]

        for asset in asset_details:
            try:
                a = Asset.objects.get_or_create(**asset)
                self.stdout.write(
                    self.style.SUCCESS(f"Created Asset Object '{a}'")
                )
            except Exception as e:
                self.stderr.write(
                    self.style.ERROR(e)
                )
                return None

        self.stdout.write(
            self.style.SUCCESS('complete')
        )