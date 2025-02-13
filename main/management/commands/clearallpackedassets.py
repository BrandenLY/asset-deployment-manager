from django.core.management.base import BaseCommand, CommandError
from django.core.management.color import no_style
from assets.models import Shipment

class Command(BaseCommand):
    help = "Set 'packed_assets' value of all shipments to default value."

    def handle(self, *args, **options):
        
        shipments = Shipment.objects.all()
        shipments_modified = 0

        try:
            for shipment in shipments:
                
                packed_assets_default_value = Shipment._meta.get_field("packed_assets").default()

                if (shipment.packed_assets == packed_assets_default_value):
                    continue # The current shipment is already set to the default value

                else:
                    shipment.packed_assets = packed_assets_default_value # Restore default
                    shipment.save()
                    shipments_modified += 1 # Increment modified shipment counter

        except Exception as e:
            raise CommandError(e)
        

        self.stdout.write(
            self.style.SUCCESS(f"Successfully reset {shipments_modified} shipment's packed_assets to default")
        )