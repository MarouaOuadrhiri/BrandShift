from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from projects import views as projects_views


def health(request):
    # Platform health probes (no DB access on purpose).
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('health', health),
    path('api/health', health),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/tasks/', projects_views.unified_task_list_create, name='unified_task_list_create'),
    path('api/tasks/<str:pk>/', projects_views.unified_task_detail_update, name='unified_task_detail_update'),
    path('api/tasks/<str:pk>/status/', projects_views.unified_task_status_update, name='unified_task_status_update'),
    path('api/departments/', include('departments.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/meetings/', include('meetings.urls')),
    path('api/messages/', include('discussions.urls')),
]
