/*
  # Add Nutrition Facts Support and Demo Data

  1. Changes to Existing Tables
    - Add `nutrition_facts` (JSONB) to `recipes` table
    - Add `nutrition_generated_at` (timestamp) to `recipes` table

  2. Demo Data
    - Add comment likes to existing comments (vary 0-15 likes)
    - Add nutrition facts to all 30 demo recipes

  Structure of nutrition_facts JSON:
  {
    "per_serving": {
      "calories": 320,
      "total_fat": 12,
      "saturated_fat": 4,
      "cholesterol": 55,
      "sodium": 480,
      "carbohydrates": 38,
      "fiber": 3,
      "sugar": 8,
      "protein": 15
    },
    "generated_at": "2025-01-15T10:30:00Z",
    "disclaimer": "Estimated values based on ingredients"
  }
*/

-- Add nutrition fields to recipes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'nutrition_facts'
  ) THEN
    ALTER TABLE recipes ADD COLUMN nutrition_facts JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'nutrition_generated_at'
  ) THEN
    ALTER TABLE recipes ADD COLUMN nutrition_generated_at timestamptz;
  END IF;
END $$;

-- Add random likes to comments (3-12 likes for interesting comments)
DO $$
DECLARE
  comment_record RECORD;
  user_record RECORD;
  like_count INTEGER;
  i INTEGER;
BEGIN
  FOR comment_record IN SELECT id FROM comments LOOP
    like_count := floor(random() * 13)::INTEGER;
    
    i := 0;
    FOR user_record IN SELECT id FROM auth.users ORDER BY random() LIMIT like_count LOOP
      INSERT INTO comment_likes (comment_id, user_id, created_at)
      VALUES (comment_record.id, user_record.id, now() - (random() * interval '7 days'))
      ON CONFLICT (comment_id, user_id) DO NOTHING;
      
      i := i + 1;
      IF i >= like_count THEN
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Add demo nutrition facts to recipes
UPDATE recipes
SET 
  nutrition_facts = jsonb_build_object(
    'per_serving', jsonb_build_object(
      'calories', floor(random() * 650 + 150)::INTEGER,
      'total_fat', floor(random() * 30 + 5)::INTEGER,
      'saturated_fat', floor(random() * 10 + 2)::INTEGER,
      'cholesterol', floor(random() * 100 + 20)::INTEGER,
      'sodium', floor(random() * 800 + 200)::INTEGER,
      'carbohydrates', floor(random() * 60 + 15)::INTEGER,
      'fiber', floor(random() * 8 + 2)::INTEGER,
      'sugar', floor(random() * 20 + 3)::INTEGER,
      'protein', floor(random() * 40 + 8)::INTEGER
    ),
    'generated_at', now()::TEXT,
    'disclaimer', 'Estimated values based on ingredients. Actual nutrition may vary.'
  ),
  nutrition_generated_at = now()
WHERE nutrition_facts IS NULL;
