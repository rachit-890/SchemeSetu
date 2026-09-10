-- Cleanup redundant and leftover test eligibility rules
-- Delete redundant MONTHLY_INCOME rule on Scheme 1 (PM Kisan)
DELETE FROM eligibility_rules WHERE id = 6;

-- Delete leftover PENDING_REVIEW test rules for Scheme 1 (PM Kisan)
DELETE FROM eligibility_rules WHERE id IN (9, 10, 11, 12, 13);

-- Delete leftover PENDING_REVIEW test rules for Scheme 6 (Mukhyamantri Kanya Vidyadhan)
DELETE FROM eligibility_rules WHERE id IN (19, 20, 21, 22, 23);
