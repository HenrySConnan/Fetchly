# 🚀 Simple Admin Setup - FIXED VERSION

## 📋 **Step-by-Step Setup**

### **Step 1: Run Fixed Admin Setup**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `simple-admin-setup-fixed.sql`
4. Click **Run** to execute the script

### **Step 2: Test Admin Login**
1. Go to your app at `http://localhost:5173` (or `http://localhost:5174`)
2. Sign in with `henry@donco.coza`
3. Navigate to `/admin` in your browser
4. You should see the admin dashboard!

## ✅ **What This Fixed Version Does**

- **Cleans up existing functions** to avoid conflicts
- **Uses unique function name** `check_admin_access()` instead of `is_admin()`
- **Creates admin table** with proper RLS policies
- **Creates your admin account** for `henry@donco.coza`
- **Updates the React hook** to use the new function name

## 🧪 **Testing Your Setup**

After running the script, test with these queries in Supabase:

```sql
-- Test if you're an admin (after signing in)
SELECT check_admin_access() as is_admin;

-- Check your admin account
SELECT * FROM admin_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'henry@donco.coza');
```

## 🎯 **Expected Results**

After running the script, you should see:
- ✅ **1 table created**: `admin_users`
- ✅ **1 function created**: `check_admin_access()`
- ✅ **Admin account created** for `henry@donco.coza`
- ✅ **Admin dashboard working** at `/admin`

## 🚨 **If You Still Get Errors**

1. **Make sure you're logged in** to Supabase with your account
2. **Check the email** - make sure it's exactly `henry@donco.coza`
3. **Run the fixed script** in the SQL Editor
4. **Sign in to your app** with the same email

## 📞 **This Will Work Now**

This fixed version:
- ✅ **Cleans up conflicts** with existing functions
- ✅ **Uses unique function names**
- ✅ **Creates admin access properly**
- ✅ **Simple dashboard that works**

**Try this fixed version and let me know if you can access the admin dashboard!** 🚀
