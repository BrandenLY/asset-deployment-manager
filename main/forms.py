from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import Event
from .models import User

class CreateEventForm(forms.ModelForm):
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
            'start_date': forms.DateInput(attrs={'type':'date'}),
            'end_date': forms.DateInput(attrs={'type':'date'}),
            'travel_in_date': forms.DateInput(attrs={'type':'date'}),
            'travel_out_date': forms.DateInput(attrs={'type':'date'})
        }

class LoginForm(forms.Form):
    def validate_existing_user(value):
        if User.objects.filter(email=value).count() < 1:
            raise ValidationError(
                _("User not found.")
            )
    username = forms.EmailField(validators=[validate_existing_user,], label_suffix='')
    password = forms.CharField(widget=forms.PasswordInput, label_suffix='')