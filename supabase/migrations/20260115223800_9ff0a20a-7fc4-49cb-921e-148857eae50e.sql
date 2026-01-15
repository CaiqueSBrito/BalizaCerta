-- ============================================
-- ADD SERVER-SIDE INPUT VALIDATION VIA CHECK CONSTRAINTS
-- These constraints enforce validation at the database level
-- regardless of how data is inserted/updated
-- ============================================

-- 1. CPF format validation (11 digits only)
-- Using the existing validate_cpf() function
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_cpf_format 
CHECK (cpf IS NULL OR cpf ~ '^[0-9]{11}$');

-- 2. WhatsApp format validation (10-11 digits)
-- Using the existing validate_whatsapp() function pattern
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_whatsapp_format 
CHECK (whatsapp IS NULL OR whatsapp ~ '^[0-9]{10,11}$');

-- 3. Phone format validation (10-11 digits, same as WhatsApp)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_format 
CHECK (phone IS NULL OR phone ~ '^[0-9]{10,11}$');

-- 4. Age validation (18-100 for legal driving age)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_age_range 
CHECK (age IS NULL OR (age >= 18 AND age <= 100));

-- 5. First name length constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_first_name_length 
CHECK (first_name IS NULL OR (LENGTH(first_name) >= 1 AND LENGTH(first_name) <= 50));

-- 6. Last name length constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_last_name_length 
CHECK (last_name IS NULL OR (LENGTH(last_name) >= 1 AND LENGTH(last_name) <= 50));

-- 7. Full name length constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_full_name_length 
CHECK (LENGTH(full_name) >= 1 AND LENGTH(full_name) <= 100);

-- 8. Email format basic validation
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_format 
CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- ============================================
-- INSTRUCTOR TABLE CONSTRAINTS
-- ============================================

-- 9. Bio length constraint (max 500 chars)
ALTER TABLE public.instructors 
ADD CONSTRAINT instructors_bio_length 
CHECK (bio IS NULL OR LENGTH(bio) <= 500);

-- 10. City length constraint (2-100 chars)
ALTER TABLE public.instructors 
ADD CONSTRAINT instructors_city_length 
CHECK (city IS NULL OR (LENGTH(city) >= 2 AND LENGTH(city) <= 100));

-- 11. State format (2 uppercase letters for Brazilian states)
ALTER TABLE public.instructors 
ADD CONSTRAINT instructors_state_format 
CHECK (state IS NULL OR state ~ '^[A-Z]{2}$');

-- 12. Price per hour validation (reasonable range)
ALTER TABLE public.instructors 
ADD CONSTRAINT instructors_price_range 
CHECK (price_per_hour >= 0 AND price_per_hour <= 10000);

-- 13. CNH years validation (0-70 years reasonable max)
ALTER TABLE public.instructors 
ADD CONSTRAINT instructors_cnh_years_range 
CHECK (cnh_years >= 0 AND cnh_years <= 70);

-- 14. Rating validation (0-5 scale)
ALTER TABLE public.instructors 
ADD CONSTRAINT instructors_rating_range 
CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));

-- 15. Review count validation (non-negative)
ALTER TABLE public.instructors 
ADD CONSTRAINT instructors_review_count_range 
CHECK (review_count IS NULL OR review_count >= 0);

-- 16. Specialties array size limit (max 10 specialties)
ALTER TABLE public.instructors 
ADD CONSTRAINT instructors_specialties_limit 
CHECK (specialties IS NULL OR array_length(specialties, 1) IS NULL OR array_length(specialties, 1) <= 10);

-- 17. DETRAN certificate format (alphanumeric, max 50 chars)
ALTER TABLE public.instructors 
ADD CONSTRAINT instructors_detran_cert_format 
CHECK (detran_certificate IS NULL OR (LENGTH(detran_certificate) <= 50 AND detran_certificate ~ '^[A-Za-z0-9\-\/]+$'));