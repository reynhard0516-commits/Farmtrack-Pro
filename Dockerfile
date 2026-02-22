# Backend
FROM python:3.11-slim as backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend .

# Frontend
FROM node:20 as frontend
WORKDIR /app
COPY frontend/package.json .
COPY frontend/yarn.lock .
RUN yarn install
COPY frontend .
RUN yarn build

# Final image
FROM python:3.11-slim
WORKDIR /app
COPY --from=backend /app /app
COPY --from=frontend /app/dist /app/static
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
