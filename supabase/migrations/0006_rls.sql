-- Zumi: Row Level Security. A parent may only ever read/write rows that
-- belong to their own children; admins get explicit additional policies on
-- shared catalogue tables. The child never authenticates directly in V1 —
-- the child UI runs inside the parent's session, so these policies are the
-- entire access boundary for both parent and child screens.

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

create function public.owns_child(target_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.children c
    join public.parent_profiles pp on pp.id = c.parent_id
    where c.id = target_child_id and pp.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------- identity

alter table public.users enable row level security;
create policy "users read own row" on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy "users update own row" on public.users
  for update using (id = auth.uid());

alter table public.parent_profiles enable row level security;
create policy "parents manage own profile" on public.parent_profiles
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

alter table public.children enable row level security;
create policy "parents manage own children" on public.children
  for all using (
    parent_id in (select id from public.parent_profiles where user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    parent_id in (select id from public.parent_profiles where user_id = auth.uid())
  );

alter table public.child_learning_priorities enable row level security;
create policy "parents manage own children priorities" on public.child_learning_priorities
  for all using (public.owns_child(child_id) or public.is_admin())
  with check (public.owns_child(child_id));

-- ------------------------------------------------------- shared catalogue

alter table public.subjects enable row level security;
create policy "authenticated users read subjects" on public.subjects
  for select using (auth.role() = 'authenticated');
create policy "admins write subjects" on public.subjects
  for insert with check (public.is_admin());
create policy "admins update subjects" on public.subjects
  for update using (public.is_admin());
create policy "admins delete subjects" on public.subjects
  for delete using (public.is_admin());

alter table public.skills enable row level security;
create policy "authenticated users read skills" on public.skills
  for select using (auth.role() = 'authenticated');
create policy "admins write skills" on public.skills
  for insert with check (public.is_admin());
create policy "admins update skills" on public.skills
  for update using (public.is_admin());
create policy "admins delete skills" on public.skills
  for delete using (public.is_admin());

alter table public.difficulty_levels enable row level security;
create policy "authenticated users read difficulty levels" on public.difficulty_levels
  for select using (auth.role() = 'authenticated');
create policy "admins write difficulty levels" on public.difficulty_levels
  for insert with check (public.is_admin());
create policy "admins update difficulty levels" on public.difficulty_levels
  for update using (public.is_admin());
create policy "admins delete difficulty levels" on public.difficulty_levels
  for delete using (public.is_admin());

alter table public.activity_templates enable row level security;
create policy "authenticated users read activity templates" on public.activity_templates
  for select using (auth.role() = 'authenticated');
create policy "admins write activity templates" on public.activity_templates
  for insert with check (public.is_admin());
create policy "admins update activity templates" on public.activity_templates
  for update using (public.is_admin());
create policy "admins delete activity templates" on public.activity_templates
  for delete using (public.is_admin());

alter table public.badges enable row level security;
create policy "authenticated users read badges" on public.badges
  for select using (auth.role() = 'authenticated');
create policy "admins write badges" on public.badges
  for insert with check (public.is_admin());
create policy "admins update badges" on public.badges
  for update using (public.is_admin());
create policy "admins delete badges" on public.badges
  for delete using (public.is_admin());

-- ------------------------------------------------------------------ content

alter table public.practice_sets enable row level security;
create policy "parents manage own practice sets" on public.practice_sets
  for all using (
    parent_id in (select id from public.parent_profiles where user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    parent_id in (select id from public.parent_profiles where user_id = auth.uid())
    or public.is_admin()
  );

alter table public.activities enable row level security;
create policy "parents manage activities in own practice sets" on public.activities
  for all using (
    practice_set_id in (
      select ps.id from public.practice_sets ps
      join public.parent_profiles pp on pp.id = ps.parent_id
      where pp.user_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    practice_set_id in (
      select ps.id from public.practice_sets ps
      join public.parent_profiles pp on pp.id = ps.parent_id
      where pp.user_id = auth.uid()
    )
    or public.is_admin()
  );

alter table public.questions enable row level security;
create policy "parents manage questions in own activities" on public.questions
  for all using (
    activity_id in (
      select a.id from public.activities a
      join public.practice_sets ps on ps.id = a.practice_set_id
      join public.parent_profiles pp on pp.id = ps.parent_id
      where pp.user_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    activity_id in (
      select a.id from public.activities a
      join public.practice_sets ps on ps.id = a.practice_set_id
      join public.parent_profiles pp on pp.id = ps.parent_id
      where pp.user_id = auth.uid()
    )
    or public.is_admin()
  );

alter table public.assignments enable row level security;
create policy "parents manage own children assignments" on public.assignments
  for all using (public.owns_child(child_id) or public.is_admin())
  with check (public.owns_child(child_id));

-- --------------------------------------------------------------- progress

alter table public.attempts enable row level security;
create policy "parents manage own children attempts" on public.attempts
  for all using (public.owns_child(child_id) or public.is_admin())
  with check (public.owns_child(child_id));

alter table public.child_skill_progress enable row level security;
create policy "parents manage own children progress" on public.child_skill_progress
  for all using (public.owns_child(child_id) or public.is_admin())
  with check (public.owns_child(child_id));

alter table public.xp_events enable row level security;
create policy "parents manage own children xp events" on public.xp_events
  for all using (public.owns_child(child_id) or public.is_admin())
  with check (public.owns_child(child_id));

alter table public.streaks enable row level security;
create policy "parents manage own children streaks" on public.streaks
  for all using (public.owns_child(child_id) or public.is_admin())
  with check (public.owns_child(child_id));

alter table public.child_badges enable row level security;
create policy "parents manage own children badges" on public.child_badges
  for all using (public.owns_child(child_id) or public.is_admin())
  with check (public.owns_child(child_id));

-- --------------------------------------------------------------- reporting

alter table public.weekly_reports enable row level security;
create policy "parents manage own children weekly reports" on public.weekly_reports
  for all using (public.owns_child(child_id) or public.is_admin())
  with check (public.owns_child(child_id));
