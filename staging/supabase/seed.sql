begin;

insert into public.vaak_companies(id,name) values ('10000000-0000-4000-8000-000000000001','VAAK Demo Company') on conflict (id) do nothing;

insert into public.vaak_projects(id,company_id,code,name,legal_name,tax_id,fiscal_address,installation_date,opening_date) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','PRJ-041','Harbor View Residence','Harbor View Development','20111111111','Dirección ficticia, Lima','2026-09-14','2027-01-18'),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','PRJ-042','Logistics Center','Logistics Development','20222222222','Dirección ficticia, Callao','2026-10-22','2027-03-08'),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','PRJ-043','Residential Complex','Residential Development','20333333333','Dirección ficticia, Lima','2026-01-10','2026-08-22')
on conflict (id) do nothing;

insert into public.vaak_objectives(company_id,project_id,title,status,due_date) values
('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Confirmar tablero de muestras','pending','2026-09-09'),
('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','Revisar lista corta de proveedores','in_progress','2026-09-16');

insert into public.vaak_specs(company_id,project_id,item_code,name,category,vendor,currency,cost,payload) values
('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','RES-200','Kenzie Large Coffee Table','Casegoods','RH Contract','USD',1250,'{"status":"Issued for Review"}'),
('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','LGT-110','Linear Pendant','Lighting','Northline Lighting','USD',480,'{"status":"Budgetary"}')
on conflict (company_id,item_code) do nothing;

commit;
