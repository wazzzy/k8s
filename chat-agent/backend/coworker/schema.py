from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    AIMessage,
    ToolMessage,
    ToolCall,
    message_to_dict,
    messages_from_dict,
)
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Literal


class UserInput(BaseModel):
    message: str = Field(
        description="User input to the coworker.",
        examples=["What is the weather in Tokyo?"],
    )
    model: str = Field(
        description="LLM Model to use for the coworker.",
        default="mistral",
        examples=["gpt-4o-mini", "llama3-groq-tool-use", "mistral"],
    )
    thread_id: str | None = Field(
        description="Thread ID to persist and continue a multi-turn conversation.",
        default=None,
        examples=["847c6285-8fc9-4560-a83f-4e6285809254"],
    )
    coworker_name: str | None = Field(
        description="Coworker name to call.",
        default=None,
    )


class StreamInput(UserInput):
    stream_tokens: bool = Field(
        description="Whether to stream LLM tokens to the client.",
        default=True,
    )


class CoworkerResponse(BaseModel):
    message: Dict[str, Any] = Field(
        description="Final response from the coworker, as a serialized LangChain message.",
        examples=[
            {
                "message": {
                    "type": "ai",
                    "data": {
                        "content": "The weather in Tokyo is 70 degrees.",
                        "type": "ai",
                    },
                }
            }
        ],
    )


class ChatMessage(BaseModel):
    type: Literal["human", "ai", "tool"] = Field(
        description="Role of the message.",
        examples=["human", "ai", "tool"],
    )
    content: str = Field(
        description="Content of the message.",
        examples=["Hello, world!"],
    )
    tool_calls: List[ToolCall] = Field(
        description="Tool calls in the message.",
        default=[],
    )
    tool_call_id: str | None = Field(
        description="Tool call that this message is responding to.",
        default=None,
        examples=["call_Jja7J89XsjrOLA5r!MEOW!SL"],
    )
    run_id: str | None = Field(
        description="Run ID of the message.",
        default=None,
        examples=["847c6285-8fc9-4560-a83f-4e6285809254"],
    )
    original: Dict[str, Any] = Field(
        description="Original LangChain message in serialized form.",
        default={},
    )

    @classmethod
    def from_langchain(cls, message: BaseMessage) -> "ChatMessage":
        original = message_to_dict(message)
        match message:
            case HumanMessage():
                human_message = cls(
                    type="human", content=message.content, original=original
                )
                return human_message
            case AIMessage():
                ai_message = cls(type="ai", content=message.content, original=original)
                if message.tool_calls:
                    ai_message.tool_calls = message.tool_calls
                return ai_message
            case ToolMessage():
                tool_message = cls(
                    type="tool",
                    content=message.content,
                    tool_call_id=message.tool_call_id,
                    original=original,
                )
                return tool_message
            case _:
                raise ValueError(
                    f"Unsupported message type: {message.__class__.__name__}"
                )

    def to_langchain(self) -> BaseMessage:
        if self.original:
            return messages_from_dict([self.original])[0]
        match self.type:
            case "human":
                return HumanMessage(content=self.content)
            case _:
                raise NotImplementedError(f"Unsupported message type: {self.type}")

    def pretty_print(self) -> None:
        lc_msg = self.to_langchain()
        lc_msg.pretty_print()
