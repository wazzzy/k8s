from typing import List
from langchain_core.tools import tool, BaseTool
from langchain_community.document_loaders import WebBaseLoader


def scrap_webpage_func(urls: List[str]) -> str:
    """
    Use requests and bs4 to scrape the provided web pages for detailed information.

    Args:
        urls list(str): A list of valid urls to scrap.

    Returns:
        str: The html page content for the given url
    """
    loader = WebBaseLoader(urls)
    docs = loader.load()
    # return "\n\n".join(
    #     [
    #         f'<Document name="{doc.metadata.get("title", "")}">\n{doc.page_content}\n</Document>'
    #         for doc in docs
    #     ]
    # )
    return "\n---".join(
        [
            f"Page title: {doc.metadata.get('title', '')}\nPage content: {doc.page_content}\n"
            for doc in docs
        ]
    )


scrapper: BaseTool = tool(scrap_webpage_func)
scrapper.name = "Scrapper"
