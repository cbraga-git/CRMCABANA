-- Execute inteiro no SQL Editor do Supabase como postgres.
-- Exporte o resultado FINAL como CSV, sem limitar as linhas.
-- Contem dados privados e hashes de senha: nao publicar nem enviar ao Git.
BEGIN ISOLATION LEVEL REPEATABLE READ;
SET LOCAL timezone = 'UTC';
SET LOCAL standard_conforming_strings = on;
CREATE TEMP TABLE cabana_export (seq integer GENERATED ALWAYS AS IDENTITY, sql text) ON COMMIT DROP;
INSERT INTO cabana_export(sql) VALUES ('BEGIN;'), ('SET LOCAL standard_conforming_strings = on;'), ('SET LOCAL timezone = ''UTC'';');

DO $export$
DECLARE
  tables text[] := ARRAY['crm_users','crm_profiles','crm_clients','crm_audit_logs','crm_budget_statuses','crm_presence'];
  prefix text;
  suffix text;
  tab text;
  source_sql text;
  cols text;
  payload jsonb;
  fingerprint text;
  amount bigint;
BEGIN
  FOREACH prefix IN ARRAY ARRAY['crm_financial_','crm_braga_financial_'] LOOP
    FOREACH suffix IN ARRAY ARRAY['accounts','categories','cost_centers','entries','statement_imports','statement_items','reconciliations','budgets'] LOOP
      tables := array_append(tables, prefix || suffix);
    END LOOP;
  END LOOP;

  SELECT string_agg(c.relname, ', ' ORDER BY c.relname) INTO tab
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
      AND left(c.relname, 4) = 'crm_' AND NOT (c.relname = ANY(tables));
  IF tab IS NOT NULL THEN
    RAISE EXCEPTION 'Tabelas CRM adicionais precisam ser avaliadas antes de migrar: %', tab;
  END IF;

  -- Bloqueia todas as tabelas antes de verificar se o destino esta vazio.
  FOREACH tab IN ARRAY tables LOOP
    INSERT INTO cabana_export(sql) VALUES (format('LOCK TABLE public.%I IN ACCESS EXCLUSIVE MODE;', tab));
  END LOOP;
  FOREACH tab IN ARRAY tables LOOP
    IF tab <> 'crm_budget_statuses' THEN
      INSERT INTO cabana_export(sql) VALUES (format(
        'DO $guard$ BEGIN IF EXISTS (SELECT 1 FROM public.%I) THEN RAISE EXCEPTION %L; END IF; END $guard$;',
        tab, 'Destino nao vazio: ' || tab || '. Importacao cancelada; nenhum dado foi substituido.'));
    END IF;
  END LOOP;
  -- Apenas os status iniciais do esquema podem ser substituidos.
  INSERT INTO cabana_export(sql) VALUES ('DELETE FROM public.crm_budget_statuses;');

  FOREACH tab IN ARRAY tables LOOP
    IF tab = 'crm_users' THEN
      source_sql := 'SELECT id,email,encrypted_password AS password_hash,email_confirmed_at,created_at,updated_at FROM auth.users';
      cols := 'id,email,password_hash,email_confirmed_at,created_at,updated_at';
    ELSE
      IF to_regclass('public.' || tab) IS NULL THEN
        RAISE EXCEPTION 'Tabela ausente na origem: %. Confira o esquema antes de migrar.', tab;
      END IF;
      source_sql := format('SELECT * FROM public.%I', tab);
      SELECT string_agg(format('%I', attname), ',' ORDER BY attnum) INTO cols
        FROM pg_attribute WHERE attrelid = to_regclass('public.' || tab)
          AND attnum > 0 AND NOT attisdropped;
    END IF;
    EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(r)), ''[]''::jsonb), count(*), md5(coalesce(string_agg(to_jsonb(r)::text, E''\n'' ORDER BY to_jsonb(r)::text COLLATE "C"), '''')) FROM (%s) r', source_sql)
      INTO payload, amount, fingerprint;

    -- Uma instrucao por tabela permite referencias entre categorias da mesma tabela.
    -- Colunas explicitas fazem diferencas de esquema falharem sem perder campos.
    INSERT INTO cabana_export(sql) VALUES (format(
      'INSERT INTO public.%I (%s) OVERRIDING SYSTEM VALUE SELECT %s FROM jsonb_populate_recordset(NULL::public.%I, %L::jsonb);',
      tab, cols, cols, tab, payload::text));
    INSERT INTO cabana_export(sql) VALUES (format(
      'DO $verify$ BEGIN IF (SELECT count(*) FROM public.%I) <> %s OR (SELECT md5(coalesce(string_agg(to_jsonb(r)::text, E''\n'' ORDER BY to_jsonb(r)::text COLLATE "C"), '''')) FROM (SELECT %s FROM public.%I) r) <> %L THEN RAISE EXCEPTION %L; END IF; END $verify$;',
      tab, amount, cols, tab, fingerprint, 'Conferencia falhou: ' || tab));
  END LOOP;
  INSERT INTO cabana_export(sql) VALUES (
    'SELECT setval(pg_get_serial_sequence(''public.crm_audit_logs'',''id''), coalesce((SELECT max(id) FROM public.crm_audit_logs),1), EXISTS(SELECT 1 FROM public.crm_audit_logs));');
END
$export$;
INSERT INTO cabana_export(sql) VALUES ('COMMIT; -- CABANA_EXPORT_COMPLETO');
-- O total e o checksum permitem detectar CSV incompleto ou texto truncado.
SELECT seq, (SELECT count(*) FROM cabana_export) AS total, sql, md5(sql) AS md5
FROM cabana_export ORDER BY seq;
COMMIT;
