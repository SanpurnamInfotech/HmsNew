import os
import django
import traceback

try:
    # Ensure Django project path is on sys.path so settings module can be imported
    import sys
    project_backend = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
    if project_backend not in sys.path:
        sys.path.insert(0, project_backend)

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SanpurnamEngine.settings')
    django.setup()
    from backend.models import Departments

    if Departments.objects.filter(department_code='DEP00001').exists():
        print('exists')
    else:
        Departments.objects.create(department_code='DEP00001', department_name='Test Dept', financialyear_code='', company_code='', status=1)
        print('created')
except Exception:
    traceback.print_exc()
