-- ============================================================================
-- Atomic Founding Collector number assignment.
--
-- The cap of 250 is a real promise to 250 people, not marketing copy. Two
-- webhooks arriving at once must not be able to issue the same number or a
-- 251st place, so the assignment happens inside the database under a lock
-- rather than in application code that reads then writes.
-- ============================================================================

create or replace function issue_founding_number(p_order_id uuid, p_participant_id uuid)
returns integer
language plpgsql
as $$
declare
  v_existing integer;
  v_next integer;
begin
  -- Idempotent: Stripe retries webhooks, and a retry must not consume a second
  -- number for the same order.
  select number into v_existing
  from founding_collectors where order_id = p_order_id;
  if v_existing is not null then
    return v_existing;
  end if;

  -- Serialise all issuance on one advisory lock. Contention here is trivial:
  -- there are at most 250 of these events in the life of the pilot.
  perform pg_advisory_xact_lock(hashtext('founding_collectors'));

  select coalesce(max(number), 0) + 1 into v_next from founding_collectors;

  if v_next > 250 then
    raise exception 'founding collector cap reached'
      using errcode = 'check_violation';
  end if;

  insert into founding_collectors (order_id, participant_id, number)
  values (p_order_id, p_participant_id, v_next);

  return v_next;
end $$;

comment on function issue_founding_number is
  'Assigns the next Founding Collector number atomically and idempotently. '
  'Raises check_violation past 250.';
