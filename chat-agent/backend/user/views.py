from rest_framework import viewsets
from . import models
from . import serializers


class UserView(viewsets.ModelViewSet):
    """
    **User View**.

    ----------------
    List/Stores the User details
    Get/Update/Delete the User details
    ----------------
    """

    queryset = models.User.objects.filter()
    serializer_class = serializers.UserSerializer
