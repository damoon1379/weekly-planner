from django.db import models
from django.conf import settings
import uuid
# Create your models here.

class Task(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tasks'
    )

    name = models.CharField(max_length=200)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class DailyRecord(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='daily_record'
        )
    
    date=models.DateField()

    planned_minutes = models.PositiveIntegerField()

    actual_minutes = models.PositiveIntegerField(default=0)

    completed = models.BooleanField(default=False)

    notes = models.TextField(blank=True)

    class Meta:
        constraints=[
            models.UniqueConstraint(
                fields=['task','date'],
                name="unique_task_per_day"
            )
        ]

    def __str__(self):
        return f"{self.task.name}-{self.date}"
    
