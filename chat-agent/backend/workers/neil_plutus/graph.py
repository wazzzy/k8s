from langchain import hub
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langchain.globals import set_debug

from workers.tools import calculator, python_repl, web_search, scrapper
from workers.llms import Model

set_debug(True)
# model = Model.ollama()
MODEL = "llama3.1"
model = Model.langchain(model=MODEL)
tools = [calculator, python_repl, web_search, scrapper]
memory = MemorySaver()

neil_plutus = create_react_agent(
    model,
    tools=tools,
)
path = "./static/graphs"
neil_plutus.get_graph(xray=1).draw_png(f"{path}/neil_plutus.png")

if __name__ == "__main__":
    import asyncio
    from uuid import uuid4
    from dotenv import load_dotenv
    from coworker.schema import ChatMessage

    load_dotenv()

    messages = [
        "what is log(20) + log(30) and what about 90",
        "What is log(3)",
        "what is 2 + 2",
        "hello",
        "what is log(20) + log(30)",
        "what about 90",
        "what if i split 4 million oranges in between group of 9 people",
    ]
    for message in messages:

        async def print_stream(stream):
            async for s in stream:
                try:
                    message = s["messages"][-1]
                    if isinstance(message, tuple):
                        print(message)
                    else:
                        message.pretty_print()
                except Exception as e:
                    print(e)

        async def main():
            from langchain_core.runnables import RunnableConfig

            from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

            async with AsyncSqliteSaver.from_conn_string("try.db") as saver:
                neil_plutus.checkpointer = saver

                run_id = uuid4()
                # thread_id = str(uuid4())
                thread_id = str(932)
                input_message = ChatMessage(type="human", content=message)
                kwargs = dict(
                    input={"messages": [input_message.to_langchain()]},
                    config=RunnableConfig(
                        configurable={"thread_id": thread_id},
                        run_id=run_id,
                    ),
                )

                await print_stream(neil_plutus.astream(**kwargs, stream_mode="values"))

        input("---")
        asyncio.run(main())
