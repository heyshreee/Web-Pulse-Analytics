-- Migration: Update subscription plans to canonical 5 tiers (Nano, Lite, Pro, Max, Enterprise)

INSERT INTO public.plans (
    id, name, price, price_usd, price_inr, interval, visitor_limit, project_limit, allowed_origins_limit, features
) VALUES 
('nano', 'Nano', 0, 0, 0, 'month', 10000, 1, 1, 
 '["1 Project", "1 Allowed Origin", "10,000 events/mo", "7-day retention", "60 sec refresh", "Basic API"]'::jsonb),
('lite', 'Lite', 199, 2.49, 199, 'month', 100000, 3, 3, 
 '["3 Projects", "3 Allowed Origins", "100,000 events/mo", "30-day retention", "15 sec refresh", "Basic API", "Limited export"]'::jsonb),
('pro', 'Pro', 699, 8.99, 699, 'month', 1000000, 10, 10, 
 '["10 Projects", "10 Allowed Origins", "1,000,000 events/mo", "90-day retention", "5 sec refresh", "Live Logs", "Full API", "V2 Beta access"]'::jsonb),
('max', 'Max', 1999, 24.99, 1999, 'month', 5000000, 50, 25, 
 '["50 Projects", "25 Allowed Origins", "5,000,000 events/mo", "12-month retention", "1 sec refresh", "Live Logs", "Full API", "Alpha invitation eligible"]'::jsonb),
('enterprise', 'Enterprise', 0, 0, 0, 'month', 50000000, 500, 100, 
 '["Custom Projects", "Custom Origins", "Negotiated events/mo", "Custom retention", "1 sec refresh", "Dedicated support", "Custom SLA"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    price_usd = EXCLUDED.price_usd,
    price_inr = EXCLUDED.price_inr,
    visitor_limit = EXCLUDED.visitor_limit,
    project_limit = EXCLUDED.project_limit,
    allowed_origins_limit = EXCLUDED.allowed_origins_limit,
    features = EXCLUDED.features,
    updated_at = now();
