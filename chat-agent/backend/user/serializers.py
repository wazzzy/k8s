from rest_framework import serializers
from . import models


class UserSerializer(serializers.ModelSerializer):
    """User Serializer."""

    class Meta:
        model = models.User
        fields = (
            "email",
            "name",
            "id",
        )

    def create(self, validated_data):
        obj, _ = models.User.objects.update_or_create(
            email=validated_data["email"],
            defaults={"name": validated_data["name"]},
        )
        return obj
