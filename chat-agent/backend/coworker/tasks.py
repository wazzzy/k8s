import json
import asyncio

from uuid import UUID, uuid4
from dotenv import load_dotenv
from typing import AsyncGenerator
from typing import Dict, Any, Tuple

# from workers import neil, plutus, neil_plutus
from workers import neil, plutus, neil_plutus, moneta
from langchain_core.runnables import RunnableConfig
from langchain_core.callbacks import AsyncCallbackHandler
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from .schema import ChatMessage, UserInput, StreamInput


load_dotenv()


class StreamHandler(AsyncCallbackHandler):
    """Handler for streaming an asyncio queue."""

    def __init__(self, queue: asyncio.Queue):
        self.queue = queue

    async def on_llm_new_token(self, token: str, **kwargs) -> None:
        if token:
            await self.queue.put(token)


async def _prepare_input_message(user_input: UserInput) -> Tuple[Dict[str, Any], UUID]:
    run_id = uuid4()
    thread_id = user_input.thread_id or str(uuid4())
    input_message = ChatMessage(type="human", content=user_input.message)
    kwargs = dict(
        input={"messages": [input_message.to_langchain()]},
        config=RunnableConfig(
            configurable={
                "thread_id": thread_id,
                "model": user_input.model,
                "recursion_limit": 50,
            },
            run_id=run_id,
        ),
        # recursion_limit=10,
    )
    return kwargs, run_id


async def message_generator(user_input: StreamInput) -> AsyncGenerator[str, None]:
    coworker = neil_plutus
    if user_input.coworker_name and user_input.coworker_name == "plutus":
        coworker = plutus
    if user_input.coworker_name and user_input.coworker_name == "neil":
        coworker = neil
    if user_input.coworker_name and user_input.coworker_name == "moneta":
        coworker = moneta

    async with AsyncSqliteSaver.from_conn_string("co.db") as saver:
        coworker.checkpointer = saver
        kwargs, run_id = await _prepare_input_message(user_input)

        queue = asyncio.Queue(maxsize=10)
        if user_input.stream_tokens:
            kwargs["config"]["callbacks"] = [StreamHandler(queue=queue)]

        async def run_coworker_stream():
            async for node, s in coworker.astream(
                **kwargs, stream_mode="updates", subgraphs=True
            ):
                await queue.put(s)
            await queue.put(None)

        coworker_stream = asyncio.create_task(run_coworker_stream())

        while s := await queue.get():
            if isinstance(s, str):
                yield f"data: {json.dumps({'type': 'token', 'content': s, 'run_id': str(run_id)})}\n\n"
                continue

            new_messages = []
            for _, state in s.items():
                if not state:
                    continue
                state_messages = state.get("messages")
                if state_messages:
                    new_messages.extend(state_messages)

            for message in new_messages:
                try:
                    chat_message = ChatMessage.from_langchain(message)
                    chat_message.run_id = str(run_id)
                except Exception as e:
                    import traceback

                    print(traceback.print_exc())
                    yield f"data: {json.dumps({'type': 'error', 'content': f'Error parsing message: {e}'})}\n\n"
                    continue
                if (
                    chat_message.type == "human"
                    and chat_message.content == user_input.message
                ):
                    continue
                yield f"data: {json.dumps({'type': 'message', 'content': chat_message.dict()})}\n\n"

        await coworker_stream
        yield "data: [FINISHED]\n\n"


async def run(input_string: str) -> AsyncGenerator:
    uu = uuid4()
    stream_input = StreamInput(message=input_string, stream_tokens=True)
    stream_input.thread_id = str(uu)
    return message_generator(stream_input)
