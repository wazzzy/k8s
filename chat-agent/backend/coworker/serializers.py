import posixpath

from django.conf import settings
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType

from . import models
from user.models import User


class CoworkerSerializer(serializers.ModelSerializer):
    """Coworker Serializer."""

    class Meta:
        model = models.Coworker
        fields = "__all__"


class CoworkerShortSerializer(serializers.ModelSerializer):
    """Coworker Short Serializer."""

    class Meta:
        model = models.Coworker
        fields = (
            "id",
            "name",
            "src",
        )


class CoworkerChatSerializer(serializers.ModelSerializer):
    """CoworkerChat Serializer."""

    def to_representation(self, instance):
        request = self.context.get("request")
        rep = super().to_representation(instance)
        coworker_data = CoworkerShortSerializer(
            instance.coworker.all(),
            many=True,
        ).data

        for each in coworker_data:
            src = each["src"]
            media_avatar = posixpath.join(
                settings.MEDIA_URL,
                src,
            )
            src = request.build_absolute_uri(media_avatar)
            each["avatar"] = src
            each["graph"] = src.replace("media/coworkers", "media/graphs")
            each.pop("src")
        rep["coworker"] = coworker_data
        return rep

    def create(self, validated_data):
        """create method override to create or update CoworkerChat."""
        objs = models.CoworkerChat.objects.filter(
            user=validated_data["user"],
            coworker__in=validated_data["coworker"],
        )
        for each in objs:
            if each.coworker.count() == len(validated_data["coworker"]):
                return each
        obj = models.CoworkerChat.objects.create(
            user=validated_data["user"],
        )
        for a in validated_data["coworker"]:
            obj.coworker.add(a)
        return obj

    class Meta:
        model = models.CoworkerChat
        fields = "__all__"


class ContentObjectRelatedField(serializers.RelatedField):
    """Class for GenerilRelation capability to resolve Coworker/User."""

    def to_representation(self, value):
        if isinstance(value, models.Coworker):
            return value.name
        elif isinstance(value, User):
            return "You"
        raise Exception("Unexpected type of tagged object")


class CoworkerMessageSerializer(serializers.ModelSerializer):
    """CoworkerMessage Serializer."""

    # TODO
    # 10x performance issue.
    sender = ContentObjectRelatedField(read_only=True)
    # sender = "You"

    class Meta:
        model = models.CoworkerMessage
        fields = "__all__"
        read_only_fields = (
            "id",
            "timestamp",
            "sender",
        )


class CoworkerChatMessageSerializer(serializers.ModelSerializer):
    """CoworkerChatMessage Serializer."""

    messages = CoworkerMessageSerializer(
        source="coworkermessage_set",
        many=True,
    )
    act = None

    def to_representation(self, instance):
        """to_representation method override for final representation."""
        # TODO
        MAXMESSAGES = 500
        request = self.context.get("request")
        rep = super().to_representation(instance)
        coworker_data = CoworkerShortSerializer(instance.coworker.all(), many=True).data
        rep["messages"] = rep["messages"][-MAXMESSAGES:]

        for each in coworker_data:
            src = each["src"]
            media_avatar = posixpath.join(
                settings.MEDIA_URL,
                src,
            )
            src = request.build_absolute_uri(media_avatar)
            each["avatar"] = src
            each["graph"] = src.replace("media/coworkers", "media/graphs")
            each.pop("src")
        rep["sender"] = coworker_data
        rep.pop("coworker")
        if not self.act:
            self.act = ContentType.objects.get_for_model(models.Coworker).id
            self.uct = ContentType.objects.get_for_model(User).id
        rep["coworker_chat"] = {"id": rep["id"], "act": self.act, "uct": self.uct}
        return rep

    class Meta:
        model = models.CoworkerChat
        fields = "__all__"
