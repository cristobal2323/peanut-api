---
name: supabase
description: Manage the Supabase database — run queries, inspect tables, manage migrations, check status, and handle RLS policies. Use when the user asks about database operations, schema changes, data inspection, or Supabase management.
allowed-tools: Bash(supabase:*) Bash(npx prisma:*) Bash(npm run prisma:*)
argument-hint: [action] [details]
---

# Supabase Database Management

You are managing the Supabase PostgreSQL database for the Trufa ID (Peanut) project.

## Project Context

- **ORM:** Prisma 7 with PostgreSQL adapter (`@prisma/adapter-pg`)
- **Schema:** `backend/prisma/schema.prisma`
- **Migrations:** Managed via Prisma (`npm run prisma:migrate` from `backend/`)
- **Connection:** Uses `DATABASE_URL` and `DIRECT_URL` from `backend/.env`

## Connection

The project is linked locally (ref: `fgmdzdghpehrrxhgpctc`). All queries use `supabase db query --linked`.

## Available Actions

Parse `$ARGUMENTS` to determine what the user wants. Common patterns:

### Query / Inspect Data
- `supabase status` — Show project status and connection info
- `supabase query <sql>` — Run arbitrary SQL (read-only unless user confirms writes)
- Examples: "show me all users", "count lost reports", "recent scan events"

```bash
# Run a SQL query
supabase db query --linked -o table "SELECT * FROM \"User\" LIMIT 10;"
```

**IMPORTANT:** Prisma maps models to table names matching the model name exactly (e.g., model `User` -> table `"User"`). Always quote table names in SQL since they use PascalCase.

### Schema / Tables
- "tables" or "schema" — List all tables and their columns
- "describe <table>" — Show columns, types, and constraints for a table

```bash
# List tables
supabase db query --linked -o table "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

# Describe a table
supabase db query --linked -o table "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '<TableName>' ORDER BY ordinal_position;"

# Table sizes
supabase db query --linked -o table "SELECT relname AS table, n_live_tup AS row_count FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"
```

### Migrations
- "migrate" or "migration" — Run or create Prisma migrations
- Always run from `backend/` directory

```bash
# Generate Prisma client after schema changes
cd backend && npm run prisma:generate

# Create and apply a new migration
cd backend && npx prisma migrate dev --name <migration_name>

# Check migration status
cd backend && npx prisma migrate status

# Reset database (DESTRUCTIVE - always confirm with user)
cd backend && npx prisma migrate reset
```

### RLS Policies (Row Level Security)
- "rls" or "policies" — Inspect or manage RLS policies

```bash
# List all RLS policies
supabase db query --linked -o table "SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public';"

# Check if RLS is enabled on tables
supabase db query --linked -o table "SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relkind = 'r';"
```

### Storage / Buckets
```bash
# List storage buckets
supabase storage ls --project-ref <ref>
```

### Database Health
```bash
# Active connections
supabase db query --linked -o table "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"

# Database size
supabase db query --linked -o table "SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;"

# Slow queries
supabase db query --linked -o table "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Index usage
supabase db query --linked -o table "SELECT relname, indexrelname, idx_scan, idx_tup_read FROM pg_stat_user_indexes ORDER BY idx_scan DESC LIMIT 20;"
```

### Supabase Functions
```bash
# List edge functions
supabase functions list --project-ref <ref>

# Deploy a function
supabase functions deploy <function-name> --project-ref <ref>
```

## Key Tables (from Prisma schema)

| Table | Description |
|-------|-------------|
| User | Users with roles (OWNER, RESCUER, VET, etc.) |
| Owner | Extended owner profile (address, city) |
| Dog | Dogs with breed, size, microchip, lost status |
| NoseEmbedding | Biometric nose print vectors |
| AppearanceEmbedding | Visual appearance vectors |
| ScanEvent | Nose/appearance scan attempts |
| IdentificationResult | Match results from scans |
| LostReport | Lost dog reports with status |
| Sighting | Dog sighting reports with location |
| Location | GPS coordinates with address |
| Media | Images and files |
| Comment / Reaction | Social features |
| Notification | Push/email notifications |
| ExternalPost | Scraped posts from social media |

## Safety Rules

1. **READ operations** are always safe to execute immediately.
2. **WRITE operations** (INSERT, UPDATE, DELETE) — always show the SQL to the user and ask for confirmation before executing.
3. **DESTRUCTIVE operations** (DROP, TRUNCATE, `prisma migrate reset`) — warn the user clearly and require explicit confirmation.
4. **Never expose** connection strings, passwords, or API keys in output.
5. When unsure about the project ref, run `supabase projects list` to find it.

## Getting Project Ref

The project is already linked (ref: `fgmdzdghpehrrxhgpctc`). If it ever needs re-linking:
```bash
supabase link --project-ref fgmdzdghpehrrxhgpctc
```
