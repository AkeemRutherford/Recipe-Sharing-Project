/*
  # Create Test Account for Demo

  ## Overview
  Creates a test account that can be used to demo the application without requiring OAuth setup.

  ## Account Details
  - Email: test@kollabkitchen.com
  - Password: TestAccount123!
  - Full Name: Test User

  ## Security Note
  This is a demo/development account only. In production, this migration should be removed.
*/

-- Insert test user into auth.users
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@kollabkitchen.com';

  -- Only create if doesn't exist
  IF test_user_id IS NULL THEN
    -- Generate user ID
    test_user_id := gen_random_uuid();
    
    -- Create user with password
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      test_user_id,
      'authenticated',
      'authenticated',
      'test@kollabkitchen.com',
      crypt('TestAccount123!', gen_salt('bf')),
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

    -- Create identity for the user
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      test_user_id::text,
      test_user_id,
      format('{"sub":"%s","email":"test@kollabkitchen.com"}', test_user_id)::jsonb,
      'email',
      now(),
      now(),
      now()
    );

    -- The profile will be created automatically by the handle_new_user trigger
  END IF;
END $$;