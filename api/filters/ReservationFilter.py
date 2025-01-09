import django_filters

from assets.models import Reservation

class ReservationFilter(django_filters.FilterSet):
    
    class Meta:
        model = Reservation
        fields = [
            'title',
            'start_date',
            'end_date',
            'shipment'
        ]