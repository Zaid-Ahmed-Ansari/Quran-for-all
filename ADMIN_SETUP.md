# Admin Authentication Setup Guide

## Overview
The admin panel now requires authentication. All admin routes are protected and will redirect to `/admin/login` if the user is not authenticated.

## Creating Your First Admin User

You have two options to create an admin user:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Enter:
   - **Email**: Your admin email (e.g., `admin@yourdomain.com`)
   - **Password**: A strong password
   - **Auto Confirm User**: ✅ Check this box
5. Click **"Create user"**

### Option 2: Using Supabase SQL Editor

Run this SQL in your Supabase SQL Editor:

```sql
-- Create admin user (replace with your email and password)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@yourdomain.com',  -- Change this to your email
  crypt('your-password-here', gen_salt('bf')),  -- Change this to your password
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  '',
  ''
);
```

**Note**: The SQL method is more complex. Option 1 (Dashboard) is easier.

## Testing the Login

1. Navigate to `/admin/login` in your application
2. Enter the email and password you created
3. You should be redirected to `/admin` dashboard

## Storage Policies

Your existing storage policies require `auth.role() = 'authenticated'`, which means:
- ✅ Users must be logged in to access storage
- ✅ Your policies are now properly enforced
- ✅ Only authenticated admin users can upload/read images

## Database RLS Policies

**IMPORTANT**: You need to set up Row-Level Security (RLS) policies for your database tables.

If you're getting errors like "new row violates row-level security policy", you need to create RLS policies.

Run the SQL in `RLS_POLICIES_ARTICLES.sql` in your Supabase SQL Editor to create policies for:
- `articles` table (SELECT, INSERT, UPDATE, DELETE)
- `article_content_blocks` table
- `article_tags` table
- `article_topics` table
- `article_group_links` table
- `article_secondary_references` table
- `tags` table (for creating new tags)
- `topics` table (for creating new topics)

These policies allow authenticated users to manage articles and related data.

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` should **never** be used client-side
- It's only for server-side operations if needed
- All client-side operations use the anon key with authentication
- Admin routes are protected by the layout component

## Troubleshooting

### "Invalid email or password"
- Make sure the user exists in Supabase Auth
- Check that "Auto Confirm User" was checked when creating the user
- Verify the email and password are correct

### Redirect loop
- Clear your browser cookies/localStorage
- Make sure the session is being created properly
- Check browser console for errors

### Storage access denied
- Verify your storage policies are correct
- Make sure you're logged in as an authenticated user
- Check that the bucket name is exactly "Images" (case-sensitive)

