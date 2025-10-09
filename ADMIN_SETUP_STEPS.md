# 🚀 Admin Setup - Step by Step

## ✅ **STEP 1: Run the SQL Script**

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Copy the contents of `admin-setup-working.sql`
4. Paste it into the SQL Editor
5. Click **Run** button

## ✅ **STEP 2: Test Your App**

1. Go to your app at `http://localhost:5173` (or `http://localhost:5174`)
2. Sign in with `henry@donco.coza`
3. Navigate to `/admin` in your browser
4. You should see the admin dashboard!

## 🧪 **STEP 3: Verify in Supabase**

After running the script, test with this query in Supabase SQL Editor:

```sql
-- Test if you're an admin (after signing in)
SELECT check_admin_access() as is_admin;

-- Check your admin account
SELECT * FROM admin_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'henry@donco.coza');
```

## 🎯 **What You Should See**

- ✅ **Admin dashboard** at `/admin`
- ✅ **"Admin Access Confirmed!"** message
- ✅ **Stats cards** showing mock data
- ✅ **No errors** in the console

## 🚨 **If It Still Doesn't Work**

1. **Make sure you're signed in** with `henry@donco.coza`
2. **Check the browser console** for any errors
3. **Try refreshing** the page
4. **Make sure the SQL script ran** without errors

## 📞 **This WILL Work**

This script is clean and simple:
- ✅ **No markdown** - pure SQL only
- ✅ **Cleans up conflicts** first
- ✅ **Creates everything** step by step
- ✅ **Creates your admin account** properly

**Try this now and let me know if you can access the admin dashboard!** 🚀
