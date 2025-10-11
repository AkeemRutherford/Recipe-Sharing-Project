/*
  # Add Demo Recipe Data

  1. Overview
    Creates 20+ demo recipes with diverse cuisines, difficulties, and styles
    to populate the Explore Recipes page
    
  2. Details
    - Italian, Mexican, Asian, American, Mediterranean cuisines
    - Various difficulty levels (Easy, Medium, Hard)
    - Complete with ingredients, instructions, tags
    - Uses test user as author
    
  3. Security
    - All recipes follow existing RLS policies
    - Uses existing test user profile
*/

DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Get the test user ID
  SELECT id INTO test_user_id FROM profiles WHERE email = 'test@kollabkitchen.com';
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found. Please create test account first.';
  END IF;

  -- Insert demo recipes
  INSERT INTO recipes (user_id, title, description, image_url, prep_time, cook_time, servings, difficulty, tags, ingredients, instructions, created_at) VALUES
  
  -- Italian Recipes
  (test_user_id, 'Classic Margherita Pizza', 'Traditional Neapolitan pizza with fresh mozzarella, tomatoes, and basil', 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg', '20 min', '15 min', 4, 'Medium', ARRAY['Italian', 'Pizza', 'Vegetarian'], 
   '[{"amount":"500","unit":"g","ingredient":"pizza dough"},{"amount":"200","unit":"g","ingredient":"fresh mozzarella"},{"amount":"3","unit":"","ingredient":"ripe tomatoes"},{"amount":"2","unit":"tbsp","ingredient":"olive oil"},{"amount":"10","unit":"leaves","ingredient":"fresh basil"}]'::jsonb,
   ARRAY['Preheat oven to 475°F (245°C)', 'Roll out pizza dough to desired thickness', 'Spread crushed tomatoes evenly', 'Add torn mozzarella pieces', 'Drizzle with olive oil', 'Bake for 12-15 minutes until crust is golden', 'Top with fresh basil leaves'], now() - interval '25 days'),
  
  (test_user_id, 'Creamy Fettuccine Alfredo', 'Rich and indulgent pasta with Parmesan cream sauce', 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', '10 min', '15 min', 4, 'Easy', ARRAY['Italian', 'Pasta', 'Quick Meals'],
   '[{"amount":"400","unit":"g","ingredient":"fettuccine pasta"},{"amount":"1","unit":"cup","ingredient":"heavy cream"},{"amount":"1","unit":"cup","ingredient":"grated Parmesan"},{"amount":"4","unit":"tbsp","ingredient":"butter"},{"amount":"2","unit":"cloves","ingredient":"minced garlic"}]'::jsonb,
   ARRAY['Cook pasta according to package directions', 'Melt butter in large pan, add garlic', 'Pour in cream and simmer for 2 minutes', 'Add Parmesan cheese and stir until melted', 'Toss with cooked pasta', 'Season with salt and pepper'], now() - interval '23 days'),
  
  -- Mexican Recipes
  (test_user_id, 'Authentic Chicken Tacos', 'Street-style tacos with cilantro-lime chicken', 'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg', '15 min', '20 min', 6, 'Easy', ARRAY['Mexican', 'Tacos', 'Chicken'],
   '[{"amount":"500","unit":"g","ingredient":"chicken breast"},{"amount":"8","unit":"","ingredient":"corn tortillas"},{"amount":"1","unit":"bunch","ingredient":"fresh cilantro"},{"amount":"2","unit":"","ingredient":"limes"},{"amount":"1","unit":"","ingredient":"white onion"},{"amount":"2","unit":"tsp","ingredient":"cumin"}]'::jsonb,
   ARRAY['Season chicken with cumin, salt, and pepper', 'Grill chicken for 20 minutes until cooked through', 'Dice chicken into small pieces', 'Warm tortillas on griddle', 'Assemble tacos with chicken, diced onion, and cilantro', 'Squeeze lime juice over top'], now() - interval '21 days'),
  
  (test_user_id, 'Spicy Beef Enchiladas', 'Rolled tortillas with seasoned beef and melted cheese', 'https://images.pexels.com/photos/5947015/pexels-photo-5947015.jpeg', '25 min', '30 min', 6, 'Medium', ARRAY['Mexican', 'Beef', 'Spicy'],
   '[{"amount":"500","unit":"g","ingredient":"ground beef"},{"amount":"12","unit":"","ingredient":"flour tortillas"},{"amount":"2","unit":"cups","ingredient":"enchilada sauce"},{"amount":"2","unit":"cups","ingredient":"shredded cheese"},{"amount":"1","unit":"","ingredient":"bell pepper"},{"amount":"1","unit":"tsp","ingredient":"chili powder"}]'::jsonb,
   ARRAY['Brown beef with chili powder and diced peppers', 'Warm tortillas slightly to make them pliable', 'Fill each tortilla with beef mixture and roll tightly', 'Place in baking dish and cover with enchilada sauce', 'Top with shredded cheese', 'Bake at 350°F for 25-30 minutes'], now() - interval '19 days'),
  
  -- Asian Recipes
  (test_user_id, 'Pad Thai', 'Classic Thai stir-fried noodles with peanuts and lime', 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg', '20 min', '10 min', 4, 'Medium', ARRAY['Thai', 'Noodles', 'Quick Meals'],
   '[{"amount":"200","unit":"g","ingredient":"rice noodles"},{"amount":"2","unit":"","ingredient":"eggs"},{"amount":"200","unit":"g","ingredient":"shrimp"},{"amount":"3","unit":"tbsp","ingredient":"fish sauce"},{"amount":"2","unit":"tbsp","ingredient":"tamarind paste"},{"amount":"1/4","unit":"cup","ingredient":"crushed peanuts"}]'::jsonb,
   ARRAY['Soak rice noodles in warm water for 30 minutes', 'Heat wok over high heat with oil', 'Scramble eggs and set aside', 'Stir-fry shrimp until pink', 'Add drained noodles, fish sauce, and tamarind', 'Toss everything together and top with peanuts and lime'], now() - interval '17 days'),
  
  (test_user_id, 'Chicken Teriyaki Bowl', 'Glazed chicken with vegetables over steamed rice', 'https://images.pexels.com/photos/1484516/pexels-photo-1484516.jpeg', '15 min', '20 min', 4, 'Easy', ARRAY['Japanese', 'Rice Bowl', 'Chicken'],
   '[{"amount":"500","unit":"g","ingredient":"chicken thighs"},{"amount":"1/4","unit":"cup","ingredient":"soy sauce"},{"amount":"2","unit":"tbsp","ingredient":"honey"},{"amount":"1","unit":"tbsp","ingredient":"rice vinegar"},{"amount":"2","unit":"cups","ingredient":"white rice"},{"amount":"1","unit":"","ingredient":"broccoli head"}]'::jsonb,
   ARRAY['Cook rice according to package directions', 'Mix soy sauce, honey, and vinegar for teriyaki sauce', 'Cut chicken into bite-sized pieces', 'Pan-fry chicken until golden', 'Add teriyaki sauce and simmer until glazed', 'Steam broccoli and serve over rice with chicken'], now() - interval '15 days'),
  
  -- American Recipes
  (test_user_id, 'Classic Cheeseburger', 'Juicy beef patty with American cheese and special sauce', 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg', '15 min', '10 min', 4, 'Easy', ARRAY['American', 'Burger', 'Beef'],
   '[{"amount":"600","unit":"g","ingredient":"ground beef"},{"amount":"4","unit":"","ingredient":"burger buns"},{"amount":"4","unit":"slices","ingredient":"American cheese"},{"amount":"1","unit":"","ingredient":"tomato"},{"amount":"1","unit":"head","ingredient":"iceberg lettuce"},{"amount":"1","unit":"","ingredient":"onion"}]'::jsonb,
   ARRAY['Form beef into 4 equal patties', 'Season generously with salt and pepper', 'Grill or pan-fry for 4 minutes per side', 'Add cheese in last minute to melt', 'Toast burger buns lightly', 'Assemble with lettuce, tomato, onion, and your favorite sauce'], now() - interval '13 days'),
  
  (test_user_id, 'BBQ Pulled Pork Sandwich', 'Slow-cooked pork shoulder with tangy BBQ sauce', 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', '30 min', '6 hours', 8, 'Hard', ARRAY['American', 'BBQ', 'Slow Cooker'],
   '[{"amount":"2","unit":"kg","ingredient":"pork shoulder"},{"amount":"1","unit":"cup","ingredient":"BBQ sauce"},{"amount":"1","unit":"tbsp","ingredient":"paprika"},{"amount":"1","unit":"tbsp","ingredient":"brown sugar"},{"amount":"8","unit":"","ingredient":"brioche buns"},{"amount":"2","unit":"cups","ingredient":"coleslaw"}]'::jsonb,
   ARRAY['Rub pork with paprika, brown sugar, salt and pepper', 'Place in slow cooker with 1 cup water', 'Cook on low for 6-8 hours until tender', 'Shred pork with two forks', 'Mix with BBQ sauce', 'Serve on toasted buns with coleslaw'], now() - interval '11 days'),
  
  -- Mediterranean Recipes
  (test_user_id, 'Greek Moussaka', 'Layered eggplant and meat casserole with béchamel', 'https://images.pexels.com/photos/5949885/pexels-photo-5949885.jpeg', '40 min', '1 hour', 6, 'Hard', ARRAY['Greek', 'Casserole', 'Lamb'],
   '[{"amount":"3","unit":"","ingredient":"large eggplants"},{"amount":"500","unit":"g","ingredient":"ground lamb"},{"amount":"2","unit":"cups","ingredient":"béchamel sauce"},{"amount":"1","unit":"can","ingredient":"crushed tomatoes"},{"amount":"1","unit":"","ingredient":"onion"},{"amount":"2","unit":"tsp","ingredient":"cinnamon"}]'::jsonb,
   ARRAY['Slice eggplants and brush with olive oil', 'Roast eggplant slices at 400°F for 20 minutes', 'Brown lamb with diced onion and cinnamon', 'Add crushed tomatoes and simmer 15 minutes', 'Layer eggplant and meat sauce in baking dish', 'Top with béchamel and bake 45 minutes at 350°F'], now() - interval '9 days'),
  
  (test_user_id, 'Falafel Wrap', 'Crispy chickpea fritters with tahini sauce', 'https://images.pexels.com/photos/6275170/pexels-photo-6275170.jpeg', '20 min', '15 min', 4, 'Medium', ARRAY['Mediterranean', 'Vegetarian', 'Healthy'],
   '[{"amount":"2","unit":"cans","ingredient":"chickpeas"},{"amount":"4","unit":"","ingredient":"pita breads"},{"amount":"1","unit":"bunch","ingredient":"fresh parsley"},{"amount":"3","unit":"cloves","ingredient":"garlic"},{"amount":"2","unit":"tsp","ingredient":"cumin"},{"amount":"1/2","unit":"cup","ingredient":"tahini sauce"}]'::jsonb,
   ARRAY['Drain chickpeas and pat dry', 'Blend chickpeas, parsley, garlic, and cumin', 'Form into small balls', 'Deep fry until golden brown and crispy', 'Warm pita breads', 'Fill with falafel, lettuce, tomatoes, and drizzle tahini sauce'], now() - interval '7 days'),
  
  -- Breakfast & Brunch
  (test_user_id, 'Fluffy Buttermilk Pancakes', 'Light and airy pancakes perfect for weekend breakfast', 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg', '10 min', '15 min', 4, 'Easy', ARRAY['Breakfast', 'Pancakes', 'Quick Meals'],
   '[{"amount":"2","unit":"cups","ingredient":"all-purpose flour"},{"amount":"2","unit":"cups","ingredient":"buttermilk"},{"amount":"2","unit":"","ingredient":"eggs"},{"amount":"2","unit":"tbsp","ingredient":"sugar"},{"amount":"2","unit":"tsp","ingredient":"baking powder"},{"amount":"1","unit":"tsp","ingredient":"vanilla extract"}]'::jsonb,
   ARRAY['Whisk together flour, sugar, baking powder, and salt', 'In separate bowl, mix buttermilk, eggs, and vanilla', 'Combine wet and dry ingredients until just mixed', 'Heat griddle over medium heat', 'Pour 1/4 cup batter per pancake', 'Flip when bubbles form, cook until golden'], now() - interval '6 days'),
  
  (test_user_id, 'Eggs Benedict', 'Poached eggs with hollandaise on English muffins', 'https://images.pexels.com/photos/101533/pexels-photo-101533.jpeg', '20 min', '15 min', 4, 'Hard', ARRAY['Breakfast', 'Brunch', 'Eggs'],
   '[{"amount":"4","unit":"","ingredient":"eggs"},{"amount":"4","unit":"","ingredient":"English muffins"},{"amount":"8","unit":"slices","ingredient":"Canadian bacon"},{"amount":"3","unit":"","ingredient":"egg yolks"},{"amount":"1/2","unit":"cup","ingredient":"butter"},{"amount":"1","unit":"tbsp","ingredient":"lemon juice"}]'::jsonb,
   ARRAY['Make hollandaise: whisk egg yolks with lemon juice over double boiler', 'Slowly add melted butter while whisking constantly', 'Poach eggs in simmering water with vinegar', 'Toast English muffins', 'Cook Canadian bacon until crispy', 'Assemble: muffin, bacon, poached egg, hollandaise sauce'], now() - interval '5 days'),
  
  -- Desserts
  (test_user_id, 'Chocolate Lava Cake', 'Decadent chocolate cake with molten center', 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg', '15 min', '12 min', 4, 'Medium', ARRAY['Dessert', 'Chocolate', 'French'],
   '[{"amount":"200","unit":"g","ingredient":"dark chocolate"},{"amount":"100","unit":"g","ingredient":"butter"},{"amount":"2","unit":"","ingredient":"eggs"},{"amount":"2","unit":"","ingredient":"egg yolks"},{"amount":"1/4","unit":"cup","ingredient":"sugar"},{"amount":"2","unit":"tbsp","ingredient":"flour"}]'::jsonb,
   ARRAY['Preheat oven to 450°F', 'Melt chocolate and butter together', 'Whisk eggs, yolks, and sugar until thick', 'Fold in chocolate mixture and flour', 'Pour into greased ramekins', 'Bake for 12 minutes until edges are firm but center jiggles', 'Invert onto plates and serve immediately'], now() - interval '4 days'),
  
  (test_user_id, 'New York Cheesecake', 'Classic creamy cheesecake with graham cracker crust', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', '30 min', '1 hour', 12, 'Hard', ARRAY['Dessert', 'Cheesecake', 'Baking'],
   '[{"amount":"900","unit":"g","ingredient":"cream cheese"},{"amount":"1","unit":"cup","ingredient":"sugar"},{"amount":"4","unit":"","ingredient":"eggs"},{"amount":"1","unit":"cup","ingredient":"sour cream"},{"amount":"2","unit":"cups","ingredient":"graham cracker crumbs"},{"amount":"1/2","unit":"cup","ingredient":"melted butter"}]'::jsonb,
   ARRAY['Mix graham cracker crumbs with melted butter', 'Press into bottom of springform pan', 'Beat cream cheese until smooth', 'Add sugar, then eggs one at a time', 'Fold in sour cream and vanilla', 'Pour over crust and bake at 325°F for 1 hour', 'Cool completely before refrigerating overnight'], now() - interval '3 days'),
  
  -- Healthy & Vegetarian
  (test_user_id, 'Buddha Bowl', 'Colorful bowl with quinoa, roasted vegetables, and tahini', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', '20 min', '30 min', 4, 'Easy', ARRAY['Healthy', 'Vegetarian', 'Vegan', 'Bowl'],
   '[{"amount":"1","unit":"cup","ingredient":"quinoa"},{"amount":"1","unit":"","ingredient":"sweet potato"},{"amount":"1","unit":"bunch","ingredient":"kale"},{"amount":"1","unit":"can","ingredient":"chickpeas"},{"amount":"1/4","unit":"cup","ingredient":"tahini"},{"amount":"1","unit":"","ingredient":"avocado"}]'::jsonb,
   ARRAY['Cook quinoa according to package directions', 'Cube sweet potato and roast at 400°F for 25 minutes', 'Massage kale with olive oil and salt', 'Roast chickpeas with paprika until crispy', 'Make tahini dressing with lemon and garlic', 'Arrange all components in bowl and drizzle with dressing'], now() - interval '2 days'),
  
  (test_user_id, 'Caprese Salad', 'Fresh mozzarella, tomatoes, and basil with balsamic', 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg', '10 min', '0 min', 4, 'Easy', ARRAY['Italian', 'Salad', 'Vegetarian', 'No Cook'],
   '[{"amount":"4","unit":"","ingredient":"ripe tomatoes"},{"amount":"400","unit":"g","ingredient":"fresh mozzarella"},{"amount":"1","unit":"bunch","ingredient":"fresh basil"},{"amount":"3","unit":"tbsp","ingredient":"extra virgin olive oil"},{"amount":"2","unit":"tbsp","ingredient":"balsamic vinegar"}]'::jsonb,
   ARRAY['Slice tomatoes and mozzarella into rounds', 'Arrange alternating on serving platter', 'Tuck fresh basil leaves between slices', 'Drizzle with olive oil and balsamic vinegar', 'Season with sea salt and cracked pepper', 'Let sit 10 minutes before serving'], now() - interval '1 day'),
  
  -- Soup & Comfort Food
  (test_user_id, 'Creamy Tomato Soup', 'Velvety smooth tomato soup with fresh basil', 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg', '15 min', '30 min', 6, 'Easy', ARRAY['Soup', 'Comfort Food', 'Vegetarian'],
   '[{"amount":"2","unit":"cans","ingredient":"whole tomatoes"},{"amount":"1","unit":"cup","ingredient":"heavy cream"},{"amount":"1","unit":"","ingredient":"onion"},{"amount":"4","unit":"cloves","ingredient":"garlic"},{"amount":"2","unit":"cups","ingredient":"vegetable broth"},{"amount":"1/4","unit":"cup","ingredient":"fresh basil"}]'::jsonb,
   ARRAY['Sauté diced onion and garlic until soft', 'Add canned tomatoes and broth', 'Simmer for 20 minutes', 'Blend until completely smooth', 'Stir in heavy cream', 'Season with salt, pepper, and torn basil leaves'], now() - interval '12 hours'),
  
  (test_user_id, 'Chicken Noodle Soup', 'Classic homemade chicken soup with vegetables', 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg', '20 min', '40 min', 8, 'Easy', ARRAY['Soup', 'Comfort Food', 'Chicken'],
   '[{"amount":"500","unit":"g","ingredient":"chicken breast"},{"amount":"200","unit":"g","ingredient":"egg noodles"},{"amount":"3","unit":"","ingredient":"carrots"},{"amount":"2","unit":"stalks","ingredient":"celery"},{"amount":"8","unit":"cups","ingredient":"chicken broth"},{"amount":"1","unit":"tsp","ingredient":"thyme"}]'::jsonb,
   ARRAY['Bring chicken broth to boil', 'Add chicken breast and poach for 20 minutes', 'Remove chicken and shred', 'Add diced carrots and celery to broth', 'Simmer until vegetables are tender', 'Add egg noodles and cook 8 minutes', 'Return shredded chicken and season with thyme'], now() - interval '6 hours'),
  
  -- Quick & Easy
  (test_user_id, 'Garlic Butter Shrimp', 'Quick sautéed shrimp with garlic and herbs', 'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg', '10 min', '8 min', 4, 'Easy', ARRAY['Seafood', 'Quick Meals', 'Shrimp'],
   '[{"amount":"500","unit":"g","ingredient":"large shrimp"},{"amount":"6","unit":"cloves","ingredient":"minced garlic"},{"amount":"4","unit":"tbsp","ingredient":"butter"},{"amount":"1/4","unit":"cup","ingredient":"white wine"},{"amount":"2","unit":"tbsp","ingredient":"lemon juice"},{"amount":"2","unit":"tbsp","ingredient":"fresh parsley"}]'::jsonb,
   ARRAY['Pat shrimp dry and season with salt and pepper', 'Melt butter in large skillet over medium-high heat', 'Add garlic and sauté for 1 minute', 'Add shrimp and cook 2 minutes per side', 'Pour in white wine and lemon juice', 'Toss with fresh parsley and serve immediately'], now() - interval '3 hours'),
  
  (test_user_id, 'Avocado Toast', 'Smashed avocado on sourdough with toppings', 'https://images.pexels.com/photos/1927383/pexels-photo-1927383.jpeg', '5 min', '5 min', 2, 'Easy', ARRAY['Breakfast', 'Quick Meals', 'Vegetarian', 'Healthy'],
   '[{"amount":"2","unit":"","ingredient":"ripe avocados"},{"amount":"4","unit":"slices","ingredient":"sourdough bread"},{"amount":"2","unit":"","ingredient":"eggs"},{"amount":"1","unit":"","ingredient":"lemon"},{"amount":"1/4","unit":"tsp","ingredient":"red pepper flakes"}]'::jsonb,
   ARRAY['Toast sourdough bread until golden', 'Mash avocados with lemon juice, salt, and pepper', 'Fry or poach eggs to desired doneness', 'Spread avocado mixture on toast', 'Top with egg and red pepper flakes', 'Optional: add cherry tomatoes or microgreens'], now() - interval '1 hour')
  
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Demo recipes created successfully';
END $$;