import uuid
import json

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import StreamingHttpResponse

from . import models
from . import serializers
from .tasks import message_generator
from .schema import StreamInput, ChatMessage

id = str(uuid.uuid4())


class CoworkerView(viewsets.ModelViewSet):
    """
    **Coworker View**.

    ----------------
    List/Stores the Coworker details
    Get/Update/Delete the Coworker details
    ----------------
    """

    queryset = models.Coworker.objects.filter()
    serializer_class = serializers.CoworkerSerializer


class CoworkerChatView(viewsets.ModelViewSet):
    """
    **CoworkerChat View**.

    ----------------
    List/Stores the CoworkerChat details
    Get/Update/Delete the CoworkerChat details
    ----------------
    """

    queryset = models.CoworkerChat.objects.filter()
    serializer_class = serializers.CoworkerChatSerializer

    @action(detail=False, serializer_class=serializers.CoworkerChatMessageSerializer)
    def all(self, request, *args, **kwargs):
        """The method to use differenet serializer class."""
        return super().list(request, *args, **kwargs)

    def _parse_stream_line(self, line: str) -> ChatMessage | str | None:
        line = line.strip()
        if line.startswith("data: "):
            data = line[6:]
            if data == "[FINISHED]":
                return None
            try:
                parsed = json.loads(data)
            except Exception as e:
                raise Exception(f"Error JSON parsing message from server: {e}")
            match parsed["type"]:
                case "message":
                    # Convert the JSON formatted message to an AnyMessage
                    try:
                        return parsed
                        # return ChatMessage.parse_obj(parsed["content"])
                    except Exception as e:
                        raise Exception(f"Server returned invalid message: {e}")
                case "token":
                    # Yield the str token directly
                    return parsed
                case "error":
                    raise Exception(parsed["content"])

    @action(
        detail=True,
        methods=["POST"],
        # serializer_class=serializers.CoworkerChatMessageSerializer,
    )
    def stream(self, request, pk=None):
        request_data = request.data
        input_string = request_data["query"]
        coworker_name = request_data["coworker_name"]

        async def generate_response():
            try:
                stream_input = StreamInput(message=input_string, stream_tokens=True)
                stream_input.thread_id = str(id)
                stream_input.coworker_name = coworker_name
                output_generator = message_generator(stream_input)
                async for line in output_generator:
                    if line.strip():
                        parsed = self._parse_stream_line(line)
                        if not parsed:
                            break
                        if type(parsed) == dict:
                            y = json.dumps(parsed) + "\n"
                            print("y:", y)
                            yield y
                        else:
                            print("no dict", parsed)
            except Exception:
                import traceback

                traceback.print_exc()

        response = StreamingHttpResponse(
            generate_response(), content_type="text/event-stream"
        )
        response["X-Accel-Buffering"] = "no"  # Disable buffering in nginx
        response["Cache-Control"] = "no-cache"
        return response


class CoworkerMessageView(viewsets.ModelViewSet):
    """
    **CoworkerMessage View**.

    ----------------
    List/Stores the CoworkerMessage details
    Get/Update/Delete the CoworkerMessage details
    ----------------
    """

    queryset = models.CoworkerMessage.objects.filter()
    serializer_class = serializers.CoworkerMessageSerializer
