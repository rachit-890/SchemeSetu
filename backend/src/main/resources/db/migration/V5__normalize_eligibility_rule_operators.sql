UPDATE eligibility_rules SET operator = 'LT' WHERE operator = 'LESS_THAN';
UPDATE eligibility_rules SET operator = 'LTE' WHERE operator = 'LESS_THAN_OR_EQUALS';
UPDATE eligibility_rules SET operator = 'EQ' WHERE operator = 'EQUALS';
UPDATE eligibility_rules SET operator = 'GT' WHERE operator = 'GREATER_THAN';
UPDATE eligibility_rules SET operator = 'GTE' WHERE operator = 'GREATER_THAN_OR_EQUALS';
UPDATE eligibility_rules SET field = 'MONTHLY_INCOME' WHERE field = 'ANNUAL_INCOME';
UPDATE eligibility_rules SET field = 'CASTE_CATEGORY' WHERE field = 'CATEGORY';
