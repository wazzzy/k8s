from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage

HISTORICAL_MESSAGES = 5


def concat_history(current: list, new: list):
    total_messages = current + new

    messages = []
    for message in total_messages[::-1]:
        messages.append(message)
        if len(messages) >= HISTORICAL_MESSAGES:
            if messages[-1].type != "tool":
                break

    return messages[::-1]


class BaseState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], concat_history]
