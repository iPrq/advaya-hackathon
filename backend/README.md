---
title: Ageis Medical Companion Backend
emoji: 🏥
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Ageis Medical Companion Backend

This is the FastAPI backend for the **Ageis Medical Companion** application. It provides real-time medical document analysis, safety monitoring, and health-related web summarization.

## Features
- **AI Report Analysis**: Uses Google's Gemini 1.5 Flash Vision to parse medical prescriptions and lab reports.
- **Fall Detection**: Real-time monitoring of Wi-Fi CSI data using an Artificial Neural Network (ANN) model.
- **Health Summaries**: AI-driven summarization for clinical data and health resources.

## Deployment

This repository is optimized for deployment on **Hugging Face Spaces** using the Docker SDK.

### Configuration
- **SDK**: Docker
- **Port**: 7860
- **Base Image**: Python 3.13-slim (managed via `uv`)

### Environment Variables
To run this backend, you must configure the following secrets in your Hugging Face Space settings:
- `GEMINI_API_KEY`: Your Google AI Studio API key.
- `GROQ_API_KEY`: Your Groq API key (optional, for summarization services).

## Local Development
If you want to run this locally:
1. Install `uv`: `pip install uv`
2. Sync dependencies: `uv sync`
3. Start the server: `uv run uvicorn main:app --host 0.0.0.0 --port 7860`
