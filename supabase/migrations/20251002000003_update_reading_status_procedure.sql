CREATE OR REPLACE FUNCTION public.update_reading_status(
  p_user_id UUID,
  p_book_id UUID,
  p_current_cfi TEXT DEFAULT NULL,
  p_current_page INTEGER DEFAULT NULL,
  p_status TEXT DEFAULT 'reading'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_result JSONB;
  v_existing_record BOOLEAN;
BEGIN
  -- Check if user ID is provided
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User ID is required');
  END IF;

  -- Check if book ID is provided
  IF p_book_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Book ID is required');
  END IF;

  -- Check if status is valid
  IF p_status IS NOT NULL AND p_status NOT IN ('reading', 'completed', 'on_hold', 'dropped') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid status value');
  END IF;

  -- Check if record exists
  SELECT EXISTS(
    SELECT 1 FROM user_books 
    WHERE user_id = p_user_id AND book_id = p_book_id
  ) INTO v_existing_record;

  IF v_existing_record THEN
    -- Update existing record
    UPDATE user_books
    SET 
      current_cfi = COALESCE(p_current_cfi, current_cfi),
      current_page = COALESCE(p_current_page, current_page),
      status = COALESCE(p_status, status),
      last_read_at = v_now,
      updated_at = v_now
    WHERE user_id = p_user_id AND book_id = p_book_id
    RETURNING jsonb_build_object(
      'id', id,
      'book_id', book_id,
      'user_id', user_id,
      'current_cfi', current_cfi,
      'current_page', current_page,
      'status', status,
      'last_read_at', last_read_at,
      'updated_at', updated_at
    ) INTO v_result;
  ELSE
    -- Insert new record
    INSERT INTO user_books (
      book_id,
      user_id,
      current_cfi,
      current_page,
      status,
      last_read_at,
      created_at,
      updated_at
    )
    VALUES (
      p_book_id,
      p_user_id,
      p_current_cfi,
      p_current_page,
      p_status,
      v_now,
      v_now,
      v_now
    )
    RETURNING jsonb_build_object(
      'id', id,
      'book_id', book_id,
      'user_id', user_id,
      'current_cfi', current_cfi,
      'current_page', current_page,
      'status', status,
      'last_read_at', last_read_at,
      'created_at', created_at,
      'updated_at', updated_at
    ) INTO v_result;
  END IF;

  RETURN jsonb_build_object('success', true, 'data', v_result);
EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_reading_status TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.update_reading_status IS 'Updates or creates a reading status entry for a user and book'; 