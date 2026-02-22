# FarmTrack Pro

A farm equipment service tracking application to manage tractors, vehicles, service records, filter inventory, and maintenance reminders.

## Features

- **Equipment Management** - Track tractors, vehicles, and other farm equipment
- **Service Records** - Log maintenance with filter usage, dates, hours/mileage, costs
- **Filter Inventory** - Track filter stock with low-stock alerts
- **Service Reminders** - Date-based, hours-based, or mileage-based alerts
- **Dashboard** - Overview stats, alerts, and recent services

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Motor (async MongoDB driver)
- **Database**: MongoDB

---

## External Deployment Guide

### Prerequisites

- Node.js 18+ and Yarn
- Python 3.10+
- MongoDB instance (MongoDB Atlas recommended for cloud)

---

### Option 1: Deploy to Railway (Recommended - Easiest)

Railway can deploy both frontend and backend with MongoDB.

1. **Push code to GitHub**

2. **Create Railway project**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo

3. **Add MongoDB**
   - Click "New" → "Database" → "MongoDB"
   - Copy the connection string

4. **Deploy Backend**
   - Click "New" → "GitHub Repo" → Select your repo
   - Set root directory: `backend`
   - Add environment variables:
     ```
     MONGO_URL=<your-mongodb-connection-string>
     DB_NAME=farmtrack_pro
     CORS_ORIGINS=https://your-frontend-url.railway.app
     ```
   - Railway auto-detects Python and runs with uvicorn

5. **Deploy Frontend**
   - Click "New" → "GitHub Repo" → Select your repo
   - Set root directory: `frontend`
   - Add environment variable:
     ```
     REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
     ```
   - Build command: `yarn build`
   - Start command: `npx serve -s build -l 3000`

---

### Option 2: Deploy to Vercel (Frontend) + Railway/Render (Backend)

#### Frontend on Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root directory: `frontend`
4. Add environment variable:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url.com
   ```
5. Deploy

#### Backend on Render

1. Create new Web Service on [render.com](https://render.com)
2. Connect GitHub repo
3. Set root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   ```
   MONGO_URL=<your-mongodb-connection-string>
   DB_NAME=farmtrack_pro
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   ```

---

### Option 3: Docker Deployment

#### Backend Dockerfile (backend/Dockerfile)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Frontend Dockerfile (frontend/Dockerfile)
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose (docker-compose.yml)
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=farmtrack_pro
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./frontend
      args:
        - REACT_APP_BACKEND_URL=http://localhost:8001
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

---

### MongoDB Atlas Setup (Free Tier)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP addresses (or 0.0.0.0/0 for all)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/farmtrack_pro
   ```

---

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017  # or MongoDB Atlas URL
DB_NAME=farmtrack_pro
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001  # or your deployed backend URL
```

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/equipment | List equipment (paginated) |
| POST | /api/equipment | Create equipment |
| GET | /api/equipment/{id} | Get equipment details |
| PUT | /api/equipment/{id} | Update equipment |
| DELETE | /api/equipment/{id} | Delete equipment |
| GET | /api/filters | List filters (paginated) |
| GET | /api/filters/low-stock | Get low-stock filters |
| POST | /api/filters | Create filter |
| GET | /api/services | List services (paginated) |
| POST | /api/services | Create service record |
| GET | /api/reminders | List reminders (paginated) |
| POST | /api/reminders | Create reminder |
| GET | /api/dashboard/stats | Dashboard statistics |
| GET | /api/dashboard/alerts | Active alerts |

---

## License

MIT License - Feel free to use and modify as needed.
