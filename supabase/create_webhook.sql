
-- Enable pg_net extension to make HTTP requests
create extension if not exists pg_net;

-- Create the Trigger Function
create or replace function public.trigger_paypal_plan_creation()
returns trigger as $$
begin
  -- Call the Edge Function
  -- Replace the URL with your actual project URL if different
  perform net.http_post(
    url := 'https://myyzheivxzfykasdcsqd.supabase.co/functions/v1/create-paypal-plan',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create the Trigger
drop trigger if exists on_plan_created on public.plans;
create trigger on_plan_created
  after insert on public.plans
  for each row
  execute function public.trigger_paypal_plan_creation();
