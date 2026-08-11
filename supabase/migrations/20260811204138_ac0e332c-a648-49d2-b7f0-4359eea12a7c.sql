REVOKE ALL ON SCHEMA private FROM anon, authenticated;
REVOKE ALL ON FUNCTION private.dispatch_ai_replies() FROM public, anon, authenticated;