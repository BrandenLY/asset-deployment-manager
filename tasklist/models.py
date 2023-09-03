from django.db import models
from django.db import transaction
from django.conf import settings
from django.db.models.query import QuerySet
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from main.models import Event

# Models
class Service(models.Model):
    name = models.CharField(_("Name"), max_length=35)
    business_analyst = models.ForeignKey(
        get_user_model(),
        on_delete=models.PROTECT,
        verbose_name=_("Business Analyst"),
        blank=True,
        null=True,
    )
    icon = models.FileField(_("Icon"), blank=True, null=True, upload_to="services")
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
    services = models.ManyToManyField(Service)
    printer_type = models.IntegerField(_("Printer type"), choices=settings.AVAILABLE_PRINTER_TYPES, default=0)
    production_redwood_id = models.IntegerField(_("Production Redwood ID"), blank=True, null=True)
    production_show_code = models.CharField(_("Production Showcode"), max_length=15, blank=True, null=True)
    test_redwood_id = models.IntegerField(_("Test Redwood ID"), blank=True, null=True)
    test_show_code = models.CharField(_("Test Showcode"), max_length=15, blank=True, null=True)

    def build_tasks_from_services(self):
        milestone_templates = Milestone.objects.filter(is_template=True)

        for m in milestone_templates:

            if hasattr(m, 'related_service') and not self.services.contains(m.related_service):
                continue

            else:
                
                tasks = m.tasks.values()
                with transaction.atomic():

                    # Save milestone
                    m.pk = None
                    m.id = None
                    m.parent_project = self
                    m._state.adding = True
                    m.save()

                    # Save tasks
                    for t in tasks:
                        t['parent_milestone_id'] = m.id
                        t['id'] = None
                        t['pk'] = None
                        new_task = Task(**t)
                        new_task.related_service = m.related_service
                        try:
                            new_task.full_clean()
                            new_task.save()
                        except ValidationError as e:
                            raise ValidationError(e)

    def get_completion_percentage(self):

        all_tasks = self.task_set.all()

        if all_tasks.count() < 1:
            return 'N/A'
        
        completed_tasks = self.task_set.filter(status=6)
        task_completion_percentage = (completed_tasks.count() / all_tasks.count()) * 100
        return f"{task_completion_percentage}%"
    
    def __str__(self):
        return f"{self.production_show_code} | {self.parent_event.name}"

# Base Remark
# This model contains fields shared among all project-related tasklist items. This does not represent an actual database table.

class Remark(models.Model):
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

    related_service = models.ForeignKey(
        Service, 
        on_delete = models.SET_NULL, 
        verbose_name =_("Service"),
        related_query_name = 'service',
        blank = True, 
        null = True
    )

    date_created = models.DateTimeField(_("Date Created"), auto_now_add=True, editable=False)
    description = models.TextField(_("Description"), blank=True, null=True)
    title = models.CharField(_("Title"), max_length=150)
    status = models.IntegerField(_("Status"), choices=STATUS_CHOICES, default=0)
    due_date = models.DateField(_("Due Date"), blank=True, null=True)
    priority = models.IntegerField(_("Priority"), choices=PRIORITY_CHOICES, default=0)
    sort_order = models.IntegerField(_("Order"), blank=True, null=True)

    class Meta:
        abstract = True

class Milestone(Remark):
    parent_project = models.ForeignKey( 
        Project,
        verbose_name = _("Parent Project"),
        related_name = 'milestones',
        related_query_name = 'milestones_from_project',
        on_delete = models.CASCADE,
        blank = True,
        null = True
    ) 
    responsible_to = models.ForeignKey(
        get_user_model(),
        verbose_name = _("Responsible To"),
        related_name = 'assigned_milestones',
        related_query_name = 'reponsible_to',
        on_delete = models.SET_NULL,
        blank = True,
        null = True
    )
    created_by = models.ForeignKey(
        get_user_model(),
        verbose_name = _("Created By"),
        related_name = 'created_milestones',
        related_query_name = 'creator_of',
        on_delete = models.SET_NULL,
        blank = True,
        null = True
    )
    is_template = models.BooleanField(_("Is template"), default=False)

    def __str__(self):
        if hasattr(self, 'parent_project') and hasattr(self.parent_project, 'production_show_code'):
            return f"{self.parent_project.production_show_code} -> {self.title}"
        else:
            return f" TEMPLATE -> {self.title}"

class Task(Remark):
    parent_milestone = models.ForeignKey( 
        Milestone,
        verbose_name = _('Parent milestone'),
        related_name = 'tasks',
        related_query_name = 'tasks_from_milestone',
        on_delete = models.CASCADE,
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
        related_name = 'created_tasks',
        related_query_name = 'creator_of',
        on_delete = models.SET_NULL,
        blank = True,
        null = True
    )
    is_system_task = models.BooleanField(_("Is System Task"), default=False)

    def __str__(self):
        if hasattr(self, 'parent_milestone') and hasattr(self.parent_milestone, 'parent_project') and hasattr(self.parent_milestone.parent_project, "production_show_code"):
            return f"{self.parent_milestone.parent_project.production_show_code} -> {self.parent_milestone.title} -> {self.title}"
        else:
            return f" TEMPLATE -> {self.parent_milestone.title} -> {self.title}"