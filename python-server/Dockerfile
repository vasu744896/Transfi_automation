FROM python:3.11-slim

WORKDIR /app

# Do NOT copy — we will mount test-results at runtime
# COPY test-results/ ./   

EXPOSE 8081

CMD ["python3", "-m", "http.server", "8081", "--bind", "0.0.0.0"]
