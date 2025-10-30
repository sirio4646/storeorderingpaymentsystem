"""WSGI entrypoint for deployment platforms that call `gunicorn main:app`.

This file exposes the Flask `app` object from `backend.app` at module-level
name `app` so Gunicorn can import `main:app`.
"""
from backend.app import app


if __name__ == "__main__":
    # Simple local run for debugging
    app.run(host="0.0.0.0", port=8080, debug=True)
