
-- Allow authenticated users to insert a tenant (onboarding)
CREATE POLICY "Authenticated users can create tenant"
ON public.tenants
FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

-- Allow authenticated users to insert their own user record
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Allow users to insert branding for their tenant
CREATE POLICY "Users can insert tenant branding"
ON public.tenant_branding
FOR INSERT
TO authenticated
WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_user_id = auth.uid()));

-- Allow users to insert settings for their tenant
CREATE POLICY "Users can insert tenant settings"
ON public.tenant_settings
FOR INSERT
TO authenticated
WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_user_id = auth.uid()));

-- Allow users to insert subscription for their tenant
CREATE POLICY "Users can insert subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_user_id = auth.uid()));
