from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter()

router.register("", views.UserView, basename="user-user")

urlpatterns = [*router.urls]
