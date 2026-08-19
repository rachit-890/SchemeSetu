INSERT INTO schemes (name, description, category, issuing_body, source_url, application_process, status)
VALUES
(
    'PM Kisan Samman Nidhi',
    'Financial benefit of Rs 6000 per year to eligible farmer families across the country.',
    'SUBSIDY',
    'Ministry of Agriculture and Farmers Welfare',
    'https://pmkisan.gov.in/',
    'Apply online through PM Kisan portal or visit nearest Common Service Center (CSC).',
    'ACTIVE'
),
(
    'Post Matric Scholarship for SC/ST',
    'Financial assistance to SC/ST students studying at post-matriculation or post-secondary stage.',
    'SCHOLARSHIP',
    'Government of Uttar Pradesh',
    'https://scholarship.up.gov.in/',
    'Register on UP Scholarship portal, submit academic details, and upload income certificate.',
    'ACTIVE'
),
(
    'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    'Health cover of Rs 5 lakhs per family per year for secondary and tertiary care hospitalization.',
    'HEALTHCARE',
    'National Health Authority',
    'https://pmjay.gov.in/',
    'Check eligibility online or visit empanelled hospital with Ration Card and Aadhaar.',
    'ACTIVE'
);

INSERT INTO eligibility_rules (scheme_id, field, operator, value, status)
VALUES
(1, 'OCCUPATION', 'EQUALS', 'FARMER', 'ACTIVE'),
(1, 'ANNUAL_INCOME', 'LESS_THAN', '200000', 'ACTIVE'),
(2, 'CATEGORY', 'IN', 'SC,ST', 'ACTIVE'),
(2, 'ANNUAL_INCOME', 'LESS_THAN_OR_EQUALS', '250000', 'ACTIVE'),
(3, 'ANNUAL_INCOME', 'LESS_THAN', '300000', 'ACTIVE');
