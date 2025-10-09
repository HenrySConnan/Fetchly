# 🚀 PetConnect Admin Setup Guide

## 📋 **Quick Setup Steps**

### **Step 1: Run Complete Admin Setup**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `complete-admin-setup.sql`
4. Click **Run** to execute the script

### **Step 2: Create Your Admin Account**
1. In the same SQL Editor
2. Copy and paste the contents of `create-your-admin-account.sql`
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

## 🔧 **Troubleshooting**

### **If you get "snippet not found" error:**
- Make sure you're copying the **entire script** content
- Don't use Supabase snippets, use the SQL Editor directly

### **If you get permission errors:**
- Make sure you're logged in as the project owner
- Check that RLS policies are properly set up

### **If the admin dashboard doesn't work:**
- Verify your user ID was inserted correctly
- Check that the `is_admin()` function returns `true`

## 📊 **Testing Your Setup**

After running all scripts, test with these queries in SQL Editor:

```sql
-- Test if you're an admin
SELECT is_admin() as is_admin;

-- Test if you're a super admin
SELECT is_super_admin() as is_super_admin;

-- Check your admin account
SELECT 
  au.id,
  au.user_id,
  au.role,
  u.email,
  au.created_at
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE u.email = 'henry@donco.co.za';
```

## 🎯 **Next Steps**

1. **Navigate to `/admin`** in your app
2. **Test the admin dashboard** functionality
3. **Create some test businesses** to approve
4. **Set up promotions** for businesses

## 📞 **Need Help?**

If you encounter any issues:
1. Check the Supabase logs for errors
2. Verify all tables were created successfully
3. Make sure your user account exists in `auth.users`
4. Test the admin functions manually

---

**Your admin account email: `henry@donco.co.za`** ✅