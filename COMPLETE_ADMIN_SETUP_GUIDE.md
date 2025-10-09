# 🚀 Complete Admin Setup Guide (WORKING VERSION)

## 📋 **Step-by-Step Setup**

### **Step 1: Run Complete Admin Setup**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `complete-admin-setup-fixed-v2.sql`
4. Click **Run** to execute the script

### **Step 2: Create Your Admin Account**
1. In the same SQL Editor
2. Copy and paste the contents of `create-your-admin-account-fixed-v2.sql`
3. Click **Run** to execute the script
4. This will make `henry@donco.co.za` a super admin

### **Step 3: Run Simple Admin Dashboard Integration**
1. Copy and paste the contents of `admin-dashboard-integration-simple.sql`
2. Click **Run** to execute the script
3. This creates the essential tables without complex foreign keys

## ✅ **What You'll Get**

- **Admin Dashboard** at `/admin` route
- **Business approval** system
- **Analytics** with real data
- **Promotion management**
- **Role-based access control**

## 🔧 **What's Different in the Simple Version**

- **No complex foreign keys** - Uses simple text references instead
- **No column reference errors** - All tables are created independently
- **Works with existing schema** - Doesn't conflict with your current database
- **Simple but functional** - Gets the admin dashboard working quickly

## 🧪 **Testing Your Setup**

After running all three scripts, test with these queries in Supabase:

```sql
-- Test if you're an admin
SELECT is_admin() as is_admin;

-- Check your admin account
SELECT * FROM admin_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'henry@donco.co.za');

-- Test analytics
SELECT get_daily_stats() as daily_stats;
SELECT get_weekly_stats() as weekly_stats;
SELECT get_monthly_stats() as monthly_stats;

-- Check tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('admin_users', 'business_profiles', 'bookings', 'services', 'promotions');
```

## 🎯 **Expected Results**

After running all scripts, you should see:
- ✅ **5 tables created**: `admin_users`, `business_profiles`, `bookings`, `services`, `promotions`
- ✅ **7 functions created**: `is_admin`, `is_super_admin`, `get_daily_stats`, `get_weekly_stats`, `get_monthly_stats`, `approve_business`, `reject_business`
- ✅ **Admin account created** for `henry@donco.co.za`
- ✅ **Analytics working** with real data

## 🚨 **If You Still Get Errors**

1. **Make sure you're logged in** to Supabase with your account
2. **Run scripts in order**: 1 → 2 → 3
3. **Check for existing tables**: Run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
4. **Check for existing functions**: Run `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';`

## 📞 **Need Help?**

The simple version should work without any column reference errors. It creates a working admin dashboard that you can build upon later!
