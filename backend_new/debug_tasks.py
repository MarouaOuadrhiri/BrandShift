import os
import django
import sys

# Add the current directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_new.settings')
django.setup()

from tasks.models import Task
from users.models import User

def debug_tasks():
    tasks = Task.objects.all()
    print(f"Total tasks: {len(tasks)}")
    for t in tasks:
        try:
            eid = str(t.employee.id) if t.employee else "NONE"
            ename = t.employee.username if t.employee else "NONE"
            print(f"Task {t.id}: Employee ID={eid}, Name={ename}")
        except Exception as e:
            print(f"!!! Error in task {t.id}: {str(e)}")
            # Try to see what's in the DB for this task
            print(f"    Raw task data: {t.to_json()}")

if __name__ == "__main__":
    debug_tasks()
