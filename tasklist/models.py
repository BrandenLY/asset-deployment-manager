from django.db import models
from django.conf import settings
from django.db.models.query import QuerySet
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from main.models import Event

# Models
class Product(models.Model):
    name = models.CharField(_("Name"), max_length=35)
    business_analyst = models.ForeignKey(
        get_user_model(),
        on_delete=models.PROTECT,
        verbose_name=_("Business Analyst"),
        blank=True,
        null=True,
    )
    icon = models.FileField(_("Icon"), blank=True, null=True)
    def __str__(self):
        return self.name
        
class Project(models.Model):
    parent_event = models.OneToOneField(
        Event,
        verbose_name=_("Parent Event"),
        related_name='project',
        on_delete=models.CASCADE,
        primary_key=True,
    )
    account_manager = models.ForeignKey(
        get_user_model(),
        verbose_name=_("Account Manager"),
        related_name="events_as_account_manager",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    project_manager = models.ForeignKey(
        get_user_model(),
        verbose_name=_("Project Manager"),
        related_name="events_as_project_manager",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    solutions_specialist = models.ForeignKey(
        get_user_model(),
        verbose_name=_("Solutions Specialist"),
        related_name="events_as_solutions_specialist",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    lead_retrieval_specialist = models.ForeignKey(
        get_user_model(),
        verbose_name=_("Lead Retrieval Specialist"),
        related_name="events_as_lead_retrieval_specialist",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    insignia_requirement = models.BooleanField(_("Requires Insignia"), default=False)
    checkin_requirement = models.BooleanField(_("Requires Check-In"), default=False)
    portal_requirement = models.BooleanField(_("Requires Portal"), default=False)
    sentinel_requirement = models.BooleanField(_("Requires Sentinel"), default=False)
    printer_type = models.IntegerField(_("Printer type"), choices=settings.AVAILABLE_PRINTER_TYPES, default=0)
    production_redwood_id = models.IntegerField(_("Production Redwood ID"), blank=True, null=True)
    production_show_code = models.CharField(_("Production Showcode"), max_length=15, blank=True, null=True)
    test_redwood_id = models.IntegerField(_("Test Redwood ID"), blank=True, null=True)
    test_show_code = models.CharField(_("Test Showcode"), max_length=15, blank=True, null=True)

    def get_completion_percentage(self):

        all_tasks = self.task_set.all()

        if all_tasks.count() < 1:
            return 'N/A'
        
        completed_tasks = self.task_set.filter(status=6)
        task_completion_percentage = (completed_tasks.count() / all_tasks.count()) * 100
        return f"{task_completion_percentage}%"
    
    def __str__(self):
        return f"{self.production_show_code}-config".lower()


class Task(models.Model):
    STATUS_CHOICES = (
        (0, "Pending"),
        (1, "In progress"),
        (2, "Internal Review"),
        (3, "Awaiting Approval"),
        (4, "Paused"),
        (5, "Canceled"),
        (6, "Complete"),
    )
    PRIORITY_CHOICES = (
        (0, "Normal"),
        (1, "Low"),
        (2, "Medium"),
        (3, "High"),
        (4, "Urgent"),
    )

    parent_project = models.ForeignKey( 
        Project,  
        on_delete = models.CASCADE
    ) 

    responsible_to = models.ForeignKey(
        get_user_model(),
        verbose_name = _("Responsible To"),
        related_name = 'assigned_tasks',
        related_query_name = 'reponsible_to',
        on_delete = models.SET_NULL,
        blank = True,
        null = True
    )
    created_by = models.ForeignKey(
        get_user_model(),
        verbose_name = _("Created By"),
        related_name = 'created_task',
        related_query_name = 'creator_of',
        on_delete = models.SET_NULL,
        blank = True,
        null = True
    )
    related_product = models.ForeignKey(
        Product, 
        on_delete = models.SET_NULL, 
        verbose_name =_("Related Product"),
        related_query_name = 'product',
        blank = True, 
        null = True
    )
    

    is_system_task = models.BooleanField(_("Is System Task"), default=False)
    date_created = models.DateTimeField(_("Date Created"), auto_now_add=True, editable=False)
    description = models.TextField(_("Description"), blank=True, null=True)
    title = models.CharField(_("Title"), max_length=150)
    status = models.IntegerField(_("Status"), choices=STATUS_CHOICES, default=0)
    due_date = models.DateField(_("Due Date"), blank=True, null=True)
    priority = models.IntegerField(_("Priority"), choices=PRIORITY_CHOICES, default=0)
    sort_order = models.IntegerField(_("Order"), blank=True, null=True)