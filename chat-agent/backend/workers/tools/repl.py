from typing import Annotated
from langchain_core.tools import tool, BaseTool
from langchain_experimental.utilities import PythonREPL

repl = PythonREPL()


# def python_repl_func(python_code: str):
#     """A Python shell.
#
#     Use this to execute python commands.
#     Input should be a valid python command.
#     If you want to see the output of a value, you should print it out with `print(...)`.
#
#     Args:
#         python_code (str): A valid python code.
#
#     Returns:
#         str: The stdout output of the execution.
#     """
#     try:
#         result = repl.run(python_code)
#     except BaseException as e:
#         return f"Failed to execute. Error: {repr(e)}"
#     return result
def python_repl_func(python_code: str):
    """A Python shell. Use this to execute python commands.
    Input should be a valid python command.
    Output should be the stdout output of the execution.
    """
    try:
        result = repl.run(python_code)
    except BaseException as e:
        return f"Failed to execute. Error: {repr(e)}"
    return result


python_repl: BaseTool = tool(python_repl_func)
python_repl.name = "python_repl"
