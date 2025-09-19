# Restaurant Daily - Secure Deployment Guide

## ✅ Current Working Status (2025-09-14)

All systems are operational and authentication is working with real WhatsApp messages.

## 🔐 Secrets Management

### HashiCorp Vault Setup

**IMPORTANT**: Never commit actual tokens or API keys to git. All secrets are managed through Vault.

#### 1. Start Vault Development Server
```bash
vault server -dev
```

**Note**: Copy the Root Token from the output - you'll need it for all subsequent commands.

#### 2. Configure Environment
```bash
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[TOKEN_FROM_VAULT_OUTPUT]'
```

#### 3. Store Secrets Securely

**Twilio Configuration**:
```bash
vault kv put secret/sms \
  provider="twilio" \
  account_sid="[YOUR_TWILIO_ACCOUNT_SID]" \
  twilio_auth_token="[YOUR_TWILIO_AUTH_TOKEN]" \
  from_number="+14155238886" \
  whatsapp_number="whatsapp:+14155238886" \
  content_sid="HXb5b62575e6e4ff6129ad7c8efe1f983e" \
  webhook_url="https://restaurant-daily.mindweave.tech/api/sms/webhook"
```

**OTP Configuration**:
```bash
vault kv put secret/otp \
  length="6" \
  expiry_minutes="5" \
  max_attempts="3" \
  rate_limit_per_hour="3" \
  cleanup_interval_hours="24"
```

**JWT Configuration**:
```bash
vault kv put secret/jwt \
  access_token_secret="[GENERATE_SECURE_JWT_SECRET]"
```

**Supabase Configuration**:
```bash
vault kv put secret/supabase \
  url="https://hukaqbgfmerutzhtchiu.supabase.co" \
  anon_key="[YOUR_SUPABASE_ANON_KEY]" \
  service_role_key="[YOUR_SUPABASE_SERVICE_ROLE_KEY]" \
  database_url="[YOUR_SUPABASE_DATABASE_URL]"
```

## 🚀 Production Deployment

### PM2 Process Management

#### Start/Restart Production Server
```bash
# Restart with current Vault environment
VAULT_TOKEN='[YOUR_VAULT_TOKEN]' VAULT_ADDR='http://127.0.0.1:8200' pm2 restart restaurant-daily --update-env

# Check status
pm2 status

# View logs
pm2 logs restaurant-daily

# Monitor in real-time
pm2 monit
```

### Server Configuration

- **Domain**: restaurant-daily.mindweave.tech
- **Server**: Azure VM (Ubuntu Linux)
- **Process Manager**: PM2
- **Web Server**: Nginx (HTTPS with Let's Encrypt)
- **Application Port**: 3001 (internal)
- **Public Ports**: 80 (HTTP redirect) → 443 (HTTPS)

## 🧪 Testing

### Demo Users (Always Available)
These users work without Twilio and are perfect for testing:

```
Phone: +919876543210 → OTP: 123456 (Admin Role)
Phone: +919876543211 → OTP: 654321 (Staff Role)
Phone: +14155552222 → OTP: 111111 (US Admin Role)
```

### API Testing
```bash
# Test OTP request (real number)
curl -X POST https://restaurant-daily.mindweave.tech/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+918826175074", "preferredMethod": "whatsapp"}'

# Test with demo user
curl -X POST https://restaurant-daily.mindweave.tech/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210", "preferredMethod": "whatsapp"}'
```

## 🔧 Troubleshooting

### Common Issues

**1. Vault Token Expired**
```bash
# Restart Vault server and get new token
vault server -dev
# Update environment and restart PM2
```

**2. Twilio Authentication Error**
```bash
# Verify credentials in Vault
vault kv get secret/sms
# Ensure account_sid and auth_token match your Twilio console
```

**3. PM2 Process Issues**
```bash
# Check process status
pm2 status

# Restart with fresh environment
pm2 restart restaurant-daily --update-env

# Force restart if needed
pm2 delete restaurant-daily
pm2 start npm --name "restaurant-daily" -- start
```

## 📋 Security Checklist

- [ ] All API keys stored in Vault (never in code)
- [ ] Vault token not committed to git
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Database RLS (Row Level Security) configured
- [ ] Rate limiting enabled for OTP requests
- [ ] Audit logging implemented
- [ ] Error handling doesn't expose sensitive data

## 🎯 Architecture Overview

```
Internet → Nginx (443) → Next.js App (3001) → Vault (secrets) → Twilio/Supabase
                ↓
            PM2 Process Manager
                ↓
        HashiCorp Vault (dev mode)
```

## 📚 Additional Resources

- **Main Config**: `CLAUDE.md` - Complete development setup
- **Project Status**: `README.md` - Current health status
- **Authentication**: `AUTH_ARCHITECTURE.md` - Auth system design
- **Testing**: `TEST_REPORT.md` - Test results and coverage

---

**Last Updated**: 2025-09-14
**Status**: ✅ All systems operational, WhatsApp authentication working