from langchain import hub
from langgraph.prebuilt import create_react_agent
from langchain.globals import set_debug

from workers.tools import calculator, python_repl
from workers.llms import Model

set_debug(False)
# model = Model.ollama()
MODEL = "llama3.1"
model = Model.langchain(model=MODEL)
tools = [calculator, python_repl]
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

from langchain_core.messages import SystemMessage

NEIL_PREFIX = """You are an agent designed to do mathematical calculations and write python code.
Given an input question, create a syntactically correct python code to run or create a numexpr for the given query, then look at the results of the query and return the answer.
You have access to tools for interacting with the python interpreter.
Only use the below tools. Only use the information returned by the below tools to construct your final answer.
You MUST double check your query before executing it.

If you get an Error while executing python code, it is IMPORTANT that you rewrite the python code and try the tool again."""
system_message = SystemMessage(content=NEIL_PREFIX)


plutus = create_react_agent(
    model,
    tools=tools,
    # messages_modifier=prompt,
    messages_modifier=system_message,
)
path = "./static/graphs"
plutus.get_graph(xray=1).draw_png(f"{path}/plutus.png")

if __name__ == "__main__":
    import asyncio
    from uuid import uuid4
    from dotenv import load_dotenv
    from coworker.schema import ChatMessage

    load_dotenv()

    thread_id = str(uuid4())
    # messages = [
    #     "what is log(20) + log(30) and what about 90",
    #     "What is log(3)",
    #     "what is 2 + 2",
    #     "hello",
    #     "what is log(20) + log(30)",
    #     "what about 90",
    #     "what if i split 4 million oranges in between group of 9 people",
    # ]
    # for message in messages:
    #     input("---")
    while True:
        message = input("Enter you query: ")

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
                plutus.checkpointer = saver

                run_id = uuid4()
                input_message = ChatMessage(type="human", content=message)
                kwargs = dict(
                    input={"messages": [input_message.to_langchain()]},
                    config=RunnableConfig(
                        configurable={"thread_id": thread_id},
                        run_id=run_id,
                    ),
                )

                await print_stream(plutus.astream(**kwargs, stream_mode="values"))

        asyncio.run(main())
