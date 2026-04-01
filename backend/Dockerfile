 Use a clean Python 3.13 image
FROM python:3.13-slim

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1
# Prevent uv from creating a virtual environment outside the project
ENV UV_LINK_MODE=copy
# Copy project configuration files first for caching
COPY pyproject.toml uv.lock ./

# Install dependencies without the project itself
RUN uv sync --frozen --no-install-project --no-dev --no-cache

# Copy the rest of the application
# Use --chown directly to avoid doubling the layer size with a separate RUN chown
COPY --chown=1000:1000 . .

# Place the venv onto the PATH so we don't need 'uv run'
ENV PATH="/app/.venv/bin:$PATH"

# Hugging Face Spaces requirements
USER 1000
ENV PORT=7860
EXPOSE 7860

# Run the app directly from the venv
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]