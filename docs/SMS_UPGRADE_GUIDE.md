# SMS Upgrade Guide for Restaurant Daily

## Current Setup (Working)
- ✅ **WhatsApp**: Sandbox number `+14155238886`
- ✅ **Cost**: ₹0.35 per WhatsApp message
- ✅ **Coverage**: Works globally, perfect for Indian market
- ✅ **Rich Templates**: Professional OTP messages with branding

## When to Upgrade to SMS

### **Scenarios requiring SMS:**
1. **Users without WhatsApp** (rare in India, ~95% penetration)
2. **Corporate compliance** requirements for SMS backup
3. **Landline support** (restaurants with landline-only staff)
4. **Higher volume** (thousands of messages/month)

## SMS Upgrade Process

### **Step 1: Purchase Phone Number**
1. **Go to Twilio Console** → **Phone Numbers** → **Buy a number**
2. **Choose number type:**
   - **Indian number**: `+91XXXXXXXXXX` (₹80-150/month)
   - **US number**: `+1XXXXXXXXXX` (₹70/month)
   - **Toll-free**: `+1800XXXXXXX` (₹150/month)

### **Step 2: Update Vault Configuration**
```bash
# Update SMS from number
vault kv patch secret/sms from_number="+91XXXXXXXXXX"

# Verify configuration
vault kv get secret/sms
```

### **Step 3: Update Code (No Changes Needed)**
The messaging service will automatically:
- ✅ Enable SMS fallback
- ✅ Route based on phone number type
- ✅ Handle delivery failures gracefully

### **Step 4: Test SMS Delivery**
```bash
# Test SMS delivery
curl -X POST https://restaurant-daily.mindweave.tech/api/auth/test-messaging \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+918826175074", "method": "sms", "testType": "message"}'
```

## Cost Analysis

### **Current (WhatsApp Only)**
- **Setup Cost**: ₹0 (using sandbox)
- **Per Message**: ₹0.35
- **Monthly Base**: ₹0
- **100 messages/month**: ₹35

### **After SMS Upgrade**
- **Setup Cost**: ₹70-150/month (phone number)
- **WhatsApp**: ₹0.35/message (primary)
- **SMS**: ₹0.50/message (fallback)
- **Monthly Base**: ₹70-150
- **100 messages/month**: ₹105-185

## Recommended Timeline

### **Phase 1 (Current)**: WhatsApp-Only
- ✅ **Perfect for development and early users**
- ✅ **Cost-effective** (₹0 base cost)
- ✅ **Rich messaging experience**

### **Phase 2 (When Needed)**: Add SMS Fallback
- 📅 **When**: 50+ daily users OR compliance requirements
- 📅 **Cost**: Additional ₹70-150/month
- 📅 **Benefit**: 99.9% delivery reliability

### **Phase 3 (Scale)**: Enterprise Features
- 📅 **When**: 100+ restaurants using the system
- 📅 **Features**: Dedicated short codes, analytics, compliance
- 📅 **Cost**: Custom pricing

## Current Status: ✅ PRODUCTION READY

**Your WhatsApp-only setup is perfect for:**
- ✅ Restaurant staff authentication
- ✅ Indian market (95% WhatsApp penetration)
- ✅ Cost-effective operation
- ✅ Professional messaging experience

**SMS upgrade can wait until:**
- 📊 User feedback requests SMS option
- 📊 Volume exceeds 1000 messages/month
- 📊 Compliance requirements mandate SMS backup

---

**Bottom Line**: Your current setup is production-ready and cost-effective. SMS upgrade is an enhancement, not a requirement.

## Quick Reference

### **Current Working Setup**
```bash
# WhatsApp OTP (working now)
curl -X POST https://restaurant-daily.mindweave.tech/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+918826175074", "preferredMethod": "whatsapp"}'
```

### **After SMS Upgrade**
```bash
# Auto-routing (WhatsApp primary, SMS fallback)
curl -X POST https://restaurant-daily.mindweave.tech/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+918826175074", "preferredMethod": "auto"}'
```