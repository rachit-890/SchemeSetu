-- Update PM Kisan Samman Nidhi age eligibility rule (id 8) to have no upper age limit
UPDATE eligibility_rules
SET operator = 'GTE',
    value = '18'
WHERE id = 8;
