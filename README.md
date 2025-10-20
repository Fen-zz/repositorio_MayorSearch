# repositorio_MayorSearch
Triggers:
-- ============================================================
-- 🔹 TRIGGER 1: Actualiza el TSV del recurso cuando se inserta o actualiza
-- ============================================================

CREATE OR REPLACE FUNCTION recurso_tsv_trigger()
RETURNS TRIGGER AS $$
DECLARE
    autores_text TEXT;
BEGIN
    -- Concatenar los nombres de los autores vinculados
    SELECT string_agg(a.nombreautor, ' ')
    INTO autores_text
    FROM recurso_autor ra
    JOIN autor a ON ra.idautor = a.idautor
    WHERE ra.idrecurso = NEW.idrecurso;

    -- Construir el vector de búsqueda
    NEW.tsv :=
        setweight(to_tsvector('spanish', coalesce(NEW.titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(NEW.descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(NEW.contenidotexto, '')), 'C') ||
        setweight(to_tsvector('spanish', coalesce(autores_text, '')), 'D');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tsvectorupdate ON recurso;
CREATE TRIGGER trg_tsvectorupdate
BEFORE INSERT OR UPDATE ON recurso
FOR EACH ROW
EXECUTE FUNCTION recurso_tsv_trigger();


-- ============================================================
-- 🔹 TRIGGER 2: Actualiza el TSV del recurso cuando se crea o cambia una relación recurso_autor
-- ============================================================

CREATE OR REPLACE FUNCTION recurso_autor_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular el tsv del recurso vinculado
    UPDATE recurso
    SET tsv = 
        setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(contenidotexto, '')), 'C') ||
        COALESCE((
            SELECT string_agg(
                to_tsvector('spanish', coalesce(a.nombreautor, ''))::text, ' '
            )::tsvector
            FROM recurso_autor ra
            JOIN autor a ON ra.idautor = a.idautor
            WHERE ra.idrecurso = NEW.idrecurso
        ), ''::tsvector)
    WHERE idrecurso = NEW.idrecurso;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recurso_autor_update_tsv ON recurso_autor;
CREATE TRIGGER trg_recurso_autor_update_tsv
AFTER INSERT OR UPDATE ON recurso_autor
FOR EACH ROW
EXECUTE FUNCTION recurso_autor_update_trigger();


-- ============================================================
-- 🔹 TRIGGER 3: Actualiza los TSV de todos los recursos si cambia un nombre de autor
-- ============================================================

CREATE OR REPLACE FUNCTION autor_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE recurso r
    SET tsv =
        setweight(to_tsvector('spanish', coalesce(r.titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(r.descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(r.contenidotexto, '')), 'C') ||
        COALESCE((
            SELECT string_agg(
                to_tsvector('spanish', coalesce(a.nombreautor, ''))::text, ' '
            )::tsvector
            FROM recurso_autor ra
            JOIN autor a ON ra.idautor = a.idautor
            WHERE ra.idrecurso = r.idrecurso
        ), ''::tsvector)
    WHERE EXISTS (
        SELECT 1 FROM recurso_autor ra WHERE ra.idrecurso = r.idrecurso AND ra.idautor = NEW.idautor
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_autor_update_tsv ON autor;
CREATE TRIGGER trg_autor_update_tsv
AFTER UPDATE ON autor
FOR EACH ROW
EXECUTE FUNCTION autor_update_trigger();


-- ============================================================
-- 🔹 TRIGGER 4: Actualiza el TSV cuando se elimina una relación recurso_autor
-- ============================================================

CREATE OR REPLACE FUNCTION recurso_autor_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular el tsv del recurso afectado al eliminar una relación
    UPDATE recurso
    SET tsv = 
        setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(contenidotexto, '')), 'C') ||
        COALESCE((
            SELECT string_agg(
                to_tsvector('spanish', coalesce(a.nombreautor, ''))::text, ' '
            )::tsvector
            FROM recurso_autor ra
            JOIN autor a ON ra.idautor = a.idautor
            WHERE ra.idrecurso = OLD.idrecurso
        ), ''::tsvector)
    WHERE idrecurso = OLD.idrecurso;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recurso_autor_delete_tsv ON recurso_autor;
CREATE TRIGGER trg_recurso_autor_delete_tsv
AFTER DELETE ON recurso_autor
FOR EACH ROW
EXECUTE FUNCTION recurso_autor_delete_trigger();

# TRIGGERS DE tema Y recurso_tema
-- ============================================================
-- 🔹 TRIGGER 1: Actualiza el TSV del recurso cuando se inserta o actualiza
-- ============================================================

CREATE OR REPLACE FUNCTION recurso_tsv_trigger()
RETURNS TRIGGER AS $$
DECLARE
    autores_text TEXT;
    temas_text TEXT;
BEGIN
    -- Concatenar los nombres de los autores vinculados
    SELECT string_agg(a.nombreautor, ' ')
    INTO autores_text
    FROM recurso_autor ra
    JOIN autor a ON ra.idautor = a.idautor
    WHERE ra.idrecurso = NEW.idrecurso;

    -- Concatenar los nombres de los temas vinculados
    SELECT string_agg(t.nombretema, ' ')
    INTO temas_text
    FROM recurso_tema rt
    JOIN tema t ON rt.idtema = t.idtema
    WHERE rt.idrecurso = NEW.idrecurso;

    -- Construir el vector de búsqueda completo
    NEW.tsv :=
        setweight(to_tsvector('spanish', coalesce(NEW.titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(NEW.descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(NEW.contenidotexto, '')), 'C') ||
        setweight(to_tsvector('spanish', coalesce(autores_text, '')), 'D') ||
        setweight(to_tsvector('spanish', coalesce(temas_text, '')), 'D');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tsvectorupdate ON recurso;
CREATE TRIGGER trg_tsvectorupdate
BEFORE INSERT OR UPDATE ON recurso
FOR EACH ROW
EXECUTE FUNCTION recurso_tsv_trigger();



-- ============================================================
-- 🔹 TRIGGER 2: Actualiza el TSV del recurso cuando se crea o cambia una relación recurso_tema
-- ============================================================

CREATE OR REPLACE FUNCTION recurso_tema_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular el tsv del recurso vinculado
    UPDATE recurso
    SET tsv =
        setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(contenidotexto, '')), 'C') ||
        COALESCE((
            SELECT string_agg(
                to_tsvector('spanish', coalesce(t.nombretema, ''))::text, ' '
            )::tsvector
            FROM recurso_tema rt
            JOIN tema t ON rt.idtema = t.idtema
            WHERE rt.idrecurso = NEW.idrecurso
        ), ''::tsvector)
    WHERE idrecurso = NEW.idrecurso;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recurso_tema_update_tsv ON recurso_tema;
CREATE TRIGGER trg_recurso_tema_update_tsv
AFTER INSERT OR UPDATE ON recurso_tema
FOR EACH ROW
EXECUTE FUNCTION recurso_tema_update_trigger();



-- ============================================================
-- 🔹 TRIGGER 3: Actualiza los TSV de todos los recursos si cambia un nombre de tema
-- ============================================================

CREATE OR REPLACE FUNCTION tema_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE recurso r
    SET tsv =
        setweight(to_tsvector('spanish', coalesce(r.titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(r.descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(r.contenidotexto, '')), 'C') ||
        COALESCE((
            SELECT string_agg(
                to_tsvector('spanish', coalesce(t.nombretema, ''))::text, ' '
            )::tsvector
            FROM recurso_tema rt
            JOIN tema t ON rt.idtema = t.idtema
            WHERE rt.idrecurso = r.idrecurso
        ), ''::tsvector)
    WHERE EXISTS (
        SELECT 1 FROM recurso_tema rt WHERE rt.idrecurso = r.idrecurso AND rt.idtema = NEW.idtema
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tema_update_tsv ON tema;
CREATE TRIGGER trg_tema_update_tsv
AFTER UPDATE ON tema
FOR EACH ROW
EXECUTE FUNCTION tema_update_trigger();



-- ============================================================
-- 🔹 TRIGGER 4: Actualiza el TSV cuando se elimina una relación recurso_tema
-- ============================================================

CREATE OR REPLACE FUNCTION recurso_tema_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular el tsv del recurso afectado al eliminar una relación
    UPDATE recurso
    SET tsv =
        setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(contenidotexto, '')), 'C') ||
        COALESCE((
            SELECT string_agg(
                to_tsvector('spanish', coalesce(t.nombretema, ''))::text, ' '
            )::tsvector
            FROM recurso_tema rt
            JOIN tema t ON rt.idtema = t.idtema
            WHERE rt.idrecurso = OLD.idrecurso
        ), ''::tsvector)
    WHERE idrecurso = OLD.idrecurso;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recurso_tema_delete_tsv ON recurso_tema;
CREATE TRIGGER trg_recurso_tema_delete_tsv
AFTER DELETE ON recurso_tema
FOR EACH ROW
EXECUTE FUNCTION recurso_tema_delete_trigger();


------------------
-- ============================================================
-- 🔹 TRIGGER 2: Actualiza el TSV del recurso cuando se crea o cambia una relación recurso_etiqueta
-- ============================================================
CREATE OR REPLACE FUNCTION recurso_etiqueta_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular el tsv del recurso vinculado
    UPDATE recurso
    SET tsv =
        setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(contenidotexto, '')), 'C') ||
        COALESCE((
            SELECT string_agg(
                to_tsvector('spanish', coalesce(e.nombreetiqueta, ''))::text, ' '
            )::tsvector
            FROM recurso_etiqueta re
            JOIN etiqueta e ON re.idetiqueta = e.idetiqueta
            WHERE re.idrecurso = NEW.idrecurso
        ), ''::tsvector)
    WHERE idrecurso = NEW.idrecurso;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recurso_etiqueta_update_tsv ON recurso_etiqueta;
CREATE TRIGGER trg_recurso_etiqueta_update_tsv
AFTER INSERT OR UPDATE ON recurso_etiqueta
FOR EACH ROW
EXECUTE FUNCTION recurso_etiqueta_update_trigger();


-- ============================================================
-- 🔹 TRIGGER 3: Actualiza los TSV de todos los recursos si cambia un nombre de una etiqueta
-- ============================================================
CREATE OR REPLACE FUNCTION etiqueta_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE recurso r
    SET tsv =
        setweight(to_tsvector('spanish', coalesce(r.titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(r.descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(r.contenidotexto, '')), 'C') ||
        COALESCE((
            SELECT string_agg(
                to_tsvector('spanish', coalesce(e.nombreetiqueta, ''))::text, ' '
            )::tsvector
            FROM recurso_etiqueta re
            JOIN etiqueta e ON re.idetiqueta = e.idetiqueta
            WHERE re.idrecurso = r.idrecurso
        ), ''::tsvector)
    WHERE EXISTS (
        SELECT 1 FROM recurso_etiqueta re WHERE re.idrecurso = r.idrecurso AND re.idetiqueta = NEW.idetiqueta
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_etiqueta_update_tsv ON etiqueta;
CREATE TRIGGER trg_etiqueta_update_tsv
AFTER UPDATE ON etiqueta
FOR EACH ROW
EXECUTE FUNCTION etiqueta_update_trigger();

-- ============================================================
-- 🔹 TRIGGER 4: Actualiza el TSV cuando se elimina una relación recurso_etiqueta
-- ============================================================
CREATE OR REPLACE FUNCTION recurso_etiqueta_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular el tsv del recurso afectado al eliminar una relación
    UPDATE recurso
    SET tsv = 
        setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(contenidotexto, '')), 'C') ||
        COALESCE((
            SELECT string_agg(
                to_tsvector('spanish', coalesce(e.nombreetiqueta, ''))::text, ' '
            )::tsvector
            FROM recurso_etiqueta re
            JOIN etiqueta e ON re.idetiqueta = e.idetiqueta
            WHERE re.idrecurso = OLD.idrecurso
        ), ''::tsvector)
    WHERE idrecurso = OLD.idrecurso;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recurso_etiqueta_delete_tsv ON recurso_etiqueta;
CREATE TRIGGER trg_recurso_etiqueta_delete_tsv
AFTER DELETE ON recurso_etiqueta
FOR EACH ROW
EXECUTE FUNCTION recurso_etiqueta_delete_trigger();


CREATE OR REPLACE FUNCTION recurso_tsv_trigger()
RETURNS TRIGGER AS $$
DECLARE
    autores_text TEXT;
    temas_text TEXT;
    etiquetas_text TEXT;
BEGIN
    -- Concatenar los nombres de los autores vinculados
    SELECT string_agg(a.nombreautor, ' ')
    INTO autores_text
    FROM recurso_autor ra
    JOIN autor a ON ra.idautor = a.idautor
    WHERE ra.idrecurso = NEW.idrecurso;

    -- Concatenar los nombres de los temas vinculados
    SELECT string_agg(t.nombretema, ' ')
    INTO temas_text
    FROM recurso_tema rt
    JOIN tema t ON rt.idtema = t.idtema
    WHERE rt.idrecurso = NEW.idrecurso;

    -- Concatenar los nombres de las etiquetas vinculadas
    SELECT string_agg(e.nombreetiqueta, ' ')
    INTO etiquetas_text
    FROM recurso_etiqueta re
    JOIN etiqueta e ON re.idetiqueta = e.idetiqueta
    WHERE re.idrecurso = NEW.idrecurso;

    -- Construir el vector de búsqueda completo
    NEW.tsv :=
        setweight(to_tsvector('spanish', coalesce(NEW.titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(NEW.descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(NEW.contenidotexto, '')), 'C') ||
        setweight(to_tsvector('spanish', coalesce(autores_text, '')), 'D') ||
        setweight(to_tsvector('spanish', coalesce(temas_text, '')), 'D') ||
        setweight(to_tsvector('spanish', coalesce(etiquetas_text, '')), 'D');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tsvectorupdate ON recurso;
CREATE TRIGGER trg_tsvectorupdate
BEFORE INSERT OR UPDATE ON recurso
FOR EACH ROW
EXECUTE FUNCTION recurso_tsv_trigger();



UPDATE recurso
SET tsv = (
    setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(contenidotexto, '')), 'C') ||
    setweight(
        to_tsvector('spanish', coalesce((
            SELECT string_agg(a.nombreautor, ' ')
            FROM recurso_autor ra
            JOIN autor a ON ra.idautor = a.idautor
            WHERE ra.idrecurso = recurso.idrecurso
        ), '')),
        'D'
    ) ||
    setweight(
        to_tsvector('spanish', coalesce((
            SELECT string_agg(t.nombretema, ' ')
            FROM recurso_tema rt
            JOIN tema t ON rt.idtema = t.idtema
            WHERE rt.idrecurso = recurso.idrecurso
        ), '')),
        'D'
    ) ||
    setweight(
        to_tsvector('spanish', coalesce((
            SELECT string_agg(e.nombreetiqueta, ' ')
            FROM recurso_etiqueta re
            JOIN etiqueta e ON re.idetiqueta = e.idetiqueta
            WHERE re.idrecurso = recurso.idrecurso
        ), '')),
        'D'
    )
);