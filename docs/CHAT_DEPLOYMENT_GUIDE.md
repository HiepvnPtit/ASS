# Real-Time Chat Deployment Guide

## Pre-Deployment Checklist

### Code Implementation
- [x] TinNhan entity created (`src/entities/tin-nhan.entity.ts`)
- [x] SendMessageDto created (`src/trips/dto/send-message.dto.ts`)
- [x] TripsService updated with message methods
- [x] TripsGateway updated with send_message handler
- [x] TripsController updated with GET /messages endpoint
- [x] TripsModule updated with TinNhan import
- [ ] Build verification (`npm run build`)
- [ ] Lint check (`npm run lint`)
- [ ] Type check (`npm run type-check`)

### Database
- [ ] Migration script reviewed (`database.tin-nhan.sql`)
- [ ] Migration executed on development database
- [ ] Tables verified with `\dt tin_nhan` in psql
- [ ] Indexes created and verified
- [ ] Sample data inserted (optional)

### Testing
- [ ] Unit tests written for new service methods
- [ ] WebSocket integration tests created
- [ ] E2E tests for message flow
- [ ] Manual testing with test script (`test-chat-api.ps1`)
- [ ] Load testing (optional)

### Documentation
- [ ] Implementation guide complete
- [ ] Quick reference guide complete
- [ ] API documentation updated
- [ ] README updated with chat feature
- [ ] Deployment guide (this file) complete

## Step-by-Step Deployment

### 1. Build Verification

```bash
# Clear previous build
npm run clean

# Build TypeScript
npm run build

# Check for errors
echo "Build status: $?"  # Should be 0 (success)

# Run linter
npm run lint

# Type check
npm run type-check
```

**Expected Output:**
```
> nestjs-boilerplate@1.0.0 build
> tsc

# No errors should appear
```

### 2. Database Migration

```bash
# Development Environment
psql -U postgres -d your_dev_db -f database.tin-nhan.sql

# Staging Environment
psql -U postgres -d your_staging_db -f database.tin-nhan.sql

# Production Environment (with backup first!)
pg_dump -U postgres your_prod_db > backup_$(date +%Y%m%d_%H%M%S).sql
psql -U postgres -d your_prod_db -f database.tin-nhan.sql
```

**Verification:**
```bash
# Connect to database
psql -U postgres -d your_db_name

# List tables
\dt tin_nhan

# Show table structure
\d tin_nhan

# Verify indexes
\di *tin_nhan*

# Sample query
SELECT COUNT(*) FROM tin_nhan;
```

### 3. Environment Configuration

Add to `.env` file:

```env
# WebSocket Configuration
WS_NAMESPACE=/trips
WS_PORT=3000
WS_CORS_ORIGIN=http://localhost:3000,https://app.yourdomain.com
WS_CORS_CREDENTIALS=true

# Database (verify existing)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=your_database

# JWT (verify existing)
JWT_SECRET=your_secret_key
JWT_EXPIRATION=24h

# Optional: Redis for scaling
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 4. Dependency Verification

```bash
# Ensure required packages are installed
npm list @nestjs/websockets
npm list socket.io
npm list typeorm
npm list class-validator

# Install if missing
npm install @nestjs/websockets socket.io
```

### 5. Start Services

```bash
# Start PostgreSQL (if not running)
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: net start PostgreSQL

# Start Redis (optional, for production scaling)
# redis-server

# Start NestJS development server
npm run start:dev

# Or production build
npm run build
npm run start:prod
```

**Expected Output:**
```
[Nest] 12345  - 05/25/2026, 10:30:45 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 05/25/2026, 10:30:45 AM     LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 12345  - 05/25/2026, 10:30:45 AM     LOG [InstanceLoader] TripsModule dependencies initialized
[Nest] 12345  - 05/25/2026, 10:30:46 AM     LOG [NestApplication] Nest application successfully started
```

### 6. Verify API Endpoints

```bash
# Test HTTP endpoint
curl -X GET http://localhost:3000/trips/CD-12345/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected response
{
  "message": "Messages retrieved successfully",
  "data": [],
  "count": 0
}
```

### 7. Test WebSocket Connection

Use the test script:

```bash
# PowerShell
.\test-chat-api.ps1 -BaseUrl http://localhost:3000

# Or test via browser console
# See docs/CHAT_IMPLEMENTATION_GUIDE.md for client examples
```

### 8. Monitor Logs

```bash
# Watch for WebSocket events
npm run start:dev | grep -i "websocket\|socket\|message\|tin"

# Or use PM2 for production
pm2 start dist/main.js --name "nest-api"
pm2 logs nest-api
```

## Production Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Build and run:**
```bash
docker build -t nest-chat-api:latest .
docker run -p 3000:3000 \
  -e DB_HOST=postgres \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_secret \
  nest-chat-api:latest
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nest-chat-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nest-chat-api
  template:
    metadata:
      labels:
        app: nest-chat-api
    spec:
      containers:
      - name: api
        image: nest-chat-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DB_HOST
          value: postgres-service
        - name: REDIS_HOST
          value: redis-service
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Cloud Deployment (AWS/GCP/Azure)

#### AWS ECS

1. Create ECR repository
2. Build and push image
3. Create ECS task definition
4. Create ECS service
5. Configure load balancer for WebSocket support (ALB, not NLB)

**Important:** Ensure ALB is configured for WebSocket:
- Enable "stickiness" for WebSocket persistence
- Use long-lived connections
- Set timeout to 60+ seconds

#### Google Cloud Run

```bash
# Build and deploy
gcloud run deploy nest-chat-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars DB_HOST=cloudsql-proxy,JWT_SECRET=...
```

**Note:** Cloud Run has 60-second timeout limit - may not be suitable for long-lived WebSocket connections.

## SSL/TLS Configuration

### nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # WebSocket configuration
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

### Client WebSocket Connection (Secure)

```typescript
// Use WSS protocol for HTTPS
const socket = io('https://api.yourdomain.com/trips', {
  secure: true,
  auth: {
    userId: 'ND-12345'
  }
});
```

## Performance Optimization

### Redis Adapter (for scaling)

```bash
# Install Redis adapter
npm install @socket.io/redis-adapter redis
```

**Configure in main.ts:**
```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

async function bootstrap() {
  // ... existing setup ...

  const pubClient = createClient({ host: 'localhost', port: 6379 });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));
}
```

### Database Connection Pooling

```typescript
// In TypeORM config
pool: {
  min: 2,
  max: 10,
},
```

### Message Pagination (Future Enhancement)

For very long chat histories, add pagination:

```typescript
// GET /trips/{id}/messages?page=1&limit=50
async getMessages(
  maChuyenDi: string,
  page: number = 1,
  limit: number = 50
) {
  const skip = (page - 1) * limit;
  const messages = await this.TinNhanRepo.find({
    where: { maChuyenDi },
    order: { thoiGianGui: 'DESC' },
    skip,
    take: limit
  });
  return messages;
}
```

## Monitoring & Logging

### Structured Logging

```bash
# Install logger
npm install winston

# In application
import { Logger } from '@nestjs/common';

const logger = new Logger('TripsGateway');
logger.log('Message saved', { maChuyenDi, nguoiGuiId });
logger.error('Failed to save message', error);
```

### Metrics Collection

```bash
# Install metrics
npm install prom-client

# Metrics to track:
# - WebSocket connections count
# - Messages per minute
# - Database query times
# - Error rates
```

### APM Integration (Optional)

```bash
# New Relic
npm install newrelic

# Or Datadog
npm install dd-trace
```

## Backup & Recovery

### Database Backup

```bash
# Daily backup
0 2 * * * pg_dump -U postgres your_db > /backup/db_$(date +\%Y\%m\%d).sql

# Compress backups
0 3 * * * gzip /backup/db_*.sql

# Upload to S3
0 4 * * * aws s3 sync /backup s3://your-backup-bucket/
```

### Disaster Recovery Test

```bash
# Monthly test restore
1. Create test database
2. Restore latest backup
3. Verify all tables
4. Check constraints
5. Test sample queries
```

## Rollback Plan

If issues occur:

```bash
# 1. Identify the issue
npm run start:dev
# Look for errors in logs

# 2. Rollback database (if schema changed)
psql -U postgres -d your_db -f backup_20260525_120000.sql

# 3. Rollback code
git revert HEAD~1

# 4. Rebuild and restart
npm run build
npm run start:prod
```

## Post-Deployment Verification

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Database connectivity
curl http://localhost:3000/trips/CD-TEST/messages \
  -H "Authorization: Bearer TEST_TOKEN"

# 3. WebSocket connectivity
# Run test-chat-api.ps1

# 4. Check logs
tail -f logs/app.log

# 5. Monitor connections
curl http://localhost:3000/metrics
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| WebSocket connection timeout | Check firewall, increase timeout |
| Messages not persisting | Verify database migration, check logs |
| High memory usage | Check WebSocket connection count, add Redis |
| Slow message retrieval | Add pagination, check database indexes |
| Authentication failures | Verify JWT configuration, token expiration |

## Support & Escalation

1. **Development Issues:** Check logs, review CHAT_IMPLEMENTATION_GUIDE.md
2. **Database Issues:** Check PostgreSQL logs, verify migrations
3. **WebSocket Issues:** Check WebSocket port, verify CORS configuration
4. **Performance Issues:** Monitor CPU/memory, add Redis, enable connection pooling

## Related Documentation

- [CHAT_IMPLEMENTATION_GUIDE.md](./CHAT_IMPLEMENTATION_GUIDE.md) - Implementation details
- [CHAT_QUICK_REFERENCE.md](./CHAT_QUICK_REFERENCE.md) - Command reference
- [CHAT_IMPLEMENTATION_SUMMARY.md](./CHAT_IMPLEMENTATION_SUMMARY.md) - Feature summary
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API specs

---

**Last Updated:** 2026-05-25  
**Status:** Ready for Deployment
