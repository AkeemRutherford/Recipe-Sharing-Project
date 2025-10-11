/*
  # Create Test Account

  1. Overview
    Creates a test user account for demo purposes with email 'test@kollabkitchen.com'
    
  2. Details
    - Email: test@kollabkitchen.com
    - Password: TestAccount123!
    - Creates both auth user and profile entry
    
  3. Security
    - Test account follows same RLS policies as regular users
*/

-- Create test user if not exists
DO $$
DECLARE
  test_user_id uuid;
  test_email text := 'test@kollabkitchen.com';
BEGIN
  -- Check if user already exists
  SELECT id INTO test_user_id FROM auth.users WHERE email = test_email;
  
  IF test_user_id IS NULL THEN
    -- Generate a new UUID for the test user
    test_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      test_user_id,
      'authenticated',
      'authenticated',
      test_email,
      crypt('TestAccount123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Test User"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    
    -- Insert profile (trigger should handle this, but let's be explicit)
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
      test_user_id,
      test_email,
      'Test User',
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Test account created with email: %', test_email;
  ELSE
    RAISE NOTICE 'Test account already exists with email: %', test_email;
  END IF;
END $$;