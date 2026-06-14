CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.can_view_household(_household_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$ SELECT EXISTS(SELECT 1 FROM public.households h WHERE h.id=_household_id AND h.owner_id=auth.uid()) OR EXISTS(SELECT 1 FROM public.household_members hm WHERE hm.household_id=_household_id AND hm.user_id=auth.uid()) $$;
CREATE OR REPLACE FUNCTION private.can_edit_household(_household_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$ SELECT EXISTS(SELECT 1 FROM public.households h WHERE h.id=_household_id AND h.owner_id=auth.uid()) OR EXISTS(SELECT 1 FROM public.household_members hm WHERE hm.household_id=_household_id AND hm.user_id=auth.uid() AND hm.access_level='edit') $$;
REVOKE ALL ON FUNCTION private.can_view_household(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.can_edit_household(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_view_household(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_edit_household(uuid) TO authenticated, service_role;

DROP POLICY "Users view locations" ON public.locations;
DROP POLICY "Users change locations" ON public.locations;
CREATE POLICY "Users view locations" ON public.locations FOR SELECT TO authenticated USING (owner_id=auth.uid() OR (household_id IS NOT NULL AND private.can_view_household(household_id)));
CREATE POLICY "Users change locations" ON public.locations FOR ALL TO authenticated USING (owner_id=auth.uid() OR (household_id IS NOT NULL AND private.can_edit_household(household_id))) WITH CHECK (owner_id=auth.uid() OR (household_id IS NOT NULL AND private.can_edit_household(household_id)));
DROP POLICY "Users view inventory" ON public.inventory_items;
DROP POLICY "Users change inventory" ON public.inventory_items;
CREATE POLICY "Users view inventory" ON public.inventory_items FOR SELECT TO authenticated USING (owner_id=auth.uid() OR (household_id IS NOT NULL AND private.can_view_household(household_id)));
CREATE POLICY "Users change inventory" ON public.inventory_items FOR ALL TO authenticated USING (owner_id=auth.uid() OR (household_id IS NOT NULL AND private.can_edit_household(household_id))) WITH CHECK (owner_id=auth.uid() OR (household_id IS NOT NULL AND private.can_edit_household(household_id)));
DROP POLICY "Users view shopping items" ON public.shopping_list_items;
DROP POLICY "Users change shopping items" ON public.shopping_list_items;
CREATE POLICY "Users view shopping items" ON public.shopping_list_items FOR SELECT TO authenticated USING(owner_id=auth.uid() OR (household_id IS NOT NULL AND private.can_view_household(household_id)));
CREATE POLICY "Users change shopping items" ON public.shopping_list_items FOR ALL TO authenticated USING(owner_id=auth.uid() OR (household_id IS NOT NULL AND private.can_edit_household(household_id))) WITH CHECK(owner_id=auth.uid() OR (household_id IS NOT NULL AND private.can_edit_household(household_id)));

DROP FUNCTION public.can_view_household(uuid);
DROP FUNCTION public.can_edit_household(uuid);