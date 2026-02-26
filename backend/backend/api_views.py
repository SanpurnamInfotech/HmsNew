from django.shortcuts import render
from django.http import JsonResponse
from .models import *
from .serializers import *
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework import status
from django.shortcuts import get_object_or_404   
from django.http import JsonResponse
# import razorpay
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
import os
from django.core.mail import EmailMessage
from django.db import transaction
from django.conf import settings
from datetime import datetime
import jwt
from .models import Settings
from django.contrib.auth.hashers import check_password, make_password
from django.utils.timezone import now
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status, permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from rest_framework.decorators import api_view
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication
import logging
logger = logging.getLogger(__name__)
import threading
from django.db.models import Max
from django.contrib.auth import authenticate

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from django.contrib.auth.hashers import make_password
from django.db.models import Max
from django.utils import timezone # Use Django's timezone utility
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username

        return token
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token',
        '/api/token/refresh',
    ]

    return Response(routes)


class CredentialsProvidedPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST":
            return False
        username = request.data.get("username")
        password = request.data.get("password")
        return bool(username and password)

from django.contrib.sessions.backends.db import SessionStore
class LoginView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            user = Users.objects.get(username=username, status=1)
        except Users.DoesNotExist:
            return Response(
                {"error": "User not found or inactive"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not check_password(password, user.password):
            return Response(
                {"error": "Invalid password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 🔹 Get usertype_name from UsertypeMaster
        usertype_name = None
        if user.usertype_code:
            try:
                usertype = UsertypeMaster.objects.get(
                    usertype_code=user.usertype_code
                )
                usertype_name = usertype.usertype_name
            except UsertypeMaster.DoesNotExist:
                usertype_name = None

        # 🔹 Save data into session
        request.session['user_id'] = user.user_id
        request.session['username'] = user.username
        request.session['usertype_name'] = usertype_name
        request.session['login_time'] = str(timezone.now())

        request.session.save()

        # 🔹 JWT Token
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "user_id": user.user_id,
            "usertype_name": usertype_name,
        }, status=status.HTTP_200_OK)




class RegisterView(APIView):
    permission_classes = [CredentialsProvidedPermission]

    def post(self, request):
        data = request.data
        username = data.get("username")
        password = data.get("password")

        # 1. Validation
        if not username or not password:
            return Response({"error": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        if Users.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Dynamic ID generation
        max_id = Users.objects.aggregate(Max('user_id'))['user_id__max']
        next_user_id = (max_id or 0) + 1 

        # 3. Dynamic Field Mapping
        create_params = {
            "user_id": next_user_id,
            "status": 1,
            "superuser": 0,
            "createdon": timezone.now(), # Sets the exact creation time
            "lastvisiton": timezone.now(), # Initializes last visit on registration
            # "createdby": request.user.id if request.user.is_authenticated else next_user_id,
        }

        # List of Foreign Key fields (varchar in DB)
        fk_fields = ['company_code', 'usertype_code', 'employee_code']

        for key, value in data.items():
            if value is not None and value != "":
                if key == 'password':
                    create_params['password'] = make_password(value)
                elif key in fk_fields:
                    create_params[f"{key}_id"] = value
                else:
                    create_params[key] = value

        # Handle 'createdby'
        # If a logged-in admin is creating the user, use their ID. 
        # Otherwise, if it's a self-registration, the user is created by themselves.
        if not create_params.get("createdby"):
            create_params["createdby"] = next_user_id

        # 4. Final Creation
        try:
            user = Users.objects.create(**create_params)
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "User registered successfully",
                "user_id": user.user_id,
                "username": user.username,
                "createdon": user.createdon,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": f"Database Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


# Usertype
class UserTypeListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = UsertypeMaster.objects.all().order_by('usertype_name')
            serializer = UsertypeMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UserTypeCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = UsertypeMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UserTypeDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, usertype_code):
        try:
            obj = get_object_or_404(UsertypeMaster, usertype_code=usertype_code)
            serializer = UsertypeMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UserTypeUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, usertype_code):
        try:
            obj = get_object_or_404(UsertypeMaster, usertype_code=usertype_code)
            serializer = UsertypeMasterSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UserTypeDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, usertype_code):
        try:
            obj = get_object_or_404(UsertypeMaster, usertype_code=usertype_code)
            obj.delete()
            return Response(
                {"message": "User Type deleted successfully"}, 
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class SettingsListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, format=None):
        settings = Settings.objects.all()
        serializer = SettingsSerializer(settings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SettingsDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, setting_id, format=None):
        setting = get_object_or_404(Settings, setting_id=setting_id)
        serializer = SettingsSerializer(setting)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SettingsCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        data = request.data.copy()

        # 1. Clean data: Convert empty strings to None (null) for the database
        for field in ['module_code', 'submodule_code', 'activity_code']:
            if data.get(field) == "":
                data[field] = None

        # 2. Duplicate Check with improved logic
        if Settings.objects.filter(
            setting_name=data.get('setting_name'),
            module_code=data.get('module_code'),
            submodule_code=data.get('submodule_code'),
            activity_code=data.get('activity_code')
        ).exists():
            return Response({"error": "This configuration already exists"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SettingsSerializer(data=data)
        if serializer.is_valid():
            # 3. Use request.user.id for tracking
            serializer.save(
                createdby=request.user.id,
                updatedby=request.user.id,
                createdon=timezone.now(),
                updatedon=timezone.now()
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # If serializer fails, it returns why (e.g., "This field is required")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SettingsUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, setting_id, format=None):
        setting = get_object_or_404(Settings, setting_id=setting_id)
        serializer = SettingsSerializer(setting)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def put(self, request, setting_id, format=None):
        setting = get_object_or_404(Settings, setting_id=setting_id)
        data = request.data.copy()

        serializer = SettingsSerializer(setting, data=data, partial=True)
        if serializer.is_valid():
            serializer.save(
                updatedby=request.user.id,
                updatedon=timezone.now()
            )
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SettingsDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, setting_id, format=None):
        setting = get_object_or_404(Settings, setting_id=setting_id)
        serializer = SettingsSerializer(setting)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def delete(self, request, setting_id, format=None):
        setting = get_object_or_404(Settings, setting_id=setting_id)
        setting.delete()
        return Response({"message": "Setting deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

# Available url

class AvailableURLsView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, setting_id):
        try:
            obj = get_object_or_404(Settings, setting_id=setting_id)
            obj.delete()
            return Response(
                {"message": "Setting deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Engine
class EngineModuleCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            with transaction.atomic():
                # 1. Save the Module
                serializer = EngineModuleSerializer(data=request.data)
                if serializer.is_valid():
                    # Save the module and capture the instance
                    module_instance = serializer.save(
                        createdby=request.user.id,
                        createdon=timezone.now(),
                    )
                    
                    # 2. Handle Permissions
                    # We use usertype_code because that is what is defined in your UsertypeMaster model
                    user_types = UsertypeMaster.objects.all()
                    
                    for utype in user_types:
                        u_id = utype.usertype_code
                        
                        read_val = request.data.get(f'readPermission{u_id}', 'No')
                        write_val = request.data.get(f'writePermission{u_id}', 'No')
                        update_val = request.data.get(f'updatePermission{u_id}', 'No')

                        # Use the specific field names required by your Permissions model
                        Permissions.objects.update_or_create(
                            usertype_code=u_id,
                            module_code=module_instance.module_code,
                            submodule_code=None,
                            activity_code=None,
                            defaults={
                                'e_read': read_val,
                                'e_write': write_val,
                                'e_update': update_val,
                            }
                        )

                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            # Printing to console helps you see the exact error if it happens again
            print(f"Error in EngineModuleCreateView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EngineModuleListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Ordered by sequence as requested in previous instructions
            # Removed 'id' because it doesn't exist in EngineModule model
            data = EngineModule.objects.all().order_by('sequence')
            serializer = EngineModuleSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error in EngineModuleListView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EngineModuleUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, module_code):
        try:
            with transaction.atomic():
                obj = get_object_or_404(EngineModule, module_code=module_code)
                serializer = EngineModuleSerializer(obj, data=request.data, partial=True)
                
                if serializer.is_valid():
                    module_instance = serializer.save(
                        updatedby=request.user.id,
                        updatedon=timezone.now()
                    )

                    user_types = UsertypeMaster.objects.all()
                    for utype in user_types:
                        u_id = utype.usertype_code
                        read_val = request.data.get(f'readPermission{u_id}', 'No')
                        write_val = request.data.get(f'writePermission{u_id}', 'No')
                        update_val = request.data.get(f'updatePermission{u_id}', 'No')

                        # update_or_create ensures we don't get 'Duplicate Entry' errors
                        # and by specifying submodule_code/activity_code=None we avoid MultipleObjectsReturned
                        Permissions.objects.update_or_create(
                            module_code=module_instance.module_code,
                            usertype_code=u_id,
                            submodule_code=None,
                            activity_code=None,
                            defaults={
                                'e_read': read_val,
                                'e_write': write_val,
                                'e_update': update_val,
                            }
                        )

                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error in EngineModuleUpdateView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EngineModuleDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, module_code):
        try:
            with transaction.atomic():
                module = get_object_or_404(EngineModule, module_code=module_code)
                # First delete ALL permissions associated with this module
                # including submodules and activities
                Permissions.objects.filter(module_code=module.module_code).delete()
                module.delete()
        
                return Response(
                    {"message": "Engine Module and associated permissions deleted successfully"},
                    status=status.HTTP_200_OK 
                )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EngineModuleDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, module_code, format=None):
        module = get_object_or_404(EngineModule, module_code=module_code)
        serializer = EngineModuleSerializer(module)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Universal Permissions 
class UniversalPermissionsView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Extract filters from the URL query parameters
            m_code = request.query_params.get('module')
            s_code = request.query_params.get('submodule')
            a_code = request.query_params.get('activity')

            # Build the query dynamically
            # We filter for exactly what is provided; missing levels are treated as None (NULL)
            perms = Permissions.objects.filter(
                module_code=m_code,
                submodule_code=s_code,
                activity_code=a_code
            )

            data = {}
            for p in perms:
                u_id = p.usertype_code
                data[f'readPermission{u_id}'] = p.e_read
                data[f'writePermission{u_id}'] = p.e_write
                data[f'updatePermission{u_id}'] = p.e_update
                
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
# Engine Submodule
class EngineSubmoduleCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            serializer = EngineSubmoduleSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
class EngineSubmoduleListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        try:
            data = EngineSubmodule.objects.all().order_by('submodule_code')
            serializer = EngineSubmoduleSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
class EngineSubmoduleDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, submodule_code, format=None):
        module = get_object_or_404(EngineSubmodule, submodule_code=submodule_code)
        serializer = EngineSubmoduleSerializer(module)
 
        return Response(serializer.data, status=status.HTTP_200_OK)
 
class EngineSubmoduleUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def put(self, request, submodule_code):
        try:
            obj = get_object_or_404(EngineSubmodule, submodule_code=submodule_code)
            serializer = EngineSubmoduleSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
class EngineSubmoduleDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, submodule_code):
        try:
            module = get_object_or_404(EngineSubmodule, submodule_code=submodule_code)
            module.delete()
    
            return Response(
                {"message": "Engine Module deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Engine Activity
class EngineActivityCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            serializer = EngineActivitySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
class EngineActivityListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        try:
            data = EngineActivity.objects.all().order_by('activity_code')
            serializer = EngineActivitySerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
class EngineActivityDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, activity_code, format=None):
        module = get_object_or_404(EngineActivity, activity_code=activity_code)
        serializer = EngineActivitySerializer(module)
 
        return Response(serializer.data, status=status.HTTP_200_OK)
 
class EngineActivityUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def put(self, request, activity_code):
        try:
            obj = get_object_or_404(EngineActivity, activity_code=activity_code)
            serializer = EngineActivitySerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
class EngineActivityDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, activity_code):
        try:
            module = get_object_or_404(EngineActivity, activity_code=activity_code)
            module.delete()
    
            return Response(
                {"message": "Engine Module deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# countries

class CountriesListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = Countries.objects.all().order_by('country_name')
            serializer = CountriesSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CountriesCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = CountriesSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CountriesUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, country_code):
        try:
            obj = get_object_or_404(Countries, country_code=country_code)
            serializer = CountriesSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CountriesDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, country_code):
        try:
            obj = get_object_or_404(Countries, country_code=country_code)
            obj.delete()
            return Response(
                {"message": "Country deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
            
# advice master
class AdvicemasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = Advicemaster.objects.all().order_by('advice_name')
            serializer = AdvicemasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdvicemasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, advice_code):
        try:
            # Fetches a single record or returns 404
            obj = get_object_or_404(Advicemaster, advice_code=advice_code)
            serializer = AdvicemasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 
class AdvicemasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = AdvicemasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdvicemasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, advice_code):
        try:
            # Using advice_code (primary key) to find the specific advice
            obj = get_object_or_404(Advicemaster, advice_code=advice_code)
            serializer = AdvicemasterSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdvicemasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, advice_code):
        try:
            obj = get_object_or_404(Advicemaster, advice_code=advice_code)
            obj.delete()
            return Response(
                {"message": "Advice deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        


class IpdRegistrationCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = IpdRegistrationSerializer(data=request.data)
            if serializer.is_valid():

                with transaction.atomic():
                    now = timezone.now()
                    year = now.year

                    last_id = IpdRegistration.objects.aggregate(
                        max_id=Max("id")
                    )["max_id"] or 0

                    ipd_registration_code = f"IPD{last_id + 1:03d}"

                    year_count = (
                        IpdRegistration.objects
                        .filter(admission_date__year=year)
                        .count()
                    ) + 1

                    ipd_number = f"IPD-{year}-{year_count:02d}"

                    # ✅ JWT user id (integer)
                    user_id = request.user.id

                    serializer.save(
                        ipd_registeration_code=ipd_registration_code,
                        ipd_number=ipd_number,
                        created_by=user_id,
                        updated_by=user_id,
                        created_on=now,
                        updated_on=now
                    )

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class IpdRegistrationListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            data = IpdRegistration.objects.all().order_by('-admission_date')
            serializer = IpdRegistrationSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class IpdRegistrationDetailView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request, ipd_registeration_code):
        try:
            obj = get_object_or_404(
                IpdRegistration,
                ipd_registeration_code=ipd_registeration_code
            )
            serializer = IpdRegistrationSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class IpdRegistrationUpdateView(APIView):
    permission_classes = [AllowAny] 

    def put(self, request, ipd_registeration_code):
        try:
            obj = get_object_or_404(
                IpdRegistration,
                ipd_registeration_code=ipd_registeration_code
            )

            serializer = IpdRegistrationSerializer(
                obj,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save(
                    updated_on=timezone.now(),
                    updated_by=request.user.id
                )
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class IpdRegistrationDeleteView(APIView):
    permission_classes = [AllowAny] 

    def delete(self, request, ipd_registeration_code):
        try:
            obj = get_object_or_404(
                IpdRegistration,
                ipd_registeration_code=ipd_registeration_code
            )
            obj.delete()

            return Response(
                {"message": "IPD Registration deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DoctorListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            doctors = Doctor.objects.all().order_by('-doctor_code')
            serializer = DoctorSerializer(doctors, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PatientListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            patients = Patient.objects.all().order_by('-patient_code')
            serializer = PatientSerializer(patients, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class IpdServicesCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = IpdServicesSerializer(data=request.data)

            if serializer.is_valid():
                with transaction.atomic():
                    now = timezone.now()
                    user_id = request.user.id
                    last_service = (
                        IpdServices.objects
                        .exclude(service_id__isnull=True)
                        .order_by("-service_id")
                        .first()
                    )
                    if last_service and last_service.service_id:
                        last_number = int(last_service.service_id.replace("S", ""))
                        new_number = last_number + 1
                    else:
                        new_number = 1
                    service_id = f"S{new_number:02d}"  # S01, S02, S10
                    serializer.save(
                        service_id=service_id,
                        created_on=now,
                        updated_on=now,
                        created_by=user_id,
                        updated_by=user_id
                    )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class IpdServicesListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            data = IpdServices.objects.all().order_by("-created_on")
            serializer = IpdServicesSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
from django.shortcuts import get_object_or_404

class IpdServicesDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, service_id):
        try:
            obj = get_object_or_404(IpdServices, service_id=service_id)
            serializer = IpdServicesSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class IpdServicesUpdateView(APIView):
    permission_classes = [permissions.AllowAny]

    def put(self, request, service_id):
        try:
            obj = get_object_or_404(IpdServices, service_id=service_id)

            serializer = IpdServicesSerializer(
                obj,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save(
                    updated_on=timezone.now(),
                    updated_by=request.user.id
                )
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class IpdServicesDeleteView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, service_id):
        try:
            obj = get_object_or_404(IpdServices, service_id=service_id)
            obj.delete()

            return Response(
                {"message": "IPD Service deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication
from .models import ExpensesMaster
from .serializers import ExpensesMasterSerializer

class ExpensesListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            objs = ExpensesMaster.objects.all().order_by("expenses_code")
            serializer = ExpensesMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExpensesCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = ExpensesMasterSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExpensesUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, expenses_code):
        try:
            obj = get_object_or_404(ExpensesMaster, expenses_code=expenses_code)
            serializer = ExpensesMasterSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExpensesDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, expenses_code):
        try:
            obj = get_object_or_404(ExpensesMaster, expenses_code=expenses_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from .models import MseMaster
from .serializers import MseMasterSerializer


class MseMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            objs = MseMaster.objects.all().order_by('mse_name')
            serializer = MseMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MseMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = MseMasterSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MseMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, mse_code):
        try:
            obj = get_object_or_404(MseMaster, mse_code=mse_code)
            serializer = MseMasterSerializer(obj, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MseMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, mse_code):
        try:
            obj = get_object_or_404(MseMaster, mse_code=mse_code)
            obj.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

        from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.utils import timezone
import traceback

from .models import ThoughtContentMaster
from .serializers import ThoughtContentMasterSerializer
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication


class ThoughtContentListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            objs = ThoughtContentMaster.objects.all().order_by('thought_content_name')
            serializer = ThoughtContentMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = ThoughtContentMasterSerializer(data=request.data, context={'request': request})
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


class ThoughtContentDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, thought_content_code):
        try:
            obj = get_object_or_404(ThoughtContentMaster, thought_content_code=thought_content_code)
            serializer = ThoughtContentMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, thought_content_code):
        try:
            obj = get_object_or_404(ThoughtContentMaster, thought_content_code=thought_content_code)
            serializer = ThoughtContentMasterSerializer(obj, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save(
                    updatedby=getattr(request.user, 'id', None),
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, thought_content_code):
        try:
            obj = get_object_or_404(ThoughtContentMaster, thought_content_code=thought_content_code)
            obj.delete()
            return Response({"message": "Thought content deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import ComplaintMaster
from .serializers import ComplaintMasterSerializer

class ComplaintListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            obj = ComplaintMaster.objects.all().order_by('complaint_name')
            serializer = ComplaintMasterSerializer(obj, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ComplaintCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = ComplaintMasterSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    created_on=timezone.now(),
                    created_by=1,
                    updated_on=timezone.now(),
                    updated_by=1
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ComplaintUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, complaint_code):
        try:
            obj = get_object_or_404(ComplaintMaster, complaint_code=complaint_code)

            serializer = ComplaintMasterSerializer(obj, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save(
                    updated_on=timezone.now(),
                    updated_by=1
                )
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ComplaintDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, complaint_code):
        try:
            obj = get_object_or_404(ComplaintMaster, complaint_code=complaint_code)
            obj.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication
from .models import MoodHistoryMaster
from .serializers import MoodHistoryMasterSerializer
import traceback

class MoodHistoryListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            objs = MoodHistoryMaster.objects.all().order_by("mood_history_code")
            serializer = MoodHistoryMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MoodHistoryCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = MoodHistoryMasterSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MoodHistoryUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, mood_history_code):
        try:
            obj = get_object_or_404(MoodHistoryMaster, mood_history_code=mood_history_code)
            serializer = MoodHistoryMasterSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MoodHistoryDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, mood_history_code):
        try:
            obj = get_object_or_404(MoodHistoryMaster, mood_history_code=mood_history_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)