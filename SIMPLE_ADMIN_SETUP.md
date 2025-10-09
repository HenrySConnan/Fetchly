# 🚀 Simple Admin Setup (Step by Step)

## 📋 **Step-by-Step Setup**

### **Step 1: Run Simple Admin Setup**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `simple-admin-setup.sql`
4. Click **Run** to execute the script

### **Step 2: Test Admin Login**
1. Go to your app at `http://localhost:5173`
2. Sign in with `henry@donco.coza`
3. Navigate to `/admin` in your browser
4. You should see the admin dashboard!

## ✅ **What You'll Get**

- **Simple admin table** with just the essentials
- **Admin access check** using Supabase functions
- **Basic admin dashboard** that confirms you're logged in as admin
- **No complex features** - just the core admin functionality

## 🧪 **Testing Your Setup**

After running the script, test with these queries in Supabase:

```sql
-- Test if you're an admin (after signing in)
SELECT is_admin() as is_admin;

-- Check your admin account
SELECT * FROM admin_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'henry@donco.coza');
```

## 🎯 **Expected Results**

After running the script, you should see:
- ✅ **1 table created**: `admin_users`
- ✅ **1 function created**: `is_admin`
- ✅ **Admin account created** for `henry@donco.coza`
- ✅ **Admin dashboard working** at `/admin`

## 🚨 **If You Get Errors**

1. **Make sure you're logged in** to Supabase with your account
2. **Check the email** - make sure it's exactly `henry@donco.coza`
3. **Run the script** in the SQL Editor
4. **Sign in to your app** with the same email

## 📞 **This Will Work**

This simple version focuses on just getting admin access working:
- ✅ **Minimal database setup**
- ✅ **Basic admin check**
- ✅ **Simple dashboard**
- ✅ **No complex features**

**Once this works, we can add all the advanced features!** 🚀
