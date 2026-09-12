-- Zumi: reference/catalogue seed data. No fake parents or children —
-- this is shared, non-sensitive curriculum data only.

insert into public.subjects (code, name, description, sort_order) values
  ('english', 'English', 'Reading, spelling and comprehension', 1),
  ('afrikaans', 'Afrikaans', 'Vocabulary, spelling and translation', 2),
  ('mathematics', 'Mathematics', 'Number facts and problem solving', 3);

insert into public.difficulty_levels (code, label, rank) values
  ('easy', 'Easy', 1),
  ('standard', 'Standard', 2),
  ('challenge', 'Challenge', 3);

insert into public.skills (subject_id, code, name, description, min_age, max_age)
select id, v.code, v.name, v.description, v.min_age, v.max_age
from public.subjects, (values
  ('reading_comprehension', 'Reading comprehension', 'Understanding short passages', 6, 12),
  ('spelling', 'English spelling', 'Common and topic spelling words', 6, 12),
  ('vocabulary', 'English vocabulary', 'Word meanings and usage', 6, 12),
  ('sentence_building', 'Sentence building', 'Constructing clear sentences', 7, 12)
) as v(code, name, description, min_age, max_age)
where subjects.code = 'english';

insert into public.skills (subject_id, code, name, description, min_age, max_age)
select id, v.code, v.name, v.description, v.min_age, v.max_age
from public.subjects, (values
  ('afrikaans_vocabulary', 'Afrikaans vocabulary', 'Everyday Afrikaans words', 6, 12),
  ('afrikaans_spelling', 'Afrikaans spelling', 'Spelling common Afrikaans words', 6, 12),
  ('afrikaans_translation', 'Afrikaans translation', 'Translating between English and Afrikaans', 7, 12)
) as v(code, name, description, min_age, max_age)
where subjects.code = 'afrikaans';

insert into public.skills (subject_id, code, name, description, min_age, max_age)
select id, v.code, v.name, v.description, v.min_age, v.max_age
from public.subjects, (values
  ('times_tables_2_5', 'Times tables 2-5', 'Multiplication facts 2x-5x', 6, 10),
  ('times_tables_6_9', 'Times tables 6-9', 'Multiplication facts 6x-9x', 8, 12),
  ('addition_subtraction', 'Addition & subtraction', 'Number fact fluency', 6, 10),
  ('word_problems', 'Word problems', 'Applying maths to real scenarios', 8, 12)
) as v(code, name, description, min_age, max_age)
where subjects.code = 'mathematics';

insert into public.badges (code, name, description, icon, criteria) values
  ('first_session', 'First Steps', 'Completed your first Zumi session', 'sparkles', '{"type": "sessions_completed", "count": 1}'),
  ('streak_3', 'On a Roll', 'Practised 3 days in a row', 'flame', '{"type": "streak", "days": 3}'),
  ('streak_7', 'Week Warrior', 'Practised 7 days in a row', 'flame', '{"type": "streak", "days": 7}'),
  ('perfect_quiz', 'Perfect Score', 'Got 100% on a quiz', 'medal', '{"type": "perfect_quiz"}'),
  ('vocab_novice', 'Word Explorer', 'Reached 90% mastery on a vocabulary skill', 'book', '{"type": "skill_mastery", "score": 90}'),
  ('maths_whiz', 'Maths Whiz', 'Reached 90% mastery on a maths skill', 'calculator', '{"type": "skill_mastery", "score": 90}');
