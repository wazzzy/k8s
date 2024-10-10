from langchain import hub
from langgraph.prebuilt import create_react_agent
from langchain.globals import set_debug

from workers.tools import web_search, scrapper
from workers.llms import Model

set_debug(False)
# model = Model.ollama()
MODEL = "llama3.1"
model = Model.langchain(model=MODEL)
tools = [web_search, scrapper]
tool_names = [w.name for w in tools]

# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
#
# prompt = ChatPromptTemplate.from_messages(
#     [
#         (
#             "system",
#             "You are a helpful AI assistant, collaborating with other assistants."
#             " Use the provided tools to progress towards answering the question."
#             " If you are unable to fully answer, that's OK, another assistant with different tools "
#             " will help where you left off. Execute what you can to make progress."
#             " If you or any of the other assistants have the final answer or deliverable,"
#             " prefix your response with FINAL ANSWER so the team knows to stop."
#             f" You have access to the following tools: {tool_names}.",
#         ),
#         MessagesPlaceholder(variable_name="messages"),
#     ]
# )

neil = create_react_agent(
    model,
    tools=tools,
    # messages_modifier=prompt,
)
path = "./static/graphs"
neil.get_graph(xray=1).draw_png(f"{path}/neil.png")

if __name__ == "__main__":
    import asyncio
    from uuid import uuid4
    from dotenv import load_dotenv
    from coworker.schema import ChatMessage

    load_dotenv()

    # messages = [
    #     "hello",
    #     "who is the father of nation",
    #     "who is the founder of e42.ai",
    # ]
    # for message in messages:
    #     input("---")
    while True:
        message = input("Enter query: ")

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
                neil.checkpointer = saver

                run_id = uuid4()
                # thread_id = str(uuid4())
                thread_id = str(88)
                input_message = ChatMessage(type="human", content=message)
                kwargs = dict(
                    input={"messages": [input_message.to_langchain()]},
                    config=RunnableConfig(
                        configurable={"thread_id": thread_id},
                        run_id=run_id,
                        limit=5,
                    ),
                )

                await print_stream(neil.astream(**kwargs, stream_mode="values"))

        asyncio.run(main())
