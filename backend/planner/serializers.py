from rest_framework import serializers
from .models import Task,DailyRecord

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields=['id','name','created_at']
        read_only_fields=['id','created_at']

class DailyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model=DailyRecord
        fields = ['id','date','planned_minutes','actual_minutes','completed','notes','task']
        read_only_fields=['id']
        validators=[]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance is not None:
            self.fields['task'].read_only=True

    def validate(self, attrs):
       task = attrs.get('task', self.instance.task if self.instance else None)
       record_date = attrs.get('date', self.instance.date if self.instance else None)

       if task and record_date:
            existing_record = DailyRecord.objects.filter(task=task, date=record_date)

            if self.instance:
                existing_record=existing_record.exclude(pk=self.instance.pk)

            if existing_record.exists():
                raise serializers.ValidationError({
                    'date':["This task is already scheduled for this date"]
                })
       return attrs

    def to_internal_value(self, data):

        if not data:
            raise serializers.ValidationError({
                 "non_field_errors": ["You must provide at least one field."]
            })
        unknown_fields = set(data.keys())-set(self.fields.keys())

        if unknown_fields:
            raise serializers.ValidationError({
                field:"unknown field."
                for field in unknown_fields
            })

        return super().to_internal_value(data)