from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.utils import timezone
import traceback

from .models import Noticeboard
from .serializers import NoticeboardSerializer
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication


class NoticeboardListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            objs = Noticeboard.objects.all().order_by('notice_srart_date')
            serializer = NoticeboardSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = NoticeboardSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(
                    createdby=getattr(request.user, 'id', None),
                    createdon=timezone.now(),
                    updatedby=getattr(request.user, 'id', None),
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NoticeboardDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, notice_code):
        try:
            obj = get_object_or_404(Noticeboard, notice_code=notice_code)
            serializer = NoticeboardSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, notice_code):
        try:
            obj = get_object_or_404(Noticeboard, notice_code=notice_code)
            serializer = NoticeboardSerializer(obj, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save(
                    updatedby=getattr(request.user, 'id', None),
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, notice_code):
        try:
            obj = get_object_or_404(Noticeboard, notice_code=notice_code)
            obj.delete()
            return Response({"message": "Notice deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
