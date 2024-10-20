import django_filters

from assets.models import Shipment

class Shipmentfilter(django_filters.FilterSet):
    
    class Meta:
        model = Shipment
        fields = [
            'event',
            'status',
            'origin',
            'destination',
            'carrier',
            'departure_date',
            'arrival_date'
        ]