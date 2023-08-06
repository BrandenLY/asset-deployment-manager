from django.forms import ModelForm, DateInput
from .models import Event

class CreateEventForm(ModelForm):
    template_name = 'tasklist/forms/add_event_form.html'

    class Meta:
        model = Event
        fields = (
            'name',
            'start_date',
            'end_date',
            'travel_in_date',
            'travel_out_date',
            'timetracking_url',
            'external_project_url',
            'sharepoint_url',
        )
        widgets = {
            'start_date': DateInput(attrs={'type':'date'}),
            'end_date': DateInput(attrs={'type':'date'}),
            'travel_in_date': DateInput(attrs={'type':'date'}),
            'travel_out_date': DateInput(attrs={'type':'date'})
        }