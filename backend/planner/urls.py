from django.urls import path
from .views import (TaskListCreateView, TaskDetailView, DailyRecordListCreateView,DailyRecordDetailView,WeeklyProgressView)

urlpatterns = [
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<uuid:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('daily-records/', DailyRecordListCreateView.as_view(), name='daily-record'),
    path('daily-records/<uuid:pk>/', DailyRecordDetailView.as_view(), name='daily-record-detail'),
    path('weekly-progress/', WeeklyProgressView.as_view(), name='weekly-progress')
]
