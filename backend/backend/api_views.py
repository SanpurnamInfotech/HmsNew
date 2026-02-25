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
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView




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


from django.contrib.auth.hashers import make_password
from django.db.models import Max
from django.utils import timezone # Use Django's timezone utility
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

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



# class SettingsListView(APIView):
#     authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
#     permission_classes = [permissions.IsAuthenticated]
#     def get(self, request, format=None):
#         settings = Settings.objects.all()
#         serializer = SettingsSerializer(settings, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

# class SettingsDetailView(APIView):
#     authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
#     permission_classes = [permissions.IsAuthenticated]
#     def get(self, request, setting_id, format=None):
#         setting = get_object_or_404(Settings, setting_id=setting_id)
#         serializer = SettingsSerializer(setting)
#         return Response(serializer.data, status=status.HTTP_200_OK)

# class SettingsCreateView(APIView):
#     authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request, format=None):
#         data = request.data.copy()

#         # 1. Clean data: Convert empty strings to None (null) for the database
#         for field in ['module_code', 'submodule_code', 'activity_code']:
#             if data.get(field) == "":
#                 data[field] = None

#         # 2. Duplicate Check with improved logic
#         if Settings.objects.filter(
#             setting_name=data.get('setting_name'),
#             module_code=data.get('module_code'),
#             submodule_code=data.get('submodule_code'),
#             activity_code=data.get('activity_code')
#         ).exists():
#             return Response({"error": "This configuration already exists"}, status=status.HTTP_400_BAD_REQUEST)

#         serializer = SettingsSerializer(data=data)
#         if serializer.is_valid():
#             # 3. Use request.user.id for tracking
#             serializer.save(
#                 createdby=request.user.id,
#                 updatedby=request.user.id,
#                 createdon=timezone.now(),
#                 updatedon=timezone.now()
#             )
#             return Response(serializer.data, status=status.HTTP_201_CREATED)

#         # If serializer fails, it returns why (e.g., "This field is required")
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class SettingsUpdateView(APIView):
#     authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request, setting_id, format=None):
#         setting = get_object_or_404(Settings, setting_id=setting_id)
#         serializer = SettingsSerializer(setting)
#         return Response(serializer.data, status=status.HTTP_200_OK)
#     def put(self, request, setting_id, format=None):
#         setting = get_object_or_404(Settings, setting_id=setting_id)
#         data = request.data.copy()

#         serializer = SettingsSerializer(setting, data=data, partial=True)
#         if serializer.is_valid():
#             serializer.save(
#                 updatedby=request.user.id,
#                 updatedon=timezone.now()
#             )
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class SettingsDeleteView(APIView):
#     authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request, setting_id, format=None):
#         setting = get_object_or_404(Settings, setting_id=setting_id)
#         serializer = SettingsSerializer(setting)
#         return Response(serializer.data, status=status.HTTP_200_OK)
#     def delete(self, request, setting_id, format=None):
#         setting = get_object_or_404(Settings, setting_id=setting_id)
#         setting.delete()
#         return Response({"message": "Setting deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

# Available url

class AvailableURLsView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        
        try:
            routes = SystemRoute.objects.all().order_by('display_name')
            
            url_list = []
            for route in routes:
                url_list.append({
                    "label": route.display_name,
                    "value": f"/{route.react_path.strip('/')}" # Ensures format is '/path'
                })
            
            return Response(url_list, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                        created_by=request.user.id,
                        created_on=timezone.now(),
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
                        updated_by=request.user.id,
                        updated_on=timezone.now()
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
        




# ---------------- LIST ----------------
class IcdMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = IcdMaster.objects.all().order_by('icd_name')
            serializer = IcdMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DETAIL ----------------
class IcdMasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, icd_code):
        try:
            obj = get_object_or_404(IcdMaster, icd_code=icd_code)
            serializer = IcdMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- CREATE ----------------
class IcdMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = IcdMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- UPDATE ----------------
class IcdMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, icd_code):
        try:
            obj = get_object_or_404(IcdMaster, icd_code=icd_code)
            serializer = IcdMasterSerializer(obj, data=request.data, partial=True)

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


# ---------------- DELETE ----------------
class IcdMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, icd_code):
        try:
            obj = get_object_or_404(IcdMaster, icd_code=icd_code)
            obj.delete()
            return Response(
                {"message": "ICD deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



# ---------------- LIST ----------------
class RoomTypeMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = RoomTypeMaster.objects.all().order_by('room_type_name')
            serializer = RoomTypeMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

   # ---------------- DETAIL ----------------
class RoomTypeMasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, room_type_code):
        try:
            obj = get_object_or_404(
                RoomTypeMaster,
                room_type_code=room_type_code
            )
            serializer = RoomTypeMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- CREATE ----------------
class RoomTypeMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = RoomTypeMasterSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- UPDATE ----------------
class RoomTypeMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, room_type_code):
        try:
            obj = get_object_or_404(
                RoomTypeMaster,
                room_type_code=room_type_code
            )

            serializer = RoomTypeMasterSerializer(
                obj,
                data=request.data,
                partial=True
            )

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


# ---------------- DELETE ----------------
class RoomTypeMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, room_type_code):
        try:
            obj = get_object_or_404(
                RoomTypeMaster,
                room_type_code=room_type_code
            )
            obj.delete()

            return Response(
                {"message": "Room type deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ------------------ LIST ------------------
class BedListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = Bed.objects.all().order_by('bed_name')
            serializer = BedSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ------------------ DETAIL ------------------
class BedDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, bed_code):
        try:
            obj = get_object_or_404(Bed, bed_code=bed_code)
            serializer = BedSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ------------------ CREATE ------------------
class BedCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = BedSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ------------------ UPDATE ------------------
class BedUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, bed_code):
        try:
            obj = get_object_or_404(Bed, bed_code=bed_code)

            serializer = BedSerializer(obj, data=request.data, partial=True)

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


# ------------------ DELETE ------------------
class BedDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, bed_code):
        try:
            obj = get_object_or_404(Bed, bed_code=bed_code)
            obj.delete()

            return Response(
                {"message": "Bed deleted successfully"},
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
from django.utils import timezone
from rest_framework.authentication import SessionAuthentication

from .models import HabitMaster
from .serializers import HabitMasterSerializer
from .authentication import CustomJWTAuthentication


# ---------------- LIST ----------------
class HabitMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = HabitMaster.objects.all().order_by('habit_name')
            serializer = HabitMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DETAIL ----------------
class HabitMasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, habit_code):
        try:
            obj = get_object_or_404(HabitMaster, habit_code=habit_code)
            serializer = HabitMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- CREATE ----------------
class HabitMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = HabitMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- UPDATE ----------------
class HabitMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, habit_code):
        try:
            obj = get_object_or_404(HabitMaster, habit_code=habit_code)
            serializer = HabitMasterSerializer(obj, data=request.data, partial=True)

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


# ---------------- DELETE ----------------
class HabitMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, habit_code):
        try:
            obj = get_object_or_404(HabitMaster, habit_code=habit_code)
            obj.delete()
            return Response(
                {"message": "Habit deleted successfully"},
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
from django.utils import timezone
from rest_framework.authentication import SessionAuthentication

from .models import HallucinationMaster
from .serializers import HallucinationMasterSerializer
from .authentication import CustomJWTAuthentication


# hallucination master list
class HallucinationMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = HallucinationMaster.objects.all().order_by("hallucination_name")
            serializer = HallucinationMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# hallucination master detail
class HallucinationMasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, hallucination_code):
        try:
            obj = get_object_or_404(
                HallucinationMaster,
                hallucination_code=hallucination_code
            )
            serializer = HallucinationMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# hallucination master create
class HallucinationMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = HallucinationMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# hallucination master update
class HallucinationMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, hallucination_code):
        try:
            obj = get_object_or_404(
                HallucinationMaster,
                hallucination_code=hallucination_code
            )

            serializer = HallucinationMasterSerializer(
                obj,
                data=request.data,
                partial=True
            )

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


# hallucination master delete
class HallucinationMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, hallucination_code):
        try:
            obj = get_object_or_404(
                HallucinationMaster,
                hallucination_code=hallucination_code
            )
            obj.delete()
            return Response(
                {"message": "Hallucination deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# history master


class HistoryMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = HistoryMaster.objects.all().order_by('history_name')
            serializer = HistoryMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HistoryMasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, history_code):
        try:
            obj = get_object_or_404(HistoryMaster, history_code=history_code)
            serializer = HistoryMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HistoryMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = HistoryMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HistoryMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, history_code):
        try:
            obj = get_object_or_404(HistoryMaster, history_code=history_code)
            serializer = HistoryMasterSerializer(obj, data=request.data, partial=True)

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


class HistoryMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, history_code):
        try:
            obj = get_object_or_404(HistoryMaster, history_code=history_code)
            obj.delete()
            return Response(
                {"message": "History deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )    





# mental illness master

class MentalIllnessMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = MentalIllnessMaster.objects.all().order_by('sort_order')
            serializer = MentalIllnessMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MentalIllnessMasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, mental_illness_code):
        try:
            obj = get_object_or_404(
                MentalIllnessMaster,
                mental_illness_code=mental_illness_code
            )
            serializer = MentalIllnessMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MentalIllnessMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = MentalIllnessMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MentalIllnessMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, mental_illness_code):
        try:
            obj = get_object_or_404(
                MentalIllnessMaster,
                mental_illness_code=mental_illness_code
            )

            serializer = MentalIllnessMasterSerializer(
                obj,
                data=request.data,
                partial=True
            )

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


class MentalIllnessMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, mental_illness_code):
        try:
            obj = get_object_or_404(
                MentalIllnessMaster,
                mental_illness_code=mental_illness_code
            )
            obj.delete()

            return Response(
                {"message": "Mental illness deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )





# ---------------- LIST ----------------
class DsmMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = DsmMaster.objects.all().order_by('dsm_name')
            serializer = DsmMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DETAIL ----------------
class DsmMasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, dsm_code):
        try:
            obj = get_object_or_404(DsmMaster, dsm_code=dsm_code)
            serializer = DsmMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- CREATE ----------------
class DsmMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = DsmMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- UPDATE ----------------
class DsmMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, dsm_code):
        try:
            obj = get_object_or_404(DsmMaster, dsm_code=dsm_code)
            serializer = DsmMasterSerializer(obj, data=request.data, partial=True)

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


# ---------------- DELETE ----------------
class DsmMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, dsm_code):
        try:
            obj = get_object_or_404(DsmMaster, dsm_code=dsm_code)
            obj.delete()
            return Response(
                {"message": "DSM deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




# ---------------- LIST ----------------
class PremorbidPersonalityMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = PremorbidPersonalityMaster.objects.all().order_by(
                'sort_order'
            )
            serializer = PremorbidPersonalityMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- DETAIL ----------------
class PremorbidPersonalityMasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, premorbid_personality_code):
        try:
            obj = get_object_or_404(
                PremorbidPersonalityMaster,
                premorbid_personality_code=premorbid_personality_code
            )
            serializer = PremorbidPersonalityMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- CREATE ----------------
class PremorbidPersonalityMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = PremorbidPersonalityMasterSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data,
                                status=status.HTTP_201_CREATED)

            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- UPDATE ----------------
class PremorbidPersonalityMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, premorbid_personality_code):
        try:
            obj = get_object_or_404(
                PremorbidPersonalityMaster,
                premorbid_personality_code=premorbid_personality_code
            )

            serializer = PremorbidPersonalityMasterSerializer(
                obj, data=request.data, partial=True
            )

            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(serializer.data,
                                status=status.HTTP_200_OK)

            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- DELETE ----------------
class PremorbidPersonalityMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, premorbid_personality_code):
        try:
            obj = get_object_or_404(
                PremorbidPersonalityMaster,
                premorbid_personality_code=premorbid_personality_code
            )
            obj.delete()
            return Response(
                {"message": "Premorbid personality deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PossessionMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = PossessionMaster.objects.all().order_by('sort_order')
            serializer = PossessionMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PossessionMasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, possession_code):
        try:
            obj = get_object_or_404(
                PossessionMaster,
                possession_code=possession_code
            )
            serializer = PossessionMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PossessionMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = PossessionMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PossessionMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, possession_code):
        try:
            obj = get_object_or_404(
                PossessionMaster,
                possession_code=possession_code
            )

            serializer = PossessionMasterSerializer(
                obj,
                data=request.data,
                partial=True
            )

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


class PossessionMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, possession_code):
        try:
            obj = get_object_or_404(
                PossessionMaster,
                possession_code=possession_code
            )
            obj.delete()

            return Response(
                {"message": "Possession deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




# ---------------- LIST ----------------
class FinancialyearMasterListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = FinancialyearMaster.objects.all().order_by('start_year')
            serializer = FinancialyearMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- DETAIL ----------------
class FinancialyearMasterDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, financialyear_code):
        try:
            obj = get_object_or_404(
                FinancialyearMaster,
                financialyear_code=financialyear_code
            )
            serializer = FinancialyearMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- CREATE ----------------
class FinancialyearMasterCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = FinancialyearMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data,
                                status=status.HTTP_201_CREATED)

            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- UPDATE ----------------
class FinancialyearMasterUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, financialyear_code):
        try:
            obj = get_object_or_404(
                FinancialyearMaster,
                financialyear_code=financialyear_code
            )

            serializer = FinancialyearMasterSerializer(
                obj, data=request.data, partial=True
            )

            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(serializer.data,
                                status=status.HTTP_200_OK)

            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- DELETE ----------------
class FinancialyearMasterDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, financialyear_code):
        try:
            obj = get_object_or_404(
                FinancialyearMaster,
                financialyear_code=financialyear_code
            )
            obj.delete()
            return Response(
                {"message": "Financial year deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)        
        
        


# -------------------- LIST --------------------
class SettingsListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = Settings.objects.all().order_by('setting_name')
            serializer = SettingsSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# -------------------- DETAIL --------------------
class SettingsDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, setting_id):
        try:
            obj = get_object_or_404(Settings, setting_id=setting_id)
            serializer = SettingsSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# -------------------- CREATE --------------------
class SettingsCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = SettingsSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# -------------------- UPDATE --------------------
class SettingsUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, setting_id):
        try:
            obj = get_object_or_404(Settings, setting_id=setting_id)
            serializer = SettingsSerializer(obj, data=request.data, partial=True)

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


# -------------------- DELETE --------------------
class SettingsDeleteView(APIView):
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

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Medicine
from .serializers import MedicineSerializer

from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication


# ---------------- LIST ----------------
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication, SessionAuthentication])
@permission_classes([permissions.IsAuthenticated])
def medicine_list(request):
    try:
        data = Medicine.objects.all().order_by('medicine_name')

        serializer = MedicineSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ---------------- CREATE ----------------
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication, SessionAuthentication])
@permission_classes([permissions.IsAuthenticated])
def medicine_create(request):
    try:
        serializer = MedicineSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save(
                createdby=request.user.id,
                updatedby=request.user.id,
                createdon=timezone.now(),
                updatedon=timezone.now()
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ---------------- UPDATE ----------------
@api_view(['PUT'])
@authentication_classes([CustomJWTAuthentication, SessionAuthentication])
@permission_classes([permissions.IsAuthenticated])
def medicine_update(request, medicine_code):
    try:
        obj = get_object_or_404(
            Medicine,
            medicine_code=medicine_code
        )

        serializer = MedicineSerializer(
            obj,
            data=request.data,
            partial=True,
            context={'request': request}
        )

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


# ---------------- DELETE ----------------
@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication, SessionAuthentication])
@permission_classes([permissions.IsAuthenticated])
def medicine_delete(request, medicine_code):
    try:
        obj = get_object_or_404(
            Medicine,
            medicine_code=medicine_code
        )

        obj.delete()

        return Response(
            {"message": "Medicine deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )        
        




from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import MedicineCategory
from .serializers import MedicineCategorySerializer

from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication


# ---------------- LIST ----------------
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication, SessionAuthentication])
@permission_classes([permissions.IsAuthenticated])
def medicine_category_list(request):
    try:
        data = MedicineCategory.objects.all().order_by('medicine_cat_name')

        serializer = MedicineCategorySerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ---------------- CREATE ----------------
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication, SessionAuthentication])
@permission_classes([permissions.IsAuthenticated])
def medicine_category_create(request):
    try:
        serializer = MedicineCategorySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(
                createdby=request.user.id,
                updatedby=request.user.id,
                createdon=timezone.now(),
                updatedon=timezone.now()
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ---------------- UPDATE ----------------
@api_view(['PUT'])
@authentication_classes([CustomJWTAuthentication, SessionAuthentication])
@permission_classes([permissions.IsAuthenticated])
def medicine_category_update(request, medicine_cat_code):
    try:
        obj = get_object_or_404(
            MedicineCategory,
            medicine_cat_code=medicine_cat_code
        )

        serializer = MedicineCategorySerializer(
            obj,
            data=request.data,
            partial=True
        )

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


# ---------------- DELETE ----------------
@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication, SessionAuthentication])
@permission_classes([permissions.IsAuthenticated])
def medicine_category_delete(request, medicine_cat_code):
    try:
        obj = get_object_or_404(
            MedicineCategory,
            medicine_cat_code=medicine_cat_code
        )

        obj.delete()

        return Response(
            {"message": "Medicine category deleted successfully"},
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