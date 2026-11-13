CREATE TABLE public.construction_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL DEFAULT '',
  site text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'complete')),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.construction_projects TO authenticated;
GRANT ALL ON public.construction_projects TO service_role;
ALTER TABLE public.construction_projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.construction_project_members (
  project_id uuid NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('engineer', 'subcontractor', 'office')),
  assigned_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.construction_project_members TO authenticated;
GRANT ALL ON public.construction_project_members TO service_role;
ALTER TABLE public.construction_project_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.construction_drawings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  drawing_number text NOT NULL,
  title text NOT NULL,
  discipline text NOT NULL DEFAULT 'architectural',
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, drawing_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.construction_drawings TO authenticated;
GRANT ALL ON public.construction_drawings TO service_role;
ALTER TABLE public.construction_drawings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.construction_drawing_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drawing_id uuid NOT NULL REFERENCES public.construction_drawings(id) ON DELETE CASCADE,
  revision text NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_size_bytes bigint NOT NULL DEFAULT 0 CHECK (file_size_bytes >= 0),
  mime_type text NOT NULL DEFAULT 'application/pdf' CHECK (mime_type = 'application/pdf'),
  page_count integer NOT NULL DEFAULT 0 CHECK (page_count >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'changes_requested')),
  annotation_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  calibration_m_per_unit numeric,
  review_note text,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (drawing_id, revision)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.construction_drawing_revisions TO authenticated;
GRANT ALL ON public.construction_drawing_revisions TO service_role;
ALTER TABLE public.construction_drawing_revisions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.construction_drawing_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL REFERENCES public.construction_drawing_revisions(id) ON DELETE CASCADE,
  page_number integer NOT NULL DEFAULT 1 CHECK (page_number > 0),
  anchor_x double precision NOT NULL DEFAULT 0.5 CHECK (anchor_x BETWEEN 0 AND 1),
  anchor_y double precision NOT NULL DEFAULT 0.5 CHECK (anchor_y BETWEEN 0 AND 1),
  assigned_to uuid REFERENCES public.profiles(id),
  body text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  resolved_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.construction_drawing_comments TO authenticated;
GRANT ALL ON public.construction_drawing_comments TO service_role;
ALTER TABLE public.construction_drawing_comments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.construction_review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL REFERENCES public.construction_drawing_revisions(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('submitted', 'approved', 'changes_requested')),
  note text,
  actor_id uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.construction_review_events TO authenticated;
GRANT ALL ON public.construction_review_events TO service_role;
ALTER TABLE public.construction_review_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_access_construction_project(_project_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.construction_project_members m
    WHERE m.project_id = _project_id AND m.user_id = _user_id
  )
$$;
CREATE OR REPLACE FUNCTION public.can_manage_construction_project(_project_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.construction_project_members m
    WHERE m.project_id = _project_id AND m.user_id = _user_id AND m.role IN ('engineer', 'office')
  ) OR EXISTS (
    SELECT 1 FROM public.construction_projects p
    WHERE p.id = _project_id AND private.has_workspace_role(p.workspace_id, _user_id, 'admin')
  )
$$;
CREATE OR REPLACE FUNCTION public.can_upload_construction_drawing(_project_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT public.can_manage_construction_project(_project_id, _user_id)
$$;
CREATE OR REPLACE FUNCTION public.can_review_construction_drawing(_project_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.construction_project_members m
    WHERE m.project_id = _project_id AND m.user_id = _user_id AND m.role = 'office'
  ) OR EXISTS (
    SELECT 1 FROM public.construction_projects p
    WHERE p.id = _project_id AND private.has_workspace_role(p.workspace_id, _user_id, 'admin')
  )
$$;
CREATE OR REPLACE FUNCTION public.can_access_construction_file(_workspace_id uuid, _project_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.construction_projects p
    WHERE p.id = _project_id AND p.workspace_id = _workspace_id
      AND public.can_access_construction_project(p.id, _user_id)
  ) OR EXISTS (
    SELECT 1 FROM public.construction_projects p
    WHERE p.id = _project_id AND p.workspace_id = _workspace_id
      AND private.has_workspace_role(p.workspace_id, _user_id, 'admin')
  )
$$;

CREATE POLICY "Construction projects visible to assigned members" ON public.construction_projects
FOR SELECT TO authenticated USING (public.can_access_construction_project(id, auth.uid()) OR private.has_workspace_role(workspace_id, auth.uid(), 'admin'));
CREATE POLICY "Workspace writers can create construction projects" ON public.construction_projects
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND private.can_write_workspace(workspace_id, auth.uid()));
CREATE POLICY "Construction project managers update projects" ON public.construction_projects
FOR UPDATE TO authenticated USING (public.can_manage_construction_project(id, auth.uid())) WITH CHECK (public.can_manage_construction_project(id, auth.uid()));
CREATE POLICY "Workspace admins delete construction projects" ON public.construction_projects
FOR DELETE TO authenticated USING (private.has_workspace_role(workspace_id, auth.uid(), 'admin'));

CREATE POLICY "Project members can view project assignments" ON public.construction_project_members
FOR SELECT TO authenticated USING (public.can_access_construction_project(project_id, auth.uid()) OR public.can_manage_construction_project(project_id, auth.uid()));
CREATE POLICY "Project managers assign workspace members" ON public.construction_project_members
FOR INSERT TO authenticated WITH CHECK (
  (public.can_manage_construction_project(project_id, auth.uid()) OR EXISTS (SELECT 1 FROM public.construction_projects p WHERE p.id = project_id AND p.created_by = auth.uid()))
  AND EXISTS (SELECT 1 FROM public.construction_projects p JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id WHERE p.id = project_id AND wm.user_id = user_id)
);
CREATE POLICY "Project managers update assignments" ON public.construction_project_members
FOR UPDATE TO authenticated USING (public.can_manage_construction_project(project_id, auth.uid())) WITH CHECK (public.can_manage_construction_project(project_id, auth.uid()));
CREATE POLICY "Project managers remove assignments" ON public.construction_project_members
FOR DELETE TO authenticated USING (public.can_manage_construction_project(project_id, auth.uid()));

CREATE POLICY "Assigned team can view drawings" ON public.construction_drawings
FOR SELECT TO authenticated USING (public.can_access_construction_project(project_id, auth.uid()) OR public.can_manage_construction_project(project_id, auth.uid()));
CREATE POLICY "Engineers and office create drawings" ON public.construction_drawings
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND public.can_upload_construction_drawing(project_id, auth.uid()));
CREATE POLICY "Engineers and office update drawings" ON public.construction_drawings
FOR UPDATE TO authenticated USING (public.can_upload_construction_drawing(project_id, auth.uid())) WITH CHECK (public.can_upload_construction_drawing(project_id, auth.uid()));
CREATE POLICY "Project managers delete drawings" ON public.construction_drawings
FOR DELETE TO authenticated USING (public.can_manage_construction_project(project_id, auth.uid()));

CREATE POLICY "Assigned team can view drawing revisions" ON public.construction_drawing_revisions
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.construction_drawings d WHERE d.id = drawing_id AND (public.can_access_construction_project(d.project_id, auth.uid()) OR public.can_manage_construction_project(d.project_id, auth.uid()))));
CREATE POLICY "Engineers and office create drawing revisions" ON public.construction_drawing_revisions
FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.construction_drawings d WHERE d.id = drawing_id AND public.can_upload_construction_drawing(d.project_id, auth.uid())));
CREATE POLICY "Project team updates revisions" ON public.construction_drawing_revisions
FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.construction_drawings d WHERE d.id = drawing_id AND (public.can_upload_construction_drawing(d.project_id, auth.uid()) OR public.can_review_construction_drawing(d.project_id, auth.uid())))) WITH CHECK (EXISTS (SELECT 1 FROM public.construction_drawings d WHERE d.id = drawing_id AND (public.can_upload_construction_drawing(d.project_id, auth.uid()) OR public.can_review_construction_drawing(d.project_id, auth.uid()))));
CREATE POLICY "Project managers delete revisions" ON public.construction_drawing_revisions
FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.construction_drawings d WHERE d.id = drawing_id AND public.can_manage_construction_project(d.project_id, auth.uid())));

CREATE POLICY "Assigned team can view drawing comments" ON public.construction_drawing_comments
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.construction_drawing_revisions r JOIN public.construction_drawings d ON d.id = r.drawing_id WHERE r.id = revision_id AND (public.can_access_construction_project(d.project_id, auth.uid()) OR public.can_manage_construction_project(d.project_id, auth.uid()))));
CREATE POLICY "Assigned team can comment on drawings" ON public.construction_drawing_comments
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND EXISTS (SELECT 1 FROM public.construction_drawing_revisions r JOIN public.construction_drawings d ON d.id = r.drawing_id WHERE r.id = revision_id AND (public.can_access_construction_project(d.project_id, auth.uid()) OR public.can_manage_construction_project(d.project_id, auth.uid()))));
CREATE POLICY "Comment author or project manager updates comment" ON public.construction_drawing_comments
FOR UPDATE TO authenticated USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.construction_drawing_revisions r JOIN public.construction_drawings d ON d.id = r.drawing_id WHERE r.id = revision_id AND public.can_manage_construction_project(d.project_id, auth.uid()))) WITH CHECK (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.construction_drawing_revisions r JOIN public.construction_drawings d ON d.id = r.drawing_id WHERE r.id = revision_id AND public.can_manage_construction_project(d.project_id, auth.uid())));
CREATE POLICY "Project managers delete comments" ON public.construction_drawing_comments
FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.construction_drawing_revisions r JOIN public.construction_drawings d ON d.id = r.drawing_id WHERE r.id = revision_id AND public.can_manage_construction_project(d.project_id, auth.uid())));

CREATE POLICY "Assigned team can view review history" ON public.construction_review_events
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.construction_drawing_revisions r JOIN public.construction_drawings d ON d.id = r.drawing_id WHERE r.id = revision_id AND (public.can_access_construction_project(d.project_id, auth.uid()) OR public.can_manage_construction_project(d.project_id, auth.uid()))));
CREATE POLICY "Project team can record review events" ON public.construction_review_events
FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.construction_drawing_revisions r JOIN public.construction_drawings d ON d.id = r.drawing_id WHERE r.id = revision_id AND (public.can_upload_construction_drawing(d.project_id, auth.uid()) OR public.can_review_construction_drawing(d.project_id, auth.uid()))));

CREATE OR REPLACE FUNCTION public.protect_construction_comment_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE project_id uuid;
BEGIN
  SELECT d.project_id INTO project_id
  FROM public.construction_drawing_revisions r JOIN public.construction_drawings d ON d.id = r.drawing_id
  WHERE r.id = OLD.revision_id;
  IF auth.uid() IS NULL OR (OLD.created_by <> auth.uid() AND NOT public.can_manage_construction_project(project_id, auth.uid())) THEN
    RAISE EXCEPTION 'Only the author or project managers can update this note';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT public.can_manage_construction_project(project_id, auth.uid()) THEN
    RAISE EXCEPTION 'Only project engineers or office reviewers can resolve notes';
  END IF;
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND NOT public.can_manage_construction_project(project_id, auth.uid()) THEN
    RAISE EXCEPTION 'Only project managers can assign notes';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_construction_comment_update BEFORE UPDATE ON public.construction_drawing_comments FOR EACH ROW EXECUTE FUNCTION public.protect_construction_comment_update();

CREATE OR REPLACE FUNCTION public.log_construction_review_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE project_id uuid;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT d.project_id INTO project_id FROM public.construction_drawings d WHERE d.id = NEW.drawing_id;
    IF NEW.status IN ('approved', 'changes_requested') AND NOT public.can_review_construction_drawing(project_id, auth.uid()) THEN
      RAISE EXCEPTION 'Only office reviewers can approve drawings or request changes';
    END IF;
    IF NEW.status = 'in_review' AND NOT public.can_upload_construction_drawing(project_id, auth.uid()) THEN
      RAISE EXCEPTION 'Only engineers or office reviewers can submit a drawing for review';
    END IF;
    IF NEW.status IN ('approved', 'changes_requested') THEN
      NEW.approved_by := CASE WHEN NEW.status = 'approved' THEN auth.uid() ELSE NULL END;
      NEW.approved_at := CASE WHEN NEW.status = 'approved' THEN now() ELSE NULL END;
      INSERT INTO public.construction_review_events (revision_id, action, note, actor_id)
      VALUES (NEW.id, NEW.status, NEW.review_note, auth.uid());
    ELSIF NEW.status = 'in_review' THEN
      INSERT INTO public.construction_review_events (revision_id, action, note, actor_id)
      VALUES (NEW.id, 'submitted', NEW.review_note, auth.uid());
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER log_construction_review_status BEFORE UPDATE OF status ON public.construction_drawing_revisions FOR EACH ROW EXECUTE FUNCTION public.log_construction_review_status();

CREATE POLICY "Assigned team reads private construction PDFs" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'construction-pdfs' AND public.can_access_construction_file(
    NULLIF(split_part(name, '/', 1), '')::uuid,
    NULLIF(split_part(name, '/', 2), '')::uuid,
    auth.uid()
  )
);
CREATE POLICY "Engineers and office upload private construction PDFs" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'construction-pdfs' AND public.can_access_construction_file(
    NULLIF(split_part(name, '/', 1), '')::uuid,
    NULLIF(split_part(name, '/', 2), '')::uuid,
    auth.uid()
  ) AND public.can_upload_construction_drawing(NULLIF(split_part(name, '/', 2), '')::uuid, auth.uid())
);
