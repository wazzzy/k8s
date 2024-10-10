```
# Environment
conda activate langgraph

# Commands
python -m celery -A backend worker -l info
python -m gunicorn backend.asgi:application -k uvicorn.workers.UvicornWorker

python -m gunicorn backend.asgi_streamhttp:application -k uvicorn.workers.UvicornWorker
```
