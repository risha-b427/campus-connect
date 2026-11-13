/*
    Automatically create a row in public.users whenever someone signs up
    (a new row appears in auth.users). username and display_name are required,
    so we generate them from the email. The user can change them later.
*/
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    email_name TEXT;
    base_name TEXT;
BEGIN
    email_name := split_part(COALESCE(NEW.email, 'user'), '@', 1);
    base_name := lower(regexp_replace(email_name, '[^a-zA-Z0-9_]', '', 'g'));

    IF base_name = '' THEN
        base_name := 'user';
    END IF;

    -- the id suffix keeps usernames unique even if two emails start the same
    INSERT INTO public.users (user_id, username, display_name)
    VALUES (
        NEW.id,
        left(base_name, 40) || '_' || substr(replace(NEW.id::text, '-', ''), 1, 8),
        COALESCE(NULLIF(email_name, ''), 'user')
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
