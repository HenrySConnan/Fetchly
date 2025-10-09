# 🚀 PetConnect Admin Setup Guide (FIXED VERSION)

## 📋 **Quick Setup Steps**

### **Step 1: Run Complete Admin Setup (FIXED)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `complete-admin-setup-fixed.sql`
4. Click **Run** to execute the script

### **Step 2: Create Your Admin Account (FIXED)**
1. In the same SQL Editor
2. Copy and paste the contents of `create-your-admin-account-fixed.sql`
3. Click **Run** to execute the script
4. This will make `henry@donco.co.za` a super admin

### **Step 3: Run Admin Dashboard Integration**
1. Copy and paste the contents of `admin-dashboard-integration.sql`
2. Click **Run** to execute the script
3. This ensures all required tables exist

## ✅ **What You'll Get**

- **Admin Dashboard** at `/admin` route
- **Business approval** system
- **Analytics** with real data
- **Promotion management**
- **Role-based access control**

## 🔧 **What Was Fixed**

- **Fixed ON CONFLICT issue**: Removed the problematic `ON CONFLICT` clause
- **Added proper unique constraint**: Ensures `user_id` is unique
- **Simplified admin creation**: Uses DELETE + INSERT instead of ON CONFLICT
- **Added COALESCE**: Prevents NULL errors in analytics functions

## 🧪 **Testing Your Setup**

After running the scripts, test with these queries in Supabase:

```sql
-- Test if you're an admin
SELECT is_admin() as is_admin;

-- Check your admin account
SELECT * FROM admin_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'henry@donco.co.za');

-- Test analytics
SELECT get_daily_stats() as daily_stats;
```

## 🚨 **If You Still Get Errors**

1. **Make sure you're logged in** to Supabase with your account
2. **Check if tables exist**: Run `SELECT * FROM information_schema.tables WHERE table_name = 'admin_users';`
3. **Check constraints**: Run `SELECT * FROM information_schema.table_constraints WHERE table_name = 'admin_users';`

## 📞 **Need Help?**

If you encounter any issues, the error messages will now be more specific and easier to debug!
