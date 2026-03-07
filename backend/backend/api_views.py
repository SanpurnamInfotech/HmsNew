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
from django.db import IntegrityError

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

        # 🔹 Session Management (Backend side storage)
        request.session['user_id'] = user.user_id
        request.session['username'] = user.username
        request.session['usertype_name'] = usertype_name
        request.session['login_time'] = str(timezone.now())
        request.session.save()

        # Update last visit
        user.lastvisiton = timezone.now()
        user.save()

        # 🔹 JWT Token
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "user_id": user.user_id,
            "usertype_name": usertype_name,
            "company_code": user.company_code,
            "employee_code": user.employee_code,
            "status": user.status,
        }, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        data = request.data
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return Response({"error": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        if Users.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        max_id = Users.objects.aggregate(Max('user_id'))['user_id__max']
        next_user_id = (max_id or 0) + 1 

        create_params = {
            "user_id": next_user_id,
            "status": 1,
            "superuser": 0,
            "createdon": timezone.now(),
            "lastvisiton": timezone.now(),
        }

        fk_fields = ['company_code', 'usertype_code', 'employee_code']

        for key, value in data.items():
            if value is not None and value != "":
                if key == 'password':
                    create_params['password'] = make_password(value)
                elif key in fk_fields:
                    create_params[f"{key}_id"] = value
                else:
                    create_params[key] = value

        if not create_params.get("createdby"):
            create_params["createdby"] = next_user_id

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


# Available url

class AvailableURLsView(APIView):


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

    def get(self, request, module_code, format=None):
        module = get_object_or_404(EngineModule, module_code=module_code)
        serializer = EngineModuleSerializer(module)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Universal Permissions 
class UniversalPermissionsView(APIView):


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

    def get(self, request, submodule_code, format=None):
        module = get_object_or_404(EngineSubmodule, submodule_code=submodule_code)
        serializer = EngineSubmoduleSerializer(module)
 
        return Response(serializer.data, status=status.HTTP_200_OK)
 
class EngineSubmoduleUpdateView(APIView):

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

    def get(self, request, activity_code, format=None):
        module = get_object_or_404(EngineActivity, activity_code=activity_code)
        serializer = EngineActivitySerializer(module)
 
        return Response(serializer.data, status=status.HTTP_200_OK)
 
class EngineActivityUpdateView(APIView):

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

# Adhar OTP
import requests

class AadhaarOTPRequestView(APIView):
    # authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        aadhaar_number = request.data.get('aadhaar_number')
        hospital_code = request.data.get('hospital_code')
        patient_code = request.data.get('patient_code') # Optional reference

        # 1. Call Surepass API
        url = "https://sandbox.surepass.io/api/v1/aadhaar-v2/generate-otp"
        headers = {"Authorization": "Bearer YOUR_SUREPASS_TOKEN"}
        payload = {"id_number": aadhaar_number}
        
        response = requests.post(url, json=payload, headers=headers)
        res_json = response.json()

        # 2. Senior Logic: Save to your MySQL table if successful
        if response.status_code == 200 and res_json.get('success'):
            AadhaarVerificationRequest.objects.create(
                client_code=res_json['data']['client_id'], # Store Surepass ID
                patient_code=patient_code,
                hospital_code=hospital_code,
                status='pending',
                createdby=request.user.id # From JWT
            )
        
        return Response(res_json)
        
class AadhaarVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        client_id = request.data.get('client_id') 
        otp = request.data.get('otp')
        
        # 1. Call Surepass API
        url = "https://sandbox.surepass.io/api/v1/aadhaar-v2/submit-otp"
        payload = {"client_id": client_id, "otp": otp}
        headers = {"Authorization": "Bearer YOUR_SUREPASS_TOKEN"}

        response = requests.post(url, json=payload, headers=headers)
        res_json = response.json()

        # 2. Senior Logic: Update your MySQL table based on result
        try:
            log_entry = AadhaarVerificationRequest.objects.get(client_code=client_id)
            if response.status_code == 200 and res_json.get('success'):
                log_entry.status = 'verified'
            else:
                log_entry.status = 'failed'
                log_entry.remark = res_json.get('message', 'OTP Verification Failed')
            
            log_entry.updatedby = request.user.id
            log_entry.save()
        except AadhaarVerificationRequest.DoesNotExist:
            pass # Or log an error that this request wasn't found

        return Response(res_json)
        
# company_master

class CompanyMasterListView(APIView):


    def get(self, request):
        try:
            data = CompanyMaster.objects.all().order_by('company_name')
            serializer = CompanyMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CompanyMasterDetailView(APIView):


    def get(self, request, company_code):
        try:
            obj = get_object_or_404(CompanyMaster, company_code=company_code)
            serializer = CompanyMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CompanyMasterCreateView(APIView):


    def post(self, request):
        try:
            serializer = CompanyMasterSerializer(data=request.data)
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

class CompanyMasterUpdateView(APIView):


    def put(self, request, company_code):
        try:
            obj = get_object_or_404(CompanyMaster, company_code=company_code)
            serializer = CompanyMasterSerializer(obj, data=request.data, partial=True)
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

class CompanyMasterDeleteView(APIView):


    def delete(self, request, company_code):
        try:
            obj = get_object_or_404(CompanyMaster, company_code=company_code)
            obj.delete()
            return Response(
                {"message": "Company deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        
# marital_status_master

class MaritalStatusMasterListView(APIView):


    def get(self, request):
        try:
            data = MaritalStatusMaster.objects.all().order_by('marital_status_name')
            serializer = MaritalStatusMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MaritalStatusMasterDetailView(APIView):


    def get(self, request, marital_status_code):
        try:
            obj = get_object_or_404(MaritalStatusMaster, marital_status_code=marital_status_code)
            serializer = MaritalStatusMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MaritalStatusMasterCreateView(APIView):


    def post(self, request):
        try:
            serializer = MaritalStatusMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MaritalStatusMasterUpdateView(APIView):


    def put(self, request, marital_status_code):
        try:
            obj = get_object_or_404(MaritalStatusMaster, marital_status_code=marital_status_code)
            serializer = MaritalStatusMasterSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MaritalStatusMasterDeleteView(APIView):


    def delete(self, request, marital_status_code):
        try:
            obj = get_object_or_404(MaritalStatusMaster, marital_status_code=marital_status_code)
            obj.delete()
            return Response({"message": "Marital status deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# relation_master

class RelationMasterListView(APIView):


    def get(self, request):
        try:
            data = RelationMaster.objects.all().order_by('relation_name')
            serializer = RelationMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RelationMasterDetailView(APIView):


    def get(self, request, relation_code):
        try:
            obj = get_object_or_404(RelationMaster, relation_code=realtion_code)
            serializer = RelationMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RelationMasterCreateView(APIView):


    def post(self, request):
        try:
            serializer = RelationMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RelationMasterUpdateView(APIView):


    def put(self, request, relation_code):
        try:
            obj = get_object_or_404(RelationMaster, relation_code=relation_code)
            serializer = RelationMasterSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RelationMasterDeleteView(APIView):


    def delete(self, request, relation_code):
        try:
            obj = get_object_or_404(RelationMaster, relation_code=relation_code)
            obj.delete()
            return Response({"message": " Relation deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# blood group master

class BloodGroupMasterListView(APIView):


    def get(self, request):
        try:
            data = BloodGroupMaster.objects.all().order_by("blood_group_name")
            serializer = BloodGroupMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BloodGroupMasterDetailView(APIView):


    def get(self, request, blood_group_code):
        try:
            obj = get_object_or_404(BloodGroupMaster, blood_group_code=blood_group_code)
            serializer = BloodGroupMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BloodGroupMasterCreateView(APIView):


    def post(self, request):
        try:
            serializer = BloodGroupMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                    updatedby=request.user.id,      # ✅ add
                    updatedon=timezone.now(), 
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BloodGroupMasterUpdateView(APIView):


    def put(self, request, blood_group_code):
        try:
            obj = get_object_or_404(BloodGroupMaster, blood_group_code=blood_group_code)
            serializer = BloodGroupMasterSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BloodGroupMasterDeleteView(APIView):


    def delete(self, request, blood_group_code):
        try:
            obj = get_object_or_404(BloodGroupMaster, blood_group_code=blood_group_code)
            obj.delete()
            return Response({"message": "Blood group deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# bankdetails

class BankdetailsListView(APIView):


    def get(self, request):
        try:
            data = Bankdetails.objects.all().order_by("bank_name")
            serializer = BankdetailsSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BankdetailsDetailView(APIView):


    def get(self, request, bank_code):
        try:
            obj = get_object_or_404(Bankdetails, bank_code=bank_code)
            serializer = BankdetailsSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BankdetailsCreateView(APIView):


    def post(self, request):
        try:
            serializer = BankdetailsSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                    updatedby=request.user.id,
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BankdetailsUpdateView(APIView):


    def put(self, request, bank_code):
        try:
            obj = get_object_or_404(Bankdetails, bank_code=bank_code)
            serializer = BankdetailsSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BankdetailsDeleteView(APIView):


    def delete(self, request, bank_code):
        try:
            obj = get_object_or_404(Bankdetails, bank_code=bank_code)
            obj.delete()
            return Response({"message": "Bank deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
        
# bed_allotment

class BedAllotmentListView(APIView):


    def get(self, request):
        try:
            data = BedAllotment.objects.all().order_by("id")
            serializer = BedAllotmentSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BedAllotmentDetailView(APIView):


    def get(self, request, id):
        try:
            obj = get_object_or_404(BedAllotment, id=id)
            serializer = BedAllotmentSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BedAllotmentCreateView(APIView):


    def post(self, request):
        try:
            data = request.data.copy()

            # ✅ convert "" to None so DB accepts NULL
            for k in ["bed_code", "patient_code", "allotment_timestamp", "discharge_timestamp", "sort_order"]:
                if k in data and (data[k] == "" or data[k] is None):
                    data[k] = None

            serializer = BedAllotmentSerializer(data=data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BedAllotmentUpdateView(APIView):


    def put(self, request, id):
        try:
            obj = get_object_or_404(BedAllotment, id=id)
            data = request.data.copy()

            for k in ["bed_code", "patient_code", "allotment_timestamp", "discharge_timestamp", "sort_order"]:
                if k in data and (data[k] == "" or data[k] is None):
                    data[k] = None

            serializer = BedAllotmentSerializer(obj, data=data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BedAllotmentDeleteView(APIView):


    def delete(self, request, id):
        try:
            obj = get_object_or_404(BedAllotment, id=id)
            obj.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# patient
# ---------------- LIST ----------------
class PatientListView(APIView):

    def get(self, request):
        try:
            data = Patient.objects.all().order_by('sort_order')
            serializer = PatientSerializer(data, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DETAIL ----------------
class PatientDetailView(APIView):

    def get(self, request, patient_code):
        try:
            obj = get_object_or_404(
                Patient,
                patient_code=patient_code
            )

            serializer = PatientSerializer(obj)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- CREATE ----------------
class PatientCreateView(APIView):

    def post(self, request):
        try:
            serializer = PatientSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )

                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- UPDATE ----------------
class PatientUpdateView(APIView):

    def put(self, request, patient_code):
        try:
            obj = get_object_or_404(
                Patient,
                patient_code=patient_code
            )

            serializer = PatientSerializer(
                obj,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )

                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DELETE ----------------
class PatientDeleteView(APIView):

    def delete(self, request, patient_code):
        try:
            obj = get_object_or_404(
                Patient,
                patient_code=patient_code
            )

            obj.delete()

            return Response(
                {"message": "Patient deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Opd Bill Master
class OpdBillMasterListView(APIView):
    def get(self, request):
        try:
            data = OpdBillMaster.objects.all().order_by('opd_bill_name')
            serializer = OpdBillMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OpdBillMasterDetailView(APIView):
    def get(self, request, opd_bill_code):
        try:
            obj = get_object_or_404(OpdBillMaster, opd_bill_code=opd_bill_code)
            serializer = OpdBillMasterSerializer(obj)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpdBillMasterCreateView(APIView):
    def post(self, request):
        try:
            serializer = OpdBillMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpdBillMasterUpdateView(APIView):
    def put(self, request, opd_bill_code):
        try:
            obj = get_object_or_404(OpdBillMaster, opd_bill_code=opd_bill_code)
            serializer = OpdBillMasterSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now(),
                )
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpdBillMasterDeleteView(APIView):
    def delete(self, request, opd_bill_code):
        try:
            obj = get_object_or_404(OpdBillMaster, opd_bill_code=opd_bill_code)
            obj.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    


# Opd Billing Details

class OpdBillingDetailsListView(APIView):


    def get(self, request):
        try:
            # ✅ removed 'id' because your model has no id now
            data = OpdBillingDetails.objects.all().order_by('sort_order', 'opd_billing_code', 'opd_bill_code')
            serializer = OpdBillingDetailsSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpdBillingDetailsDetailView(APIView):


    def get(self, request, opd_billing_code):
        try:
            obj = get_object_or_404(OpdBillingDetails, opd_billing_code=opd_billing_code)
            serializer = OpdBillingDetailsSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpdBillingDetailsCreateView(APIView):


    def post(self, request):
        try:
            serializer = OpdBillingDetailsSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpdBillingDetailsUpdateView(APIView):


    def put(self, request, opd_billing_code):
        try:
            obj = get_object_or_404(OpdBillingDetails, opd_billing_code=opd_billing_code)
            serializer = OpdBillingDetailsSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpdBillingDetailsDeleteView(APIView):


    def delete(self, request, opd_billing_code):
        try:
            obj = get_object_or_404(OpdBillingDetails, opd_billing_code=opd_billing_code)
            obj.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Opd Billing
class OpdBillingListView(APIView):

 
    def get(self, request):
        try:
            data = OpdBilling.objects.all().order_by("sort_order", "opd_billing_code")
            serializer = OpdBillingSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 


class OpdBillingDetailView(APIView):


    def get(self, request, opd_billing_code):
        try:
            obj = get_object_or_404(OpdBilling, opd_billing_code=opd_billing_code)
            serializer = OpdBillingSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpdBillingCreateView(APIView):

 
    def post(self, request):
        try:
            serializer = OpdBillingSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
        except IntegrityError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
 
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 

class OpdBillingUpdateView(APIView):


    def put(self, request, opd_billing_code):
        try:
            obj = get_object_or_404(OpdBilling, opd_billing_code=opd_billing_code)
            serializer = OpdBillingSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpdBillingDeleteView(APIView):


    def delete(self, request, opd_billing_code):
        try:
            obj = get_object_or_404(OpdBilling, opd_billing_code=opd_billing_code)
            obj.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        
        serializer = SettingsSerializer(data=request.data)

        if serializer.is_valid():

            with transaction.atomic():

                last_setting = (
                    Settings.objects
                    .select_for_update()
                    .order_by("setting_id")
                    .last()
                )

                if not last_setting:
                    next_id = 1
                else:
                    next_id = last_setting.setting_id + 1

                obj = serializer.save(
                    setting_id=next_id,
                    createdby=request.user.id,
                    createdon=timezone.now()
                )

            return Response(
                SettingsSerializer(obj).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class MoodHistoryListView(APIView):


    def get(self, request):
        try:
            objs = MoodHistoryMaster.objects.all().order_by("mood_history_code")
            serializer = MoodHistoryMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MoodHistoryCreateView(APIView):


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


    def delete(self, request, mood_history_code):
        try:
            obj = get_object_or_404(MoodHistoryMaster, mood_history_code=mood_history_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication
from .models import States
from .serializers import StatesSerializer
import traceback

class StatesListView(APIView):


    def get(self, request):
        try:
            objs = States.objects.all().order_by("state_code")
            serializer = StatesSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StatesCreateView(APIView):


    def post(self, request):
        try:
            serializer = StatesSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StatesUpdateView(APIView):


    def put(self, request, state_code):
        try:
            obj = get_object_or_404(States, state_code=state_code)
            serializer = StatesSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StatesDeleteView(APIView):


    def delete(self, request, state_code):
        try:
            obj = get_object_or_404(States, state_code=state_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication
from django.utils import timezone
from .models import Districts
from .serializers import DistrictsSerializer
import traceback


# ================================
# LIST VIEW
# ================================
class DistrictsListView(APIView):


    def get(self, request):
        try:
            objs = Districts.objects.all().order_by("district_code")
            serializer = DistrictsSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ================================
# CREATE VIEW
# ================================
class DistrictsCreateView(APIView):


    def post(self, request):
        try:
            serializer = DistrictsSerializer(
                data=request.data,
                context={"request": request}
            )

            if serializer.is_valid():
                serializer.save(
                    createdon=timezone.now(),
                    updatedon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ================================
# UPDATE VIEW
# ================================
class DistrictsUpdateView(APIView):


    def put(self, request, district_code):
        try:
            obj = get_object_or_404(
                Districts,
                district_code=district_code
            )

            serializer = DistrictsSerializer(
                obj,
                data=request.data,
                partial=True,
                context={"request": request}
            )

            if serializer.is_valid():
                serializer.save(updatedon=timezone.now())
                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ================================
# DELETE VIEW
# ================================
class DistrictsDeleteView(APIView):


    def delete(self, request, district_code):
        try:
            obj = get_object_or_404(
                Districts,
                district_code=district_code
            )

            obj.delete()

            return Response(
                {"message": "District deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {
                    "error": str(e),
                    "trace": traceback.format_exc()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication
from django.utils import timezone
from .models import Cities
from .serializers import CitiesSerializer
import traceback

class CitiesListView(APIView):

    def get(self, request):
        try:
            objs = Cities.objects.all().order_by("city_code")
            serializer = CitiesSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CitiesCreateView(APIView):

    def post(self, request):
        try:
            serializer = CitiesSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CitiesUpdateView(APIView):

    def put(self, request, city_code):
        try:
            obj = get_object_or_404(Cities, city_code=city_code)
            serializer = CitiesSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save(updatedon=timezone.now())
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CitiesDeleteView(APIView):

    def delete(self, request, city_code):
        try:
            obj = get_object_or_404(Cities, city_code=city_code)
            obj.delete()
            return Response({"message": "City deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        




class IcdMasterListView(APIView):


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

from django.db.models import Max, IntegerField
from django.db.models.functions import Cast
# ------------------ LIST ------------------
class BedListView(APIView):


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
# ------------------ CREATE ------------------

class BedCreateView(APIView):


    def post(self, request):

        serializer = BedSerializer(data=request.data)

        if serializer.is_valid():

            with transaction.atomic():

                last_bed = (
                    Bed.objects
                    .select_for_update()
                    .filter(bed_code__startswith="BED")
                    .order_by("bed_code")
                    .last()
                )

                if not last_bed:
                    next_no = 1
                else:
                    last_no = int(last_bed.bed_code.replace("BED", ""))
                    next_no = last_no + 1

                new_bed_code = f"BED{next_no:05d}"

                obj = serializer.save(
                    bed_code=new_bed_code,
                    createdby=request.user.id,
                    createdon=timezone.now()
                )

            return Response(BedSerializer(obj).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ------------------ UPDATE ------------------
class BedUpdateView(APIView):


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


# ---------------- LIST ----------------
class HabitMasterListView(APIView):


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



# hallucination master list
class HallucinationMasterListView(APIView):


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


    def post(self, request):
        try:
            serializer = PossessionMasterSerializer(
                data=request.data,
                context={"request": request}
            )

            if serializer.is_valid():
                serializer.save(createdon=timezone.now())
                serializer.save(
                    createdon=timezone.now(),
                    createdby=request.user.id
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PossessionMasterUpdateView(APIView):


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
        

# doctor
import traceback
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from backend.models import Doctor
from backend.serializers import DoctorSerializer


# ================= LIST =================
class DoctorListView(APIView):

    def get(self, request):
        doctors = Doctor.objects.all().order_by("doctor_name")
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data)


# ================= DETAILS =================
class DoctorDetailView(APIView):

    def get(self, request, doctor_code):
        doctor = get_object_or_404(Doctor, doctor_code=doctor_code)
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)


# ================= CREATE =================
class DoctorCreateView(APIView):

    def post(self, request):
        try:
            serializer = DoctorSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(createdon=timezone.now())
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e), "trace": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ================= UPDATE =================
class DoctorUpdateView(APIView):

    def put(self, request, doctor_code):
        doctor = get_object_or_404(Doctor, doctor_code=doctor_code)

        serializer = DoctorSerializer(doctor, data=request.data)

        if serializer.is_valid():
            serializer.save(updatedon=timezone.now())
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ================= DELETE =================
class DoctorDeleteView(APIView):


    def delete(self, request, doctor_code):
        doctor = get_object_or_404(Doctor, doctor_code=doctor_code)
        doctor.delete()
        return Response({"message": "Doctor deleted successfully"})

class PossessionMasterUpdateView(APIView):


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
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
 

# -------------------- DELETE --------------------
class SettingsDeleteView(APIView):


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



# financial year

# ---------------- LIST ----------------
class FinancialyearMasterListView(APIView):
    def get(self, request):
        try:
            # Changed 'financialyear_name' to 'financialyear_code' to match your model
            data = FinancialyearMaster.objects.all().order_by('financialyear_code')
            serializer = FinancialyearMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- DETAIL ----------------
class FinancialyearMasterDetailView(APIView):
    def get(self, request, financialyear_code):
        try:
            obj = get_object_or_404(FinancialyearMaster, financialyear_code=financialyear_code)
            serializer = FinancialyearMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            # Note: get_object_or_404 will raise a 404, not a 500. 
            # This catch-all is fine for other unexpected errors.
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- CREATE ----------------
class FinancialyearMasterCreateView(APIView):
    def post(self, request):
        try:
            serializer = FinancialyearMasterSerializer(data=request.data)
            if serializer.is_valid():
                # Handling user ID safely (check if user is authenticated)
                user_id = request.user.id if request.user.is_authenticated else None
                
                serializer.save(
                    createdby=user_id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- UPDATE ----------------
class MedicineUpdateView(APIView):


    def put(self, request, medicine_code):
        try:
            obj = get_object_or_404(
                Medicine,
                medicine_code=medicine_code
            )

            serializer = MedicineSerializer(
                obj,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DELETE ----------------
class MedicineDeleteView(APIView):


    def delete(self, request, medicine_code):
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




# ---------------- LIST ----------------
class MedicineCategoryListView(APIView):


    def get(self, request):
        try:
            data = MedicineCategory.objects.all().order_by('sort_order')
            serializer = MedicineCategorySerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DETAIL ----------------
class MedicineCategoryDetailView(APIView):


    def get(self, request, medicine_cat_code):
        try:
            obj = get_object_or_404(
                MedicineCategory,
                medicine_cat_code=medicine_cat_code
            )

            serializer = MedicineCategorySerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- CREATE ----------------
class MedicineCategoryCreateView(APIView):


    def post(self, request):
        try:
            serializer = MedicineCategorySerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )

                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- UPDATE ----------------
class MedicineCategoryUpdateView(APIView):


    def put(self, request, medicine_cat_code):
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

                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ---------------- LIST ----------------
class MedicineListView(APIView):


    def get(self, request):
        try:
            data = Medicine.objects.all().order_by('sort_order')
            serializer = MedicineSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DETAIL ----------------
class MedicineDetailView(APIView):


    def get(self, request, medicine_code):
        try:
            obj = get_object_or_404(
                Medicine,
                medicine_code=medicine_code
            )
            serializer = MedicineSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- CREATE ----------------
class MedicineCreateView(APIView):


    def post(self, request):
        try:
            serializer = MedicineSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
# ---------------- DELETE ----------------
class MedicineCategoryDeleteView(APIView):


    def delete(self, request, medicine_cat_code):
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
            



class AppointmentTypeMasterListView(APIView):


    def get(self, request):
        try:
            data = AppointmentTypeMaster.objects.all().order_by(
                'appointment_type_name'
            )
            serializer = AppointmentTypeMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DETAIL ----------------
class AppointmentTypeMasterDetailView(APIView):


    def get(self, request, appointment_type_code):
        try:
            obj = get_object_or_404(
                AppointmentTypeMaster,
                appointment_type_code=appointment_type_code
            )
            serializer = AppointmentTypeMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- CREATE ----------------
class AppointmentTypeMasterCreateView(APIView):


    def post(self, request):
        try:
            serializer = AppointmentTypeMasterSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- UPDATE ----------------
class AppointmentTypeMasterUpdateView(APIView):


    def put(self, request, appointment_type_code):
        try:
            obj = get_object_or_404(
                AppointmentTypeMaster,
                appointment_type_code=appointment_type_code
            )

            serializer = AppointmentTypeMasterSerializer(
                obj, data=request.data, partial=True
            )

            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DELETE ----------------
class AppointmentTypeMasterDeleteView(APIView):


    def delete(self, request, appointment_type_code):
        try:
            obj = get_object_or_404(
                AppointmentTypeMaster,
                appointment_type_code=appointment_type_code
            )
            obj.delete()

            return Response(
                {"message": "Appointment type deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )            



class AppointmentListView(APIView):


    def get(self, request):
        try:
            data = Appointment.objects.all().order_by('sort_order')
            serializer = AppointmentSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- DETAIL ----------------
class AppointmentDetailView(APIView):


    def get(self, request, appointment_code):
        try:
            obj = get_object_or_404(
                Appointment,
                appointment_code=appointment_code
            )

            serializer = AppointmentSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------- CREATE ----------------
class AppointmentCreateView(APIView):


    def post(self, request):
        try:
            serializer = AppointmentSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ---------------- UPDATE ----------------
class AppointmentUpdateView(APIView):


    def put(self, request, appointment_code):
        try:
            obj = get_object_or_404(
                Appointment,
                appointment_code=appointment_code
            )

            serializer = AppointmentSerializer(
                obj, data=request.data, partial=True
            )

            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

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


# ---------------- DELETE ----------------
class AppointmentDeleteView(APIView):


    def delete(self, request, appointment_code):
        try:
            obj = get_object_or_404(
                Appointment,
                appointment_code=appointment_code
            )

            obj.delete()

            return Response(
                {"message": "Appointment deleted successfully"},
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




# ---------------- LIST ----------------
class FinancialyearMasterListView(APIView):


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


    def post(self, request):
        serializer = SettingsSerializer(data=request.data)

        if serializer.is_valid():

            with transaction.atomic():

                last_setting = (
                    Settings.objects
                    .select_for_update()
                    .order_by("setting_id")
                    .last()
                )

                if not last_setting:
                    next_id = 1
                else:
                    next_id = last_setting.setting_id + 1

                obj = serializer.save(
                    setting_id=next_id,
                    createdby=request.user.id,
                    createdon=timezone.now()
                )

            return Response(
                SettingsSerializer(obj).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------- UPDATE --------------------
class SettingsUpdateView(APIView):


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
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 


# -------------------- DELETE --------------------
class SettingsDeleteView(APIView):

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
           
           
class EctListView(APIView):


    def get(self, request):
        try:
            data = Medicine.objects.all().order_by('sort_order')
            serializer = MedicineSerializer(data, many=True)
            data = Ect.objects.all().order_by('sort_order')
            serializer = EctSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EctDetailView(APIView):


    def get(self, request, ect_code):
        try:
            obj = get_object_or_404(Ect, ect_code=ect_code)
            serializer = EctSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# CREATE
class EctCreateView(APIView):


    def post(self, request):
        try:
            serializer = MedicineSerializer(data=request.data)

            serializer = EctSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class EctUpdateView(APIView):


    def put(self, request, ect_code):
        try:
            obj = get_object_or_404(Ect, ect_code=ect_code)
            serializer = EctSerializer(obj, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class EctDeleteView(APIView):

    def delete(self, request, ect_code):
        try:
            obj = get_object_or_404(Ect, ect_code=ect_code)

            obj.delete()

            return Response(
                {"message": "Ect deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ---------------- UPDATE ----------------
class FinancialyearMasterUpdateView(APIView):
    def put(self, request, financialyear_code):
        try:
            obj = get_object_or_404(FinancialyearMaster, financialyear_code=financialyear_code)
            serializer = FinancialyearMasterSerializer(obj, data=request.data, partial=True)

            if serializer.is_valid():
                user_id = request.user.id if request.user.is_authenticated else None
                
                serializer.save(
                    updatedby=user_id,
                    updatedon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- DELETE ----------------
class FinancialyearMasterDeleteView(APIView):
    def delete(self, request, financialyear_code):
        try:
            obj = get_object_or_404(FinancialyearMaster, financialyear_code=financialyear_code)
            obj.delete()
            # 204 No Content is standard for successful deletion
            return Response({"message": "Financial year deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -------------------- LIST --------------------
class SettingsListView(APIView):


    def get(self, request):
        try:
            data = MedicineCategory.objects.all().order_by('sort_order')
            serializer = MedicineCategorySerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# -------------------- DETAIL --------------------
class SettingsDetailView(APIView):


    def get(self, request, medicine_cat_code):
        try:
            obj = get_object_or_404(
                MedicineCategory,
                medicine_cat_code=medicine_cat_code
            )

            serializer = MedicineCategorySerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# -------------------- CREATE --------------------

class SettingsCreateView(APIView):


    def post(self, request):
        try:
            serializer = MedicineCategorySerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )

                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


 
 

# -------------------- DELETE --------------------
class SettingsDeleteView(APIView):


    def delete(self, request, medicine_cat_code):
        try:
            obj = get_object_or_404(
                MedicineCategory,
                medicine_cat_code=medicine_cat_code
            )

            obj.delete()

            return Response(
                {"message": "Medicine category deleted successfully"} )


        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
                    
        
# LIST
class FollowUpListView(APIView):

    def get(self, request):
        try:
            data = AppointmentTypeMaster.objects.all().order_by(
                'appointment_type_name'
            )
            serializer = AppointmentTypeMasterSerializer(data, many=True)
            data = FollowUp.objects.all().order_by('sort_order')
            serializer = FollowUpSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# DETAIL
class FollowUpDetailView(APIView):


    def get(self, request, follow_up_code):
        try:
            obj = get_object_or_404(
                FollowUp,
                follow_up_code=follow_up_code
            )
            serializer = FollowUpSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FollowUpCreateView(APIView):

    def post(self, request):
        try:
            serializer = AppointmentTypeMasterSerializer(data=request.data)
            serializer = FollowUpSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# UPDATE
class FollowUpUpdateView(APIView):


    def put(self, request, follow_up_code):
        try:
            obj = get_object_or_404(
                FollowUp,
                follow_up_code=follow_up_code
            )

            serializer = FollowUpSerializer(
                obj,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FollowUpDeleteView(APIView):


    def delete(self, request, follow_up_code):
        try:
            obj = get_object_or_404(
                FollowUp,
                follow_up_code=follow_up_code
            )
            obj.delete()

            return Response(
                {"message": "Appointment type deleted successfully"},
                {"message": "Follow up deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )            




            
class TransactionsListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = Transactions.objects.all().order_by('-transaction_date')
            serializer = TransactionsSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TransactionsDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, transaction_code):
        try:
            obj = get_object_or_404(
                Transactions,
                transaction_code=transaction_code
            )

            serializer = TransactionsSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class TransactionsCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = TransactionsSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



# ---------------- UPDATE ----------------
class TransactionsUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, transaction_code):
        try:
            obj = get_object_or_404(
                Transactions,
                transaction_code=transaction_code
            )

            serializer = TransactionsSerializer(
                obj, data=request.data, partial=True
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



class TransactionsDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, transaction_code):
        try:
            obj = get_object_or_404(
                Transactions,
                transaction_code=transaction_code
            )

            obj.delete()

            return Response(
                {"message": "Appointment deleted successfully"},
                {"message": "Transaction deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )            



# # ---------------- LIST ----------------
# class TransactionsListView(APIView):
#     authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         try:
#             data = Transactions.objects.all().order_by('-transaction_date')
#             serializer = TransactionsSerializer(data, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)


# # ---------------- DETAIL ----------------
# class TransactionsDetailView(APIView):
#     authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request, transaction_code):
#         try:
#             obj = get_object_or_404(
#                 Transactions,
#                 transaction_code=transaction_code
#             )


# # ---------------- CREATE ----------------
# class TransactionsCreateView(APIView):
#     authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request):
#         try:
#             serializer = TransactionsSerializer(data=request.data)

#             if serializer.is_valid():
#                 serializer.save(
#                     createdby=request.user.id,
#                     createdon=timezone.now()
#                 )
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)

#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# # ---------------- UPDATE ----------------
# class TransactionsUpdateView(APIView):
#     authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
#     permission_classes = [permissions.IsAuthenticated]

#     def put(self, request, transaction_code):
#         try:
#             obj = get_object_or_404(
#                 Transactions,
#                 transaction_code=transaction_code
#             )

#             serializer = TransactionsSerializer(
#                 obj, data=request.data, partial=True
#             )

#             if serializer.is_valid():
#                 serializer.save(
#                     updatedby=request.user.id,
#                     updatedon=timezone.now()
#                 )
#                 return Response(serializer.data, status=status.HTTP_200_OK)

#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# # ---------------- DELETE ----------------
# class TransactionsDeleteView(APIView):
#     authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
#     permission_classes = [permissions.IsAuthenticated]

#     def delete(self, request, transaction_code):
#         try:
#             obj = get_object_or_404(
#                 Transactions,
#                 transaction_code=transaction_code
#             )

#             obj.delete()

#             return Response(
#                 {"message": "Transaction deleted successfully"},
#                 status=status.HTTP_204_NO_CONTENT
#             )

#         except Exception as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )            

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication
from .models import Account
from .serializers import AccountSerializer
import traceback

# --- List View ---
class AccountListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            objs = Account.objects.all().order_by("account_code")
            serializer = AccountSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Create View ---
class AccountCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = AccountSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Detail View (Retrieve) ---
class AccountDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, account_code):
        try:
            obj = get_object_or_404(Account, account_code=account_code)
            serializer = AccountSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Update View ---
class AccountUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, account_code):
        try:
            obj = get_object_or_404(Account, account_code=account_code)
            # partial=True allows for PATCH-like updates within a PUT request
            serializer = AccountSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Delete View ---
class AccountDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, account_code):
        try:
            obj = get_object_or_404(Account, account_code=account_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"error": str(e), "trace": traceback.format_exc()}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication
from .models import Doctor
from .serializers import DoctorSerializer
import traceback

# --- List View ---
class DoctorListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Ordering by doctor_code or name as per your preference
            objs = Doctor.objects.all().order_by("doctor_code")
            serializer = DoctorSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Create View ---
class DoctorCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = DoctorSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class DoctorListView(APIView):
#     def get(self, request):
#         try:
#             doctors = Doctor.objects.all().order_by('-doctor_code')
#             serializer = DoctorSerializer(doctors, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# ---------------- DETAIL ----------------
class AppointmentTypeMasterDetailView(APIView):

    def get(self, request, appointment_type_code):
        try:
            obj = get_object_or_404(
                AppointmentTypeMaster,
                appointment_type_code=appointment_type_code
            )
            serializer = AppointmentTypeMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
 
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
 
# ---------------- CREATE ----------------
class AppointmentTypeMasterCreateView(APIView):

 
    def post(self, request):
        try:
            serializer = AppointmentTypeMasterSerializer(data=request.data)
 
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )
 
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
 
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
 
# ---------------- UPDATE ----------------
class AppointmentTypeMasterUpdateView(APIView):

 
    def put(self, request, appointment_type_code):
        try:
            obj = get_object_or_404(
                AppointmentTypeMaster,
                appointment_type_code=appointment_type_code
            )
 
            serializer = AppointmentTypeMasterSerializer(
                obj, data=request.data, partial=True
            )
 
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )
 
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
 
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
 
# ---------------- DELETE ----------------
class AppointmentTypeMasterDeleteView(APIView):

 
    def delete(self, request, appointment_type_code):
        try:
            obj = get_object_or_404(
                AppointmentTypeMaster,
                appointment_type_code=appointment_type_code
            )
            obj.delete()
 
            return Response(
                {"message": "Appointment type deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
 
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )        
 



class AppointmentListView(APIView):


    def get(self, request):
        try:
            data = FinancialyearMaster.objects.all().order_by('start_year')
            serializer = FinancialyearMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- DETAIL ----------------
class AppointmentDetailView(APIView):


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
class AppointmentCreateView(APIView):


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
class AppointmentUpdateView(APIView):


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
class AppointmentDeleteView(APIView):


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


    def get(self, request):
        try:
            data = OpdBilling.objects.all().order_by("sort_order", "opd_billing_code")
            serializer = OpdBillingSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Update View ---
class DoctorUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, doctor_code):
        try:
            obj = get_object_or_404(Doctor, doctor_code=doctor_code)
            # partial=True allows you to update only specific fields
            serializer = DoctorSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Delete View ---
class DoctorDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, doctor_code):
        try:
            obj = get_object_or_404(Doctor, doctor_code=doctor_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"error": str(e), "trace": traceback.format_exc()}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from backend.authentication import CustomJWTAuthentication
from rest_framework.authentication import SessionAuthentication
from .models import HospitalDetails  # Updated name
from .serializers import HospitalDetailsSerializer # Ensure your serializer matches this name
import traceback

# --- List View ---
class HospitalListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            objs = HospitalDetails.objects.all().order_by("hospital_code")
            serializer = HospitalDetailsSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Create View ---
class HospitalCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = HospitalDetailsSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Update View ---
class HospitalUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, hospital_code):
        try:
            obj = get_object_or_404(HospitalDetails, hospital_code=hospital_code)
            serializer = HospitalDetailsSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Delete View ---
class HospitalDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, hospital_code):
        try:
            obj = get_object_or_404(HospitalDetails, hospital_code=hospital_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"error": str(e), "trace": traceback.format_exc()}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# -------------------- DETAIL --------------------
class SettingsDetailView(APIView):


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


    def post(self, request):
        try:
            serializer = OpdBillingSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





# -------------------- UPDATE --------------------
class SettingsUpdateView(APIView):


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


# Main Report View
class PrescriptionReportView(APIView):
    def get(self, request):
        patient_code = request.query_params.get('patientCode')
        date = request.query_params.get('date')
        
        if not patient_code or not date:
            return Response({"error": "Missing patientCode or date"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Fetch the specific prescription record
            header = PrescriptionHeader.objects.filter(
                patient_code=patient_code, 
                prescription_date=date
            ).first()
            
            if not header:
                return Response({"error": "No prescription found for this date"}, status=status.HTTP_404_NOT_FOUND)
            
            # This will now include the dynamic items, doctor, and patient details
            serializer = PrescriptionReportSerializer(header)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Helper for the Date Calendar/Dropdown
class PatientPrescriptionDatesView(APIView):
    def get(self, request, patient_code):
        try:
            # Get unique dates where this patient has a prescription
            dates = PrescriptionHeader.objects.filter(patient_code=patient_code)\
                .values_list('prescription_date', flat=True).distinct().order_by('-prescription_date')
            
            date_list = [d.strftime('%Y-%m-%d') for d in dates if d]
            return Response({"dates": date_list}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# Hospital Details
# ================= LIST =================

class HospitalDetailsListView(APIView):
 
    def get(self, request):

        hospitals = HospitalDetails.objects.all().order_by("hospital_name")

        serializer = HospitalDetailsSerializer(hospitals, many=True)

        return Response(serializer.data)
 
 
# ================= CREATE =================

class HospitalDetailsCreateView(APIView):
 
    def post(self, request):
 
        try:
 
            serializer = HospitalDetailsSerializer(data=request.data)
 
            if serializer.is_valid():
 
                serializer.save(createdon=timezone.now())
 
                return Response(

                    serializer.data,

                    status=status.HTTP_201_CREATED

                )
 
            return Response(

                serializer.errors,

                status=status.HTTP_400_BAD_REQUEST

            )
 
        except Exception as e:
 
            return Response(

                {

                    "error": str(e),

                    "trace": traceback.format_exc()

                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR

            )
 
 
# ================= UPDATE =================

class HospitalDetailsUpdateView(APIView):
 
    def put(self, request, hospital_code):
 
        hospital = get_object_or_404(

            HospitalDetails,

            hospital_code=hospital_code

        )
 
        serializer = HospitalDetailsSerializer(

            hospital,

            data=request.data

        )
 
        if serializer.is_valid():
 
            serializer.save(updatedon=timezone.now())
 
            return Response(serializer.data)
 
        return Response(

            serializer.errors,

            status=status.HTTP_400_BAD_REQUEST

        )
 
 
# ================= DELETE =================

class HospitalDetailsDeleteView(APIView):
 
    def delete(self, request, hospital_code):
 
        hospital = get_object_or_404(

            HospitalDetails,

            hospital_code=hospital_code

        )
 
        hospital.delete()
 
        return Response(

            {"message": "Hospital deleted successfully"}

        )
 
# department
class DepartmentsListView(APIView):
    def get(self, request):
        try:
            # Ordering by department_name for consistent UI presentation
            data = Departments.objects.all().order_by('department_name')
            serializer = DepartmentsSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DepartmentsDetailView(APIView):
    def get(self, request, department_code):
        try:
            obj = get_object_or_404(Departments, department_code=department_code)
            serializer = DepartmentsSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DepartmentsCreateView(APIView):
    def post(self, request):
        try:
            serializer = DepartmentsSerializer(data=request.data)
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

class DepartmentsUpdateView(APIView):
    def put(self, request, department_code):
        try:
            obj = get_object_or_404(Departments, department_code=department_code)
            serializer = DepartmentsSerializer(obj, data=request.data, partial=True)
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

class DepartmentsDeleteView(APIView):
    def delete(self, request, department_code):
        try:
            obj = get_object_or_404(Departments, department_code=department_code)
            obj.delete()
            return Response(
                {"message": "Departments deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# division


class DivisionListView(APIView):
    def get(self, request):
        try:
            data = Division.objects.all().order_by('sort_order', 'division_name')
            serializer = DivisionSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DivisionDetailView(APIView):
    def get(self, request, division_code):
        try:
            obj = get_object_or_404(Division, division_code=division_code)
            serializer = DivisionSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DivisionCreateView(APIView):
    def post(self, request):
        try:
            serializer = DivisionSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    createdby=request.user.id,
                    createdon=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DivisionUpdateView(APIView):
    def put(self, request, division_code):
        try:
            obj = get_object_or_404(Division, division_code=division_code)
            serializer = DivisionSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id,
                    updatedon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DivisionDeleteView(APIView):
    def delete(self, request, division_code):
        try:
            obj = get_object_or_404(Division, division_code=division_code)
            obj.delete()
            return Response({"message": "Division deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# designation

class DesignationListView(APIView):
    def get(self, request):
        try:
            data = Designation.objects.all().order_by('sort_order', 'designation_name')
            serializer = DesignationSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignationDetailView(APIView):
    def get(self, request, designation_code):
        try:
            obj = get_object_or_404(Designation, designation_code=designation_code)
            serializer = DesignationSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignationCreateView(APIView):
    def post(self, request):
        try:
            serializer = DesignationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(createdby=request.user.id, createdon=timezone.now())
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignationUpdateView(APIView):
    def put(self, request, designation_code):
        try:
            obj = get_object_or_404(Designation, designation_code=designation_code)
            serializer = DesignationSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(updatedby=request.user.id, updatedon=timezone.now())
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignationDeleteView(APIView):
    def delete(self, request, designation_code):
        try:
            obj = get_object_or_404(Designation, designation_code=designation_code)
            obj.delete()
            return Response({"message": "Designation deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# usertype

class UsertypeMasterListView(APIView):
    def get(self, request):
        try:
            data = UsertypeMaster.objects.all().order_by('usertype_name')
            serializer = UsertypeMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UsertypeMasterDetailView(APIView):
    def get(self, request, usertype_code):
        try:
            obj = get_object_or_404(UsertypeMaster, usertype_code=usertype_code)
            serializer = UsertypeMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UsertypeMasterCreateView(APIView):
    def post(self, request):
        try:
            serializer = UsertypeMasterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(createdby=request.user.id, createdon=timezone.now())
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UsertypeMasterUpdateView(APIView):
    def put(self, request, usertype_code):
        try:
            obj = get_object_or_404(UsertypeMaster, usertype_code=usertype_code)
            serializer = UsertypeMasterSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(updatedby=request.user.id, updatedon=timezone.now())
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UsertypeMasterDeleteView(APIView):
    def delete(self, request, usertype_code):
        try:
            obj = get_object_or_404(UsertypeMaster, usertype_code=usertype_code)
            obj.delete()
            return Response({"message": "User type deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
# Employee

class EmployeeMasterListView(APIView):
    def get(self, request):
        try:
            # Consistent with your preference: Ordering by name
            data = EmployeeMaster.objects.all().order_by('employee_firstname')
            serializer = EmployeeMasterSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmployeeMasterDetailView(APIView):
    def get(self, request, employee_code):
        try:
            obj = get_object_or_404(EmployeeMaster, employee_code=employee_code)
            serializer = EmployeeMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmployeeMasterCreateView(APIView):
    def post(self, request):
        try:
            serializer = EmployeeMasterSerializer(data=request.data)
            if serializer.is_valid():
                # The 'employee_code' is automatically handled by serializer.create()
                serializer.save(
                    createdby=request.user.id if request.user.is_authenticated else None,
                    createdon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmployeeMasterUpdateView(APIView):
    def put(self, request, employee_code):
        try:
            obj = get_object_or_404(EmployeeMaster, employee_code=employee_code)
            serializer = EmployeeMasterSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updatedby=request.user.id if request.user.is_authenticated else None,
                    updatedon=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmployeeMasterDeleteView(APIView):
    def delete(self, request, employee_code):
        try:
            obj = get_object_or_404(EmployeeMaster, employee_code=employee_code)
            obj.delete()
            return Response({"message": "Employee deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ComplaintListView(APIView):
    
    def get(self, request):
        try:
            objs = ComplaintMaster.objects.all().order_by("sort_order")
            serializer = ComplaintMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class ComplaintCreateView(APIView):
    

    def post(self, request):
        try:
            serializer = ComplaintMasterSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class ComplaintUpdateView(APIView):
    
    def put(self, request, complaint_code):
        try:
            obj = get_object_or_404(ComplaintMaster, complaint_code=complaint_code)
            serializer = ComplaintMasterSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ComplaintDeleteView(APIView):
   

    def delete(self, request, complaint_code):
        try:
            obj = get_object_or_404(ComplaintMaster, complaint_code=complaint_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"error": str(e), "trace": traceback.format_exc()}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MseMasterListView(APIView):
    
    def get(self, request):
        try:
            objs = MseMaster.objects.all().order_by("mse_code")
            serializer = MseMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
       
       
class NoticeListView(APIView):
    

    def get(self, request):
        try:
            objs = Noticeboard.objects.all().order_by("-createdon")
            serializer = NoticeboardSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NoticeCreateView(APIView):
   

    def post(self, request):
        try:
            serializer = NoticeboardSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)         

class NoticeUpdateView(APIView):
    

    def put(self, request, notice_code):
        try:
            obj = get_object_or_404(Noticeboard, notice_code=notice_code)
            serializer = NoticeboardSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NoticeDeleteView(APIView):
    
    def delete(self, request, notice_code):
        try:
            obj = get_object_or_404(Noticeboard, notice_code=notice_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExpensesListView(APIView):
    

    def get(self, request):
        try:
            objs = ExpensesMaster.objects.all().order_by("expenses_code")
            serializer = ExpensesMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExpensesCreateView(APIView):
    

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
   

    def delete(self, request, expenses_code):
        try:
            obj = get_object_or_404(ExpensesMaster, expenses_code=expenses_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"error": str(e), "trace": traceback.format_exc()}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MseMasterCreateView(APIView):
    

    def post(self, request):
        try:
            serializer = MseMasterSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)     
        
class MseMasterUpdateView(APIView):
   

    def put(self, request, mse_code):
        try:
            obj = get_object_or_404(MseMaster, mse_code=mse_code)
            serializer = MseMasterSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class MseMasterDeleteView(APIView):
    

    def delete(self, request, mse_code):
        try:
            obj = get_object_or_404(MseMaster, mse_code=mse_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from .models import ThoughtContentMaster
from .serializers import ThoughtContentMasterSerializer
import traceback

class ThoughtContentListView(APIView):
    
    def get(self, request):
        try:
            objs = ThoughtContentMaster.objects.all().order_by("thought_content_code")
            serializer = ThoughtContentMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ThoughtContentCreateView(APIView):
   
    def post(self, request):
        try:
            serializer = ThoughtContentMasterSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ThoughtContentUpdateView(APIView):
    

    def put(self, request, thought_content_code):
        try:
            obj = get_object_or_404(ThoughtContentMaster, thought_content_code=thought_content_code)
            serializer = ThoughtContentMasterSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ThoughtContentDeleteView(APIView):
  
    def delete(self, request, thought_content_code):
        try:
            obj = get_object_or_404(ThoughtContentMaster, thought_content_code=thought_content_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from .models import TransactionModeMaster
from .serializers import TransactionModeMasterSerializer

class TransactionModeListView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            objs = TransactionModeMaster.objects.all().order_by("sort_order")
            serializer = TransactionModeMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TransactionModeCreateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = TransactionModeMasterSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TransactionModeUpdateView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, transaction_mode_code):
        try:
            obj = get_object_or_404(TransactionModeMaster, transaction_mode_code=transaction_mode_code)
            serializer = TransactionModeMasterSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TransactionModeDeleteView(APIView):
    authentication_classes = [CustomJWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, transaction_mode_code):
        try:
            obj = get_object_or_404(TransactionModeMaster, transaction_mode_code=transaction_mode_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from .models import OpdCasesheet
from .serializers import OpdCasesheetSerializer
import traceback

# --- List View ---
class OpdCasesheetListView(APIView):
   

    def get(self, request):
        try:
            # Ordering by createdon descending to show newest cases first
            objs = OpdCasesheet.objects.all().order_by("-createdon")
            serializer = OpdCasesheetSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Create View ---
class OpdCasesheetCreateView(APIView):
    

    def post(self, request):
        try:
            serializer = OpdCasesheetSerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Detail View ---
class OpdCasesheetDetailView(APIView):
    

    def get(self, request, opd_casesheet_code):
        try:
            obj = get_object_or_404(OpdCasesheet, opd_casesheet_code=opd_casesheet_code)
            serializer = OpdCasesheetSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Update View ---
class OpdCasesheetUpdateView(APIView):
    
    def put(self, request, opd_casesheet_code):
        try:
            obj = get_object_or_404(OpdCasesheet, opd_casesheet_code=opd_casesheet_code)
            # partial=True allows for partial updates (PATCH behavior)
            serializer = OpdCasesheetSerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Delete View ---
class OpdCasesheetDeleteView(APIView):
    
    def delete(self, request, opd_casesheet_code):
        try:
            obj = get_object_or_404(OpdCasesheet, opd_casesheet_code=opd_casesheet_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"error": str(e), "trace": traceback.format_exc()}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from .models import DischargeSummary
from .serializers import DischargeSummarySerializer

class DischargeSummaryListView(APIView):
    
    def get(self, request):
        try:
            # discharge_summary_code ke hisaab se order kiya hai
            objs = DischargeSummary.objects.all().order_by("-createdon")
            serializer = DischargeSummarySerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DischargeSummaryCreateView(APIView):
    
    def post(self, request):
        try:
            serializer = DischargeSummarySerializer(data=request.data, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DischargeSummaryUpdateView(APIView):
  
    def put(self, request, discharge_summary_code):
        try:
            # discharge_summary_code ko lookup field banaya hai
            obj = get_object_or_404(DischargeSummary, discharge_summary_code=discharge_summary_code)
            serializer = DischargeSummarySerializer(obj, data=request.data, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DischargeSummaryDeleteView(APIView):
    
    def delete(self, request, discharge_summary_code):
        try:
            obj = get_object_or_404(DischargeSummary, discharge_summary_code=discharge_summary_code)
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# branch
class BranchListView(APIView):
    def get(self, request):
        try:
            data = Branch.objects.all().order_by('branch_name')
            serializer = BranchSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BranchDetailView(APIView):
    def get(self, request, branch_code):
        try:
            obj = get_object_or_404(Branch, branch_code=branch_code)
            serializer = BranchSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BranchCreateView(APIView):
    def post(self, request):
        try:
            serializer = BranchSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    created_by=request.user.id,
                    created_on=timezone.now(),
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BranchUpdateView(APIView):
    def put(self, request, branch_code):
        try:
            obj = get_object_or_404(Branch, branch_code=branch_code)
            serializer = BranchSerializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    updated_by=request.user.id,
                    updated_on=timezone.now()
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BranchDeleteView(APIView):
    def delete(self, request, branch_code):
        try:
            obj = get_object_or_404(Branch, branch_code=branch_code)
            obj.delete()
            return Response(
                {"message": "Branch deleted successfully"}, 
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# blood donor

class BloodDonorListView(APIView):
    def get(self, request):
        try:
            # Ordering by firstname and lastname for a clean list presentation
            data = BloodDonor.objects.all().order_by('donor_firstname', 'donor_lastname')
            serializer = BloodDonorSerializer(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BloodDonorDetailView(APIView):
    def get(self, request, blood_donor_code):
        try:
            obj = get_object_or_404(BloodDonor, blood_donor_code=blood_donor_code)
            serializer = BloodDonorSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BloodDonorCreateView(APIView):
    def post(self, request):
        try:
            serializer = BloodDonorSerializer(data=request.data)
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

class BloodDonorUpdateView(APIView):
    def put(self, request, blood_donor_code):
        try:
            obj = get_object_or_404(BloodDonor, blood_donor_code=blood_donor_code)
            serializer = BloodDonorSerializer(obj, data=request.data, partial=True)
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

class BloodDonorDeleteView(APIView):
    def delete(self, request, blood_donor_code):
        try:
            obj = get_object_or_404(BloodDonor, blood_donor_code=blood_donor_code)
            obj.delete()
            return Response(
                {"message": "Blood Donor deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )