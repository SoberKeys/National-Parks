-- Guards for atomic founding-number issuance.
\set ON_ERROR_STOP on

insert into parks (slug, name, states) values ('zion', 'Zion National Park', '{UT}');

do $$
declare oid_ uuid; n integer;
begin
  -- Sequential issuance from 1.
  for i in 1..3 loop
    insert into orders (email, kind, amount_cents, status)
    values (format('u%s@example.test', i), 'founding_collector', 9900, 'paid')
    returning id into oid_;
    n := issue_founding_number(oid_, null);
    if n <> i then
      raise exception 'GUARD 7 FAILED: expected number %, got %', i, n;
    end if;
  end loop;
  raise notice 'GUARD 7 ok: numbers issued sequentially from 1';
end $$;

-- Idempotent under a webhook retry.
do $$
declare oid_ uuid; a integer; b integer;
begin
  select id into oid_ from orders order by created_at limit 1;
  select number into a from founding_collectors where order_id = oid_;
  b := issue_founding_number(oid_, null);
  if a <> b then
    raise exception 'GUARD 8 FAILED: retry issued a second number (% then %)', a, b;
  end if;
  if (select count(*) from founding_collectors where order_id = oid_) <> 1 then
    raise exception 'GUARD 8 FAILED: retry created a duplicate row';
  end if;
  raise notice 'GUARD 8 ok: a webhook retry reuses the same number';
end $$;

-- The cap is real.
do $$
declare oid_ uuid; ok boolean := false;
begin
  -- Fill to 250.
  for i in 4..250 loop
    insert into orders (email, kind, amount_cents, status)
    values (format('f%s@example.test', i), 'founding_collector', 9900, 'paid')
    returning id into oid_;
    perform issue_founding_number(oid_, null);
  end loop;

  insert into orders (email, kind, amount_cents, status)
  values ('over@example.test', 'founding_collector', 9900, 'paid')
  returning id into oid_;
  begin
    perform issue_founding_number(oid_, null);
  exception when check_violation then ok := true;
  end;
  if not ok then raise exception 'GUARD 9 FAILED: issued a 251st founding number'; end if;
  if (select count(*) from founding_collectors) <> 250 then
    raise exception 'GUARD 9 FAILED: expected exactly 250 rows, found %',
      (select count(*) from founding_collectors);
  end if;
  raise notice 'GUARD 9 ok: cap holds at exactly 250';
end $$;

do $$ begin raise notice 'FOUNDING NUMBER GUARDS PASSED'; end $$;
