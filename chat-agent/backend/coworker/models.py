from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.contenttypes.fields import GenericForeignKey

from user.models import User


class Coworker(models.Model):
    name = models.CharField(max_length=150)
    subheader = models.CharField(max_length=150)
    desc = models.TextField()
    src = models.ImageField()
    src_large = models.ImageField()
    to_chat = models.BooleanField(default=False)
    benefits = models.JSONField()
    coworker_message = GenericRelation(
        "CoworkerMessage",
        content_type_field="sender_ct",
        object_id_field="sender_id",
    )


class CoworkerChat(models.Model):
    coworker = models.ManyToManyField(
        Coworker,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
    )


class CoworkerMessage(models.Model):
    coworker_chat = models.ForeignKey(
        CoworkerChat,
        on_delete=models.CASCADE,
    )
    content = models.TextField(blank=True)
    tool = models.JSONField(default=dict, null=True)
    timestamp = models.DateTimeField(auto_now=True)
    unread = models.BooleanField(default=False)
    sender_ct = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={"model__in": ("user", "coworker")},
    )
    sender_id = models.PositiveIntegerField()
    sender = GenericForeignKey("sender_ct", "sender_id")
    attachment = models.FileField(
        upload_to="attachment",
        null=True,
        blank=True,
    )
