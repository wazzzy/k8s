from django.urls import path
from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter()

router.register("chat", views.CoworkerChatView, basename="coworker-chat")
router.register("message", views.CoworkerMessageView, basename="coworker-message")
router.register("", views.CoworkerView, basename="coworker-coworker")

urlpatterns = [*router.urls]
