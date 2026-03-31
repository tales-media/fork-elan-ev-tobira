#!/usr/bin/env bash

basedir=$(dirname "$0")
cd "$basedir"/../.. || exit 1

filename="$1"
cache_folder="util/.db-dumps-cache"
if [ ! -f "$cache_folder/$filename" ]; then
  >&2 echo "DB dump '$cache_folder/$filename' not found"
  exit 1
fi

db_start() {
  docker run --rm -d \
    --name tobira-tmp-shio \
    -p 127.0.0.1:15432:5432 \
    -e "POSTGRES_PASSWORD=tobira" \
    -e "POSTGRES_USER=tobira" \
    -e "POSTGRES_DB=tobira" \
    docker.io/library/postgres:12

  until echo "select 1;" | db_exec >/dev/null 2>&1; do
    echo "Waiting for database to start..."
    sleep 1
  done
}

db_stop() {
  docker stop tobira-tmp-shio
}

db_init() {
  docker exec -i tobira-tmp-shio \
    pg_restore \
      --dbname 'postgresql://tobira:tobira@localhost/postgres' \
      --clean \
      --create \
      --if-exists < "$cache_folder/$filename"
}

db_dump() {
  docker exec -i tobira-tmp-shio \
    pg_dump \
      --format plain \
      --dbname 'postgresql://tobira:tobira@localhost/tobira' \
      --compress 0 \
      --quote-all-identifiers \
      > "$cache_folder/$filename-shio.sql"
}

db_exec() {
  docker exec -i tobira-tmp-shio \
    psql --dbname 'postgresql://tobira:tobira@localhost/tobira'
}

db_start
db_init

# We changed the following migrations, so we need to update the scripts in the DB dump to match the new ones.

cat << EOF | db_exec
UPDATE __db_migrations
SET script = \$migration\$$(cat backend/src/db/migrations/05-events.sql)
\$migration\$
WHERE id = 5;
EOF

cat << EOF | db_exec
UPDATE __db_migrations
SET script = \$migration\$$(cat backend/src/db/migrations/06-blocks.sql)
\$migration\$
WHERE id = 6;
EOF

cat << EOF | db_exec
UPDATE __db_migrations
SET script = \$migration\$$(cat backend/src/db/migrations/16-master-track.sql)
\$migration\$
WHERE id = 16;
EOF

# Apply schema changes we made in our custom migrations.

cat << EOF | db_exec
ALTER TABLE blocks
  DROP CONSTRAINT index_unique_in_realm,
  ADD CONSTRAINT index_unique_in_realm UNIQUE(realm, index);
EOF

db_dump
db_stop
