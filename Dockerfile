# ---------- FRONTEND BUILD ----------
FROM node:20 AS frontend-build

WORKDIR /frontend

COPY Frontend/package*.json ./
RUN npm install

COPY Frontend .
RUN npm run build


# ---------- BACKEND ----------
FROM python:3.11-slim

WORKDIR /app

# install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy backend
COPY Backend ./Backend

# copy frontend build into backend static folder
COPY --from=frontend-build /frontend/build ./FrontendBuild

EXPOSE 8000

CMD ["python", "Backend/app.py"]
