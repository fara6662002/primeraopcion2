-- Function to completely delete a user (profile + auth credentials)
-- SECURITY DEFINER allows running with service-role privileges
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete the user's profile data
  DELETE FROM public.profiles WHERE id = target_user_id;
  -- Delete the user's auth credentials
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated role (admin will call this)
GRANT EXECUTE ON FUNCTION public.delete_user_completely(UUID) TO authenticated;
