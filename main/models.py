
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    email = models.EmailField(_('Email Address'), unique=True)
    username = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

class Comment(models.Model):
    mentions = models.ManyToManyField(get_user_model())
    text = models.TextField(_("Text"))

class Event(models.Model):
    name = models.CharField(_("Name"), max_length=150)
    date_created = models.DateTimeField(_("Created at Date"), auto_now_add=True, editable=False)
    last_modified = models.DateTimeField(_("Last Modified Date"), auto_now=True)
    start_date = models.DateField(_("Start Date"))
    end_date = models.DateField(_("End Date"))
    travel_in_date = models.DateField(_("Travel In Date"))
    travel_out_date = models.DateField(_("Travel Out Date"))

    timetracking_url = models.URLField(_("Timetracking URL"), blank=True, null=True)
    external_project_url = models.URLField(_("External Project URL"), blank=True, null=True)
    sharepoint_url = models.URLField(_("Sharepoint URL"), blank=True, null=True)

    class Meta:
        ordering = ["travel_in_date"]

    def __str__(self):
        if hasattr(self, "project"):
            return f"[ {self.project.production_show_code} ] {self.name}, {self.start_date} - {self.end_date}"
        else:
            return f"[ - ] {self.name}, {self.start_date} - {self.end_date}"