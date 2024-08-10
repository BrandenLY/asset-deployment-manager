from django.core.management.base import BaseCommand, CommandError
from django.core.management.color import no_style
from assets.models import Asset, AssetModel, AssetIcon, Shipment, Location

class Command(BaseCommand):
    help = "Receive all assets"

    def handle(self, *args, **options):
        assetsReceived = 0
        
        containers = Asset.objects.filter(is_container=True)

        try:
            for container in containers:
                if getattr(container, "parent_object", None) is not None:

                    container.parent_object = None
                    container.save()
                    self.stdout.write(
                        no_style().SUCCESS(f"Received Asset '{container}'")
                    )
                    assetsReceived+=1


        except Exception as e:
            raise CommandError(e)
        
        items = Asset.objects.filter(is_container=False)

        try:
            for item in items:
                if getattr(item, "parent_object", None) is not None:
                    item.parent_object = None
                    item.save()
                    self.stdout.write(
                        no_style().SUCCESS(f"Received Asset '{item}'")
                    )
                    assetsReceived+=1

        except Exception as e:
            raise CommandError(e)


        self.stdout.write(
            self.style.SUCCESS(f"Successfully received {assetsReceived} assets")
        )