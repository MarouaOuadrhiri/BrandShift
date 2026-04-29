from django.urls import path
from .views import CreateMeetingView, ListMeetingsView, UpdateMeetingStatusView

urlpatterns = [
    path('', ListMeetingsView.as_view(), name='meeting-list'),
    path('create/', CreateMeetingView.as_view(), name='meeting-create'),
    path('<str:pk>/status/', UpdateMeetingStatusView.as_view(), name='meeting-status-update'),
]
