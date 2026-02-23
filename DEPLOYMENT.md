# Backend Deployment Guide

Panduan deployment backend ke VPS dengan Docker dan Nginx Proxy Manager.  
Frontend di Vercel terpisah.

## Arsitektur

```
┌──────────────────────────────────────────────────────────────────┐
│                              VPS                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                  Nginx Proxy Manager                         ││
│  │         api.yourdomain.com → backend:4000                    ││
│  └──────────────────────────────────────────────────────────────┘│
│                              ↓                                    │
│                        npm-network                                │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                    Docker Compose                            ││
│  │     ┌────────────────┐      ┌────────────────┐               ││
│  │     │    Backend     │ ───→ │   PostgreSQL   │               ││
│  │     │     :4000      │      │     :5432      │               ││
│  │     └────────────────┘      └────────────────┘               ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Setup GitHub Actions Secrets

Buka repository backend → **Settings** → **Secrets and variables** → **Actions**

Tambahkan secrets:

| Secret Name | Contoh Value | Keterangan |
|------------|--------------|------------|
| `VPS_HOST` | `123.456.789.0` | IP address VPS |
| `VPS_USERNAME` | `root` | Username SSH |
| `VPS_SSH_KEY` | `-----BEGIN OPENSSH...` | Private key SSH (full) |
| `VPS_PORT` | `22` | Port SSH |
| `DEPLOY_PATH` | `~/energy-backend` | Path di VPS |
| `GH_USERNAME` | `your-username` | Username GitHub |
| `GH_PAT` | `ghp_xxxxx` | Personal Access Token |

### Generate SSH Key

```bash
# Di local machine
ssh-keygen -t ed25519 -C "github-actions-deploy"

# Copy public key ke VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@YOUR_VPS_IP

# Copy isi private key untuk secret VPS_SSH_KEY
cat ~/.ssh/id_ed25519
```

### Generate GitHub PAT

1. Buka https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `read:packages`, `write:packages`
4. Copy token dan simpan di secret `GH_PAT`

---

## Step 2: Setup di VPS

### 2.1 Buat Network untuk NPM

```bash
docker network create npm-network
```

### 2.2 Siapkan Directory

```bash
mkdir -p ~/energy-backend
cd ~/energy-backend
```

### 2.3 Copy docker-compose.yml ke VPS

Upload `docker-compose.yml` dari repo ini ke VPS, atau:

```bash
# Download langsung
curl -o docker-compose.yml https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/docker-compose.yml
```

### 2.4 Buat File `.env`

```bash
nano .env
```

Isi:
```env
# GitHub Repository (format: username/repo-name)
GITHUB_REPO=your-username/backend

# Database
DB_USER=postgres
DB_PASSWORD=YourSecurePassword123!
DB_NAME=energy_monitoring

# JWT
JWT_SECRET=your_very_long_secret_key_minimum_32_characters_here
JWT_EXPIRES_IN=7d

# CORS (URL frontend di Vercel)
CORS_ORIGIN=https://yourdomain.vercel.app

# Docker image tag
TAG=latest
```

---

## Step 3: Jalankan Backend

### 3.1 Login ke GitHub Container Registry

```bash
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### 3.2 Jalankan Services

```bash
cd ~/energy-backend

# Pull dan jalankan
docker compose up -d

# Cek status
docker compose ps

# Cek logs
docker compose logs -f backend
```

### 3.3 Jalankan Migration & Seed

```bash
# Migration
docker compose exec backend npx prisma migrate deploy

# Seed (data awal: superadmin, roles, permissions)
docker compose exec backend npx prisma db seed
```

---

## Step 4: Konfigurasi Nginx Proxy Manager

### Tambah Proxy Host untuk API

1. Buka NPM dashboard (port 81)
2. **Proxy Hosts** → **Add Proxy Host**
3. Isi:
   - **Domain Names**: `api.yourdomain.com`
   - **Scheme**: `http`
   - **Forward Hostname / IP**: `energy-backend`
   - **Forward Port**: `4000`
   - **Websockets Support**: On
4. Tab **SSL**:
   - **SSL Certificate**: Request new certificate
   - **Force SSL**: On

---

## CI/CD Workflow

Setiap push ke branch `main`/`master`:

1. **GitHub Actions** build Docker image
2. Push ke **GitHub Container Registry** (`ghcr.io`)
3. SSH ke **VPS**
4. Pull image terbaru
5. Restart container
6. Jalankan database migration

### Trigger Manual

GitHub → **Actions** → **Deploy Backend to VPS** → **Run workflow**

---

## Commands Berguna

### Logs
```bash
docker compose logs -f backend
docker compose logs -f postgres
```

### Restart
```bash
docker compose restart backend
```

### Update Manual
```bash
cd ~/energy-backend
docker compose pull
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

### Database
```bash
# Masuk psql
docker compose exec postgres psql -U postgres -d energy_monitoring

# Backup
docker compose exec postgres pg_dump -U postgres energy_monitoring > backup.sql

# Restore
cat backup.sql | docker compose exec -T postgres psql -U postgres -d energy_monitoring
```

### Stop
```bash
docker compose down

# Dengan hapus data (HATI-HATI)
docker compose down -v
```

---

## Troubleshooting

### Container tidak bisa connect ke npm-network

```bash
docker network ls | grep npm-network
docker network create npm-network
docker compose down
docker compose up -d
```

### CORS Error

Pastikan `CORS_ORIGIN` di `.env` sama dengan URL frontend:
```env
CORS_ORIGIN=https://yourdomain.vercel.app
```

### Migration Error

```bash
docker compose exec backend npx prisma migrate reset --force
docker compose exec backend npx prisma db seed
```

---

## Default Credentials

Setelah seed, login dengan:
- **Email**: `superadmin@energy.com`
- **Password**: `superadmin123`

⚠️ **Ganti password segera setelah login pertama!**
