from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, **extra_fields):
        if not email:
            raise ValueError(_("The Email must be set"))
        user = self.model(email=email, **extra_fields)
        password = "Pa55w0rd"
        user.set_password(password)
        user.save()
        return user


class User(AbstractUser):
    email = models.EmailField()
    name = models.CharField(max_length=150)
    avatar = models.CharField(max_length=150)
    online = models.BooleanField(default=False)

    objects = UserManager()
