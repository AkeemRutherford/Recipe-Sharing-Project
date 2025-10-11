/*
  # Add AI Generation Tracking Fields

  1. New Fields to recipes table
    - ai_generated (boolean, default false)
    - generation_method (text) - 'manual', 'voice', 'image', 'url_import'
    - original_transcript (text, nullable) - stores voice dictation
    - ai_confidence_score (numeric, nullable) - AI generation confidence (0-1)
    - edited_after_generation (boolean, default false)

  2. Description
    These fields track how recipes are created and whether they use AI
    assistance. This helps users understand recipe sources and enables
    filtering/sorting by generation method.
*/

-- Add AI generation tracking fields to recipes table
DO $$
BEGIN
  -- Track if recipe was AI-generated
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'ai_generated') THEN
    ALTER TABLE recipes ADD COLUMN ai_generated boolean DEFAULT false;
  END IF;

  -- Track generation method
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'generation_method') THEN
    ALTER TABLE recipes ADD COLUMN generation_method text CHECK (generation_method IN ('manual', 'voice', 'image', 'url_import')) DEFAULT 'manual';
  END IF;

  -- Store original voice transcript
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'original_transcript') THEN
    ALTER TABLE recipes ADD COLUMN original_transcript text;
  END IF;

  -- Store AI confidence score
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'ai_confidence_score') THEN
    ALTER TABLE recipes ADD COLUMN ai_confidence_score numeric(3,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1);
  END IF;

  -- Track if user edited AI-generated recipe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'edited_after_generation') THEN
    ALTER TABLE recipes ADD COLUMN edited_after_generation boolean DEFAULT false;
  END IF;
END $$;

-- Create index for filtering by generation method
CREATE INDEX IF NOT EXISTS idx_recipes_generation_method ON recipes(generation_method);
CREATE INDEX IF NOT EXISTS idx_recipes_ai_generated ON recipes(ai_generated) WHERE ai_generated = true;

-- Add helpful comment
COMMENT ON COLUMN recipes.generation_method IS 'How the recipe was created: manual (typed), voice (dictated), image (from photo), url_import (scraped)';
COMMENT ON COLUMN recipes.ai_confidence_score IS 'AI confidence in generated recipe accuracy (0.0 to 1.0)';
