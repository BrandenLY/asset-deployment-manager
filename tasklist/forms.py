from django.forms import ModelForm
from tasklist.models import Project

class CreateProjectForm(ModelForm):
    template_name = 'tasklist/forms/add_event_config_form.html'
    class Meta:
        model = Project
        fields = (
            'account_manager',
            'project_manager',
            'solutions_specialist',
            'lead_retrieval_specialist',
            'printer_type',
            'production_redwood_id',
            'production_show_code',
            'test_redwood_id',
            'test_show_code'
        )