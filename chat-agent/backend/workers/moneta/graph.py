import uuid
import json
from langchain_community.document_loaders import WebBaseLoader
from langchain_chroma import Chroma
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    SystemMessage,
    HumanMessage,
    ToolMessage,
    ToolCall,
)
from coworker.schema import ChatMessage
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.tools import DuckDuckGoSearchResults
from langchain_core.runnables.graph import CurveStyle, MermaidDrawMethod, NodeStyles


from workers import neil_plutus


# MODEL = "mistral"
MODEL = "llama3.1"
TRANSFORM_LIMIT = 1
TEMP = 0
urls = [
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
    "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
]

docs = [WebBaseLoader(url).load() for url in urls]
docs_list = [item for sublist in docs for item in sublist]

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=250, chunk_overlap=0
)
doc_splits = text_splitter.split_documents(docs_list)

local_embeddings = OpenAIEmbeddings(
    check_embedding_ctx_length=False,
    base_url="http://localhost:5001/v1",
    api_key="lm-studio",
    model="nomic-ai/nomic-embed-text-v1.5-GGUF",
)

# Add to vectorDB
vectorstore = Chroma.from_documents(
    doc_splits,
    local_embeddings,
    collection_name="rag-chroma",
)
print("-", len(vectorstore.get()["documents"]))
retriever = vectorstore.as_retriever()

# LLM
#
from langchain_community.chat_models import ChatOllama
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate

llm_json = ChatOllama(
    model=MODEL,
    format="json",
    temperature=TEMP,
    disable_streaming=True,
)
llm = ChatOllama(
    model=MODEL,
    temperature=TEMP,
)

# Retreiver Grader
#

prompt = PromptTemplate(
    template="""You are a grader assessing relevance of a retrieved document to a user question. \n
    Here is the retrieved document: \n\n {document} \n\n
    Here is the user question: {question} \n
    If the document contains keywords related to the user question, grade it as relevant. \n
    It does not need to be a stringent test. The goal is to filter out erroneous retrievals. \n
    Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question. \n
    Provide the binary score as a JSON with a single key 'score' and no premable or explanation.""",
    input_variables=["question", "document"],
)

retrieval_grader = prompt | llm | JsonOutputParser()
# question = "agent memory"
# docs = retriever.get_relevant_documents(question)
# doc_txt = docs[0].page_content
# print(retrieval_grader.ainvoke({"question": question, "document": doc_txt}))

# Generate
#

from langchain_core.output_parsers import StrOutputParser
from langchain import hub

# Prompt
prompt = hub.pull("rlm/rag-prompt")


# Post-processing
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


# Chain
rag_chain = prompt | llm

# Run
# generation = rag_chain.ainvoke({"context": docs, "question": question})
# print(generation)

# Hallucination Grader

# Prompt
prompt = PromptTemplate(
    template="""You are a grader assessing whether an answer is grounded in / supported by a set of facts. \n
    Here are the facts:
    \n ------- \n
    {documents}
    \n ------- \n
    Here is the answer: {generation}
    Give a binary score 'yes' or 'no' score to indicate whether the answer is grounded in / supported by a set of facts. \n
    Provide the binary score as a JSON with a single key 'score' and no preamble or explanation.""",
    input_variables=["generation", "documents"],
)

hallucination_grader = prompt | llm_json | JsonOutputParser()
# op = hallucination_grader.ainvoke({"documents": docs, "generation": generation})
# print("hallucination Grader:", op)


# Answer Grader

# Prompt
prompt = PromptTemplate(
    template="""You are a grader assessing whether an answer is useful to resolve a question. \n
    Here is the answer:
    \n ------- \n
    {generation}
    \n ------- \n
    Here is the question: {question}
    Give a binary score 'yes' or 'no' to indicate whether the answer is useful to resolve a question. \n
    Provide the binary score as a JSON with a single key 'score' and no preamble or explanation.""",
    input_variables=["generation", "question"],
)

answer_grader = prompt | llm_json | JsonOutputParser()
# op = answer_grader.ainvoke({"question": question, "generation": generation})
# print("answer Grader:", op)

# Question Rewriter
#

# Prompt
re_write_prompt = PromptTemplate(
    template="""You a question re-writer that converts an input question to a better version that is optimized \
for vectorstore retrieval. Look at the initial and formulate an improved question. \n
Here is the initial question: \n\n {question}. Improved question with no preamble: \n""",
    input_variables=["generation", "question"],
)

question_rewriter = re_write_prompt | llm | StrOutputParser()
# op = question_rewriter.ainvoke({"question": question})
# print("Question rewriter: ", op)

# Graph

from pprint import pprint
import operator
from typing import List, Annotated, Sequence

from langchain_core.documents import Document
from typing_extensions import TypedDict

from langgraph.graph import END, StateGraph, START

### State


class GraphState(TypedDict):
    """
    Represents the state of our graph.

    Attributes:
        question: question
        generation: LLM generation
        documents: list of documents
    """

    question: str = ""
    transformed_question: Annotated[List[str], operator.add]
    answer_retrieved: bool = False
    generation: str
    documents: List[str]
    messages: Annotated[Sequence[BaseMessage], operator.add]


### Nodes


async def retrieve(state):
    """
    Retrieve documents from vectorstore

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, documents, that contains retrieved documents
    """
    print("---RETRIEVE---")
    question = state.get("question")
    messages = state["messages"]
    if not question:
        question = messages[-1].content
    transformed_question = state["transformed_question"]
    if transformed_question:
        question = transformed_question[-1]

    # Retrieval
    # Multi ways of retirever invokation
    documents = await retriever.ainvoke(question)
    # documents = retriever.get_relevant_documents(question)

    tool_call_id = str(uuid.uuid4())
    tool_calls = [
        ToolCall(
            name="retrieve",
            args={"question": question},
            type="tool_call",
            # id="retreive-id",
            id=tool_call_id,
        )
    ]
    messages = []
    messages.append(
        AIMessage(
            type="ai",
            content="",
            tool_call_id=tool_call_id,
            run_id=str(uuid.uuid4()),
            original={},
            tool_calls=tool_calls,
        )
    )
    messages.append(
        ToolMessage(
            content="\n".join([d.page_content for d in documents]),
            name="retrieve",
            tool_call_id=tool_call_id,
        )
    )

    return {"documents": documents, "question": question, "messages": messages}


async def generate(state):
    """
    Generate answer using RAG on retrieved documents

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, generation, that contains LLM generation
    """
    print("---GENERATE---")
    question = state["question"]
    documents = state["documents"]

    # RAG generation
    generation = await rag_chain.ainvoke({"context": documents, "question": question})
    generated_response = generation.content

    messages = []
    messages.append(
        AIMessage(
            type="ai",
            content=generated_response,
            run_id=str(uuid.uuid4()),
            # original={"data": {"response_metadata": generation.response_metadata}},
            response_metadata=generation.response_metadata,
        )
    )
    return {
        "documents": documents,
        "question": question,
        "generation": generated_response,
        "messages": messages,
    }


async def grade_documents(state):
    """
    Determines whether the retrieved documents are relevant to the question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates documents key with only filtered relevant documents
    """

    print("---CHECK DOCUMENT RELEVANCE TO QUESTION---")
    question = state["question"]
    documents = state["documents"]

    # Score each doc
    filtered_docs = []
    grader_output = []
    for d in documents:
        score = await retrieval_grader.ainvoke(
            {"question": question, "document": d.page_content}
        )
        grade = score.get("score", "no")
        # Document relevant
        if grade.lower() == "yes":
            print("---GRADE: DOCUMENT RELEVANT---")
            print(f"  - {d.page_content} - \n")
            filtered_docs.append(d)
            grader_output.append({"relevant": True})
        # Document not relevant
        else:
            grader_output.append({"relevant": False})
            print("---GRADE: DOCUMENT NOT RELEVANT---")
            # We do not include the document in filtered_docs
            # We set a flag to indicate that we want to run web search
            continue
    answer_retrieved = True if filtered_docs else False

    tool_call_id = str(uuid.uuid4())
    tool_calls = [
        ToolCall(
            name="grader",
            args={"question": question},
            type="tool_call",
            # id="grader-id",
            id=tool_call_id,
        )
    ]
    messages = []
    messages.append(
        AIMessage(
            type="ai",
            content="",
            tool_call_id=tool_call_id,
            run_id=str(uuid.uuid4()),
            original={},
            tool_calls=tool_calls,
        )
    )
    messages.append(
        ToolMessage(
            content=json.dumps(grader_output),
            name="grader",
            tool_call_id=tool_call_id,
        )
    )
    if filtered_docs:
        documents = filtered_docs

    return {
        "documents": documents,
        "question": question,
        "answer_retrieved": answer_retrieved,
        "messages": messages,
    }


async def transform_query(state):
    """
    Transform the query to produce a better question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates question key with a re-phrased question
    """

    print("---TRANSFORM QUERY---")
    print(" - State info: ", state)
    question = state["question"]
    documents = state["documents"]
    transformed_question = state["transformed_question"]

    # Re-write question
    better_question = await question_rewriter.ainvoke({"question": question})
    if better_question:
        transformed_question = []
        transformed_question.append(better_question)
        print(f" - Better question: {better_question}")

    tool_call_id = str(uuid.uuid4())
    tool_calls = [
        ToolCall(
            name="transform_query",
            args={"question": question},
            type="tool_call",
            # id="transformquery-id",
            id=tool_call_id,
        )
    ]
    messages = []
    messages.append(
        AIMessage(
            type="ai",
            content="",
            tool_call_id=tool_call_id,
            run_id=str(uuid.uuid4()),
            original={},
            tool_calls=tool_calls,
        )
    )
    messages.append(
        ToolMessage(
            content="\n".join(transformed_question),
            name="transform_query",
            tool_call_id=tool_call_id,
        )
    )

    return {
        "documents": documents,
        "question": question,
        "transformed_question": transformed_question,
        "messages": messages,
    }


async def assistant_with_tools(state, config):
    """
    Web search based based on the question

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Appended web results to documents
    """

    print("---Neil plutus---")
    question = state["question"]
    documents = state.get("documents", [])
    answer_retrieved = state["answer_retrieved"]

    # Web search
    input_message = ChatMessage(type="human", content=question)
    # input_message = HumanMessage(content=question)
    # input = {
    #     "input": {
    #         "messages": state["messages"]
    #         + [SystemMessage(content="you are a helpful agent.")]
    #         + [input_message]
    #     }
    # }

    # input = {
    #     "input": {
    #         "messages": [SystemMessage(content="you are a helpful agent.")]
    #         + [input_message]
    #     }
    # }

    kwargs = dict(
        input={
            # "question": message,
            "messages": [input_message.to_langchain()],
        },
        config=config,
    )
    web_results = await neil_plutus.ainvoke(**kwargs)

    # input = {"input": {"messages": [input_message]}}
    # web_results = await neil_plutus.ainvoke(**input)

    # web_results = "\n".join([d["content"] for d in docs])
    sub_graph_results = None
    content = web_results["messages"][-1].content
    if isinstance(web_results["messages"][-1], AIMessage) and content:
        sub_graph_results = Document(page_content=content)
    if documents is not None and sub_graph_results:
        documents.append(sub_graph_results)
    else:
        documents = [sub_graph_results]

    answer_retrieved = True if documents else False
    print("answer_retrieved", answer_retrieved)
    print("\n\n\n\n\n\nanswers", documents)

    tool_call_id = str(uuid.uuid4())
    tool_calls = [
        ToolCall(
            name="neilplutus",
            args={"question": question},
            type="tool_call",
            # id="neilplutus-id",
            id=tool_call_id,
        )
    ]
    messages = []
    messages.append(
        AIMessage(
            type="ai",
            content="",
            tool_call_id=tool_call_id,
            run_id=str(uuid.uuid4()),
            original={},
            tool_calls=tool_calls,
        )
    )
    for d in documents:
        messages.append(
            ToolMessage(
                content=json.dumps([d.page_content for d in documents]),
                name="neilplutus",
                tool_call_id=tool_call_id,
            )
        )
    return {
        "documents": documents,
        "question": question,
        "answer_retrieved": answer_retrieved,
        # "messages": messages,
    }


# Edges
async def decide_to_generate(state):
    """
    Determines whether to generate an answer, or re-generate a question.

    Args:
        state (dict): The current graph state

    Returns:
        str: Binary decision for next node to call
    """
    print("---ASSESS GRADED DOCUMENTS---")
    # state["question"]
    filtered_documents = state["documents"]
    answer_retrieved = state["answer_retrieved"]
    print("answer_retrieved", answer_retrieved)
    already_transformed = len(state["transformed_question"])

    if not filtered_documents and already_transformed < TRANSFORM_LIMIT:
        # All documents have been filtered check_relevance
        # We will re-generate a new query
        print(
            "---DECISION: ALL DOCUMENTS ARE NOT RELEVANT TO QUESTION, TRANSFORM QUERY---"
        )
        return "transform_query"
    elif answer_retrieved:
        print("---DECISION: GENERATE---")
        return "generate"
    else:
        # We have relevant documents, so generate answer
        return "assistant_with_tools"


async def grade_generation_v_documents_and_question(state):
    """
    Determines whether the generation is grounded in the document and answers question.

    Args:
        state (dict): The current graph state

    Returns:
        str: Decision for next node to call
    """

    print("---CHECK HALLUCINATIONS---")
    question = state["question"]
    documents = state["documents"]
    generation = state["generation"]

    score = await hallucination_grader.ainvoke(
        {"documents": documents, "generation": generation}
    )
    grade = score["score"]

    # Check hallucination
    if grade == "yes":
        print("---DECISION: GENERATION IS GROUNDED IN DOCUMENTS---")
        # Check question-answering
        print("---GRADE GENERATION vs QUESTION---")
        score = await answer_grader.ainvoke(
            {"question": question, "generation": generation}
        )
        grade = score["score"]
        if grade == "yes":
            print("---DECISION: GENERATION ADDRESSES QUESTION---")
            return "useful"
        else:
            print("---DECISION: GENERATION DOES NOT ADDRESS QUESTION---")
            return "not useful"
    else:
        print("---DECISION: GENERATION IS NOT GROUNDED IN DOCUMENTS, RE-TRY---")
        return "not supported"


workflow = StateGraph(GraphState)

# Define the nodes
workflow.add_node("retrieve", retrieve)  # retrieve
workflow.add_node("grade_documents", grade_documents)  # grade documents
workflow.add_node("generate", generate)  # generatae
workflow.add_node("transform_query", transform_query)  # transform_query
# workflow.add_node("assistant_with_tools", assistant_with_tools)  # web search
workflow.add_node("assistant_with_tools", assistant_with_tools)  # web search

# Build graph
workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {
        "assistant_with_tools": "assistant_with_tools",
        "transform_query": "transform_query",
        "generate": "generate",
    },
)
# workflow.add_edge("assistant_with_tools", "grade_documents")
workflow.add_edge("transform_query", "retrieve")
workflow.add_conditional_edges(
    "generate",
    grade_generation_v_documents_and_question,
    {
        "not supported": "generate",
        "useful": END,
        "not useful": "transform_query",
    },
)

# Compile
moneta = workflow.compile()
path = "./static/graphs"
moneta.get_graph(xray=1).draw_png(f"{path}/moneta.png")
# moneta.get_graph().draw_mermaid_png(
#     curve_style=CurveStyle.LINEAR,
#     node_colors=NodeStyles(first="#ffdfba", last="#baffc9", default="#fad7de"),
#     wrap_label_n_words=9,
#     output_file_path="moneta-mermaid.png",
#     draw_method=MermaidDrawMethod.API,
#     background_color="white",
#     padding=2,
# )
print("Graph ready...")

# # Test
# while True:
#     query = input("Enter query: ")
#     # inputs = {"question": "What are the types of agent memory?"}
#     input_message = ChatMessage(type="human", content=query)
#     inputs = {"question": query, "messages": [input_message.to_langchain()]}
#     for output in moneta.stream(inputs):
#         for key, value in output.items():
#             pprint(f"Finished running: {key}:")
#
#     pprint(value["generation"])
#
#
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
                moneta.checkpointer = saver

                run_id = uuid4()
                thread_id = str(uuid4())
                # thread_id = str(9322232342342343233)
                input_message = ChatMessage(type="human", content=message)
                kwargs = dict(
                    input={
                        # "question": message,
                        "messages": [input_message.to_langchain()],
                    },
                    config=RunnableConfig(
                        configurable={"thread_id": thread_id},
                        run_id=run_id,
                    ),
                )

                await print_stream(moneta.astream(**kwargs, stream_mode="values"))

        input("---")
        asyncio.run(main())
