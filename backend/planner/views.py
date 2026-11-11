from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Task, DailyRecord
from .serializers import TaskSerializer, DailyRecordSerializer
from django.shortcuts import get_object_or_404

from datetime import date, timedelta
from django.db.models import Sum, Count, Q

class TaskListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.filter(user=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer=TaskSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        task = get_object_or_404(
            Task,
            pk=pk,
            user=request.user
        )

        serializer = TaskSerializer(task)

        return Response(serializer.data)

    def patch(self, request,pk):
        task = get_object_or_404(
            Task,
            pk=pk,
            user=request.user
        )

        serializer = TaskSerializer(instance=task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        task = get_object_or_404(
            Task,
            pk=pk,
            user=request.user
        )

        serializer = TaskSerializer(
            task,
            data=request.data
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        task = get_object_or_404(
            Task,
            pk=pk,
            user=request.user
        )

        task.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

class DailyRecordListCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        selected_date = request.query_params.get("date")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        dailyrecords = DailyRecord.objects.filter(task__user = request.user)

        if selected_date and (start_date or end_date):
            return Response(
                {"error": "Use either date or a date range, not both."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if selected_date:
            try:
                date.fromisoformat(selected_date)
                dailyrecords = dailyrecords.filter(date=selected_date)

            except ValueError:
                 return Response(
                     {"error": "Invalid date format. Use YYYY-MM-DD."},
                     status=status.HTTP_400_BAD_REQUEST
                 )

        if bool(start_date) != bool(end_date):
            return Response(
                {"error": "Both start_date and end_date are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if start_date and end_date:
            try:
                start=date.fromisoformat(start_date)
                end=date.fromisoformat(end_date)
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if start > end:
                return Response(
                    {"error": "start_date cannot be later than end_date."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            dailyrecords = dailyrecords.filter(date__range=[start_date,end_date])

        

       
        serializer = DailyRecordSerializer(dailyrecords, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DailyRecordSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.validated_data['task']

            if task.user != request.user:
                return Response(
                    {"error":"you don't own this task"},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class DailyRecordDetailView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request, pk):
        dailyrecord = get_object_or_404(
            DailyRecord,
            pk=pk,
            task__user=request.user
        )
        serializer=DailyRecordSerializer(dailyrecord)
        return Response(serializer.data)

    def patch(self,request,pk):
        dailyrecord=get_object_or_404(
            DailyRecord,
            pk=pk,
            task__user=request.user
        )
        serializer = DailyRecordSerializer(data=request.data,instance=dailyrecord,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    def put(self,request,pk):
        dailyrecord=get_object_or_404(
            DailyRecord,
            pk=pk,
            task__user=request.user
        )
        serializer = DailyRecordSerializer(data=request.data,instance=dailyrecord)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    def delete(self,request,pk):
        dailyrecord = get_object_or_404(
            DailyRecord,
            pk=pk,
            task__user=request.user
        )
        dailyrecord.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

class WeeklyProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date=request.query_params.get('start_date')
        end_date=request.query_params.get('end_date')

        if not start_date and not end_date:
            today = date.today()
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)

        elif not start_date or not end_date:
            return Response(
                {"error": "Provide both start_date and end_date."},
                status=status.HTTP_400_BAD_REQUEST
            )

        else:

            try:
                start = date.fromisoformat(start_date)
                end = date.fromisoformat(end_date)
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if start > end:
            return Response(
                {"error": "start_date cannot be later than end_date."},
                status=status.HTTP_400_BAD_REQUEST
            )

        dailyrecords = DailyRecord.objects.filter(
            task__user = request.user,
            date__range=[start,end]
        )

        totals = dailyrecords.aggregate(
            total_planned=Sum('planned_minutes'),
            total_actual=Sum('actual_minutes'),
            total_records=Count('id'),
            completed_records=Count(
                'id',
                filter=Q(completed=True)
            )
        )

        completion_percentage = (
            totals['completed_records']/totals['total_records'] * 100
            if totals['total_records'] > 0
            else 0
        )
        return Response({
            "total_planned": totals["total_planned"] or 0,
            "total_actual": totals["total_actual"] or 0,
            "total_records": totals["total_records"],
            "completed_records": totals["completed_records"],
            "completion_percentage": round(completion_percentage, 2)
        })