-- Guards that must hold. Run against a fresh database with the migration applied.
-- These are the constraints where a failure would have real-world consequences,
-- so they are asserted rather than assumed.

\set ON_ERROR_STOP on

insert into parks (slug, name, states, is_validation_park)
values ('zion', 'Zion National Park', '{UT}', true);

-- ── GUARD 1: a route cannot be published on unverified facts ────────────────
do $$
declare ok boolean := false;
begin
  begin
    insert into challenges (park_slug, key, tier, name, route_source_tier, status)
    values ('zion', 'parus', 'explorer', 'Pa''rus Out-and-Back', 'T2', 'published');
  exception when check_violation then ok := true;
  end;
  if not ok then
    raise exception 'GUARD 1 FAILED: published a challenge on a T2 source';
  end if;
  raise notice 'GUARD 1 ok: T2 source cannot be published';
end $$;

do $$
declare ok boolean := false;
begin
  begin
    insert into challenges (park_slug, key, tier, name, route_source_tier, status)
    values ('zion', 'parus2', 'explorer', 'x', 'T0', 'published');
  exception when check_violation then ok := true;
  end;
  if not ok then raise exception 'GUARD 1b FAILED: published on a T0 source'; end if;
  raise notice 'GUARD 1b ok: T0 source cannot be published';
end $$;

-- Draft on an unverified source is fine; that is how research starts.
insert into challenges (park_slug, key, tier, name, route_source_tier, status)
values ('zion', 'parus', 'explorer', 'Pa''rus Out-and-Back', 'T2', 'draft');

-- T1 may publish.
insert into challenges (park_slug, key, tier, name, route_source_tier, status)
values ('zion', 'watchman', 'adventure', 'Watchman', 'T1', 'published');
do $$ begin raise notice 'GUARD 1c ok: T1 source publishes'; end $$;

-- ── GUARD 2: the Founding Collector cap of 250 is real ──────────────────────
insert into waitlist (email, price_cohort) values ('a@example.test', 'p39');
insert into participants (email, referral_token) values ('a@example.test', 'tok_a');
insert into orders (email, kind, amount_cents, status) values ('a@example.test', 'founding_collector', 9900, 'paid');

do $$
declare oid_ uuid; ok boolean := false;
begin
  select id into oid_ from orders limit 1;
  begin
    insert into founding_collectors (order_id, number) values (oid_, 251);
  exception when check_violation then ok := true;
  end;
  if not ok then raise exception 'GUARD 2 FAILED: issued founding number 251'; end if;
  raise notice 'GUARD 2 ok: number 251 rejected';

  ok := false;
  begin
    insert into founding_collectors (order_id, number) values (oid_, 0);
  exception when check_violation then ok := true;
  end;
  if not ok then raise exception 'GUARD 2b FAILED: issued founding number 0'; end if;
  raise notice 'GUARD 2b ok: number 0 rejected';
end $$;

-- ── GUARD 3: safety content cannot exist without a source ───────────────────
do $$
declare ok boolean := false;
begin
  begin
    insert into safety_notices (park_slug, severity, title, body, source_name, source_url, checked_at)
    values ('zion', 'warning', 'Flash flood', 'body', null, 'https://x', now());
  exception when not_null_violation then ok := true;
  end;
  if not ok then raise exception 'GUARD 3 FAILED: safety notice without a source name'; end if;
  raise notice 'GUARD 3 ok: unsourced safety content rejected';
end $$;

-- ── GUARD 4: RLS enabled AND forced on every table ──────────────────────────
do $$
declare bad text;
begin
  select string_agg(c.relname, ', ')
    into bad
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and (c.relrowsecurity = false or c.relforcerowsecurity = false);
  if bad is not null then
    raise exception 'GUARD 4 FAILED: RLS not enabled/forced on: %', bad;
  end if;
  raise notice 'GUARD 4 ok: RLS enabled and forced on all tables';
end $$;

-- ── GUARD 5: no policies grant anon or authenticated any access ─────────────
do $$
declare n integer;
begin
  select count(*) into n from pg_policies where schemaname = 'public';
  if n > 0 then
    raise exception 'GUARD 5 FAILED: % policies exist; validation phase expects none', n;
  end if;
  raise notice 'GUARD 5 ok: no policies, so anon and authenticated get nothing';
end $$;

-- ── GUARD 6: a participant cannot complete the same challenge twice ─────────
do $$
declare pid uuid; cid uuid; sid uuid; vid uuid; ok boolean := false;
begin
  select id into pid from participants limit 1;
  select id into cid from challenges where key = 'watchman';

  insert into submissions (participant_id, challenge_id, kind) values (pid, cid, 'gpx') returning id into sid;
  insert into verifications (submission_id, decision, reviewer) values (sid, 'verified', 'founder') returning id into vid;
  insert into completions (participant_id, challenge_id, submission_id, verification_id,
                           ordinal_for_participant, unlock_token, public_token,
                           share_variant, page_variant, completed_on)
  values (pid, cid, sid, vid, 1, 'unl_1', 'pub_1', 'A', 'C', current_date);

  insert into submissions (participant_id, challenge_id, kind) values (pid, cid, 'gpx') returning id into sid;
  insert into verifications (submission_id, decision, reviewer) values (sid, 'verified', 'founder') returning id into vid;
  begin
    insert into completions (participant_id, challenge_id, submission_id, verification_id,
                             ordinal_for_participant, unlock_token, public_token,
                             share_variant, page_variant, completed_on)
    values (pid, cid, sid, vid, 2, 'unl_2', 'pub_2', 'A', 'C', current_date);
  exception when unique_violation then ok := true;
  end;
  if not ok then raise exception 'GUARD 6 FAILED: duplicate completion allowed'; end if;
  raise notice 'GUARD 6 ok: duplicate completion rejected';
end $$;

do $$ begin raise notice 'ALL SCHEMA GUARDS PASSED'; end $$;
