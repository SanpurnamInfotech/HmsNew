# Base image
FROM node:18

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install backend dependencies
RUN pip3 install -r requirements.txt

# Install frontend dependencies
WORKDIR /app/Frontend
RUN npm install

# Build frontend
RUN npm run build || true

# Install backend dependencies if needed
WORKDIR /app/Backend
RUN pip3 install -r ../requirements.txt

# Expose backend port
EXPOSE 8000

# Start backend server
CMD ["python3", "app.py"]
