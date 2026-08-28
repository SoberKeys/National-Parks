#!/usr/bin/env bash
# Apply the migrations to a throwaway database and run the schema guards.
#
#   ./scripts/test-schema.sh                 # spins up a local cluster
#   PGURL=postgres://... ./scripts/test-schema.sh   # against an existing server
#
# The guards assert the constraints where a failure would have real-world
# consequences: publishing a route on unverified facts, breaching the Founding
# Collector cap, unsourced safety content, and RLS being open.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PG_DIR="${PG_DIR:-/var/tmp/pgtest}"
PG_PORT="${PG_PORT:-55432}"
PG_BIN="${PG_BIN:-/usr/lib/postgresql/16/bin}"
started_here=0

if [ -z "${PGURL:-}" ]; then
  export PGHOST=127.0.0.1 PGPORT="$PG_PORT" PGUSER=postgres
  if ! pg_isready -q 2>/dev/null; then
    echo "starting a throwaway cluster in $PG_DIR"
    id postgres >/dev/null 2>&1 || useradd -m postgres
    rm -rf "$PG_DIR"; mkdir -p "$PG_DIR/data" "$PG_DIR/run"
    chown -R postgres:postgres "$PG_DIR"; chmod 750 "$PG_DIR"
    su postgres -c "$PG_BIN/initdb -D $PG_DIR/data -U postgres --auth=trust" >"$PG_DIR/initdb.log" 2>&1
    su postgres -c "$PG_BIN/pg_ctl -D $PG_DIR/data -o '-k $PG_DIR/run -p $PG_PORT -h 127.0.0.1' -l $PG_DIR/pg.log start" >/dev/null
    started_here=1
    for _ in $(seq 1 20); do pg_isready -q && break; sleep 0.5; done
  fi
  dropdb --if-exists val_test >/dev/null 2>&1 || true
  createdb val_test
  TARGET=(-d val_test)
else
  TARGET=("$PGURL")
fi

echo "--- applying migrations ---"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "  $(basename "$f")"
  psql "${TARGET[@]}" -q -v ON_ERROR_STOP=1 -f "$f" >/dev/null
done

echo "--- running guards ---"
fail=0
for f in "$ROOT"/supabase/tests/*.sql; do
  out="$(psql "${TARGET[@]}" -v ON_ERROR_STOP=1 -f "$f" 2>&1)" || fail=1
  echo "$out" | grep -E "NOTICE:|ERROR:" | sed 's/^psql:[^ ]* //'
  echo "$out" | grep -q "ERROR:" && fail=1
done

if [ "$started_here" = "1" ]; then
  su postgres -c "$PG_BIN/pg_ctl -D $PG_DIR/data stop" >/dev/null 2>&1 || true
fi

if [ "$fail" = "1" ]; then echo "SCHEMA GUARDS FAILED"; exit 1; fi
echo "SCHEMA GUARDS PASSED"
