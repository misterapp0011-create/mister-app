-- Seed initial trade categories
INSERT INTO trades (name, slug, icon) VALUES
  ('Plumbing',        'plumbing',        'wrench'),
  ('Electrical',       'electrical',       'bolt'),
  ('Carpentry',        'carpentry',        'hammer'),
  ('HVAC',             'hvac',             'wind'),
  ('Painting',         'painting',         'paint-roller'),
  ('Landscaping',      'landscaping',      'leaf'),
  ('Roofing',          'roofing',          'home'),
  ('General Handyman', 'general-handyman', 'toolbox'),
  ('Appliance Repair', 'appliance-repair', 'washing-machine'),
  ('Flooring',         'flooring',         'layers'),
  ('Cleaning',         'cleaning',         'sparkles'),
  ('Moving & Hauling', 'moving-hauling',   'truck')
ON CONFLICT (slug) DO NOTHING;
