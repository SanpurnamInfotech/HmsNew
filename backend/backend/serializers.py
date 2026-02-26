from .models import *
from rest_framework import serializers
from django.db import transaction
from django.contrib.auth.hashers import make_password 

from django.db.models import Max
class UserRegisterSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Users
        fields = ['username', 'password', 'email', 'user_id']

    def create(self, validated_data):
        # Calculate next user_id
        max_id = Users.objects.aggregate(Max('user_id'))['user_id__max']
        validated_data['user_id'] = (max_id or 0) + 1
        
        # Hash password and set status
        validated_data['password'] = make_password(validated_data['password'])
        validated_data['status'] = 1
        
        return super().create(validated_data)
    
class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'  

class UsertypeMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsertypeMaster
        fields = '__all__'  

class PermissionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permissions
        fields = '__all__'  
        
class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = '__all__'  
        
class EngineModuleSerializer(serializers.ModelSerializer):  
    class Meta:
        model = EngineModule
        fields = "__all__"

class EngineSubmoduleSerializer(serializers.ModelSerializer):  
    class Meta:
        model = EngineSubmodule
        fields = "__all__"

class EngineActivitySerializer(serializers.ModelSerializer):  
    class Meta:
        model = EngineActivity
        fields = "__all__"
        

class CountriesSerializer(serializers.ModelSerializer):
    createdon = serializers.DateTimeField(format="%d-%m-%Y %H:%M:%S", read_only=True)
    updatedon = serializers.DateTimeField(format="%d-%m-%Y %H:%M:%S", read_only=True)
    class Meta:
        model = Countries
        fields = [
            'id', 
            'country_code', 
            'country_name', 
            'createdon', 
            'createdby', 
            'updatedon', 
            'updatedby'
        ]
        read_only_fields = ['id', 'createdby', 'updatedby']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id
        return super().create(validated_data)
    
class AdvicemasterSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Advicemaster
        fields = "__all__"
        



# class StatesSerializer(serializers.ModelSerializer):
#     country_code = serializers.SlugRelatedField(slug_field='country_code', queryset=Countries.objects.all())
#     class Meta:
#         model = States
#         fields = '__all__'
#         read_only_fields = (
#             'createdon',
#             'createdby',
#             'updatedon',
#             'updatedby',
#         )

#     def create(self, validated_data):
#         from django.utils import timezone
#         request = self.context.get('request')
#         validated_data['createdon'] = timezone.now()
#         validated_data['updatedon'] = timezone.now()
#         if request and hasattr(request, 'user'):
#             validated_data['createdby'] = request.user.id
#             validated_data['updatedby'] = request.user.id
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         from django.utils import timezone
#         request = self.context.get('request')
#         validated_data['updatedon'] = timezone.now()
#         if request and hasattr(request, 'user'):
#             validated_data['updatedby'] = request.user.id
#         return super().update(instance, validated_data)

# from rest_framework import serializers
# from .models import Cities, Countries, States


# class CitiesSerializer(serializers.ModelSerializer):

#     district_code = serializers.SlugRelatedField(
#         slug_field='district_code',
#         queryset=Districts.objects.all()
#     )

#     class Meta:
#         model = Cities
#         fields = '__all__'
#         read_only_fields = (
#             'createdon',
#             'createdby',
#             'updatedon',
#             'updatedby',
#         )

#     def create(self, validated_data):
#         from django.utils import timezone
#         request = self.context.get('request')
#         validated_data['createdon'] = timezone.now()
#         validated_data['updatedon'] = timezone.now()
#         if request and hasattr(request, 'user'):
#             validated_data['createdby'] = request.user.id
#             validated_data['updatedby'] = request.user.id
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         from django.utils import timezone
#         request = self.context.get('request')
#         validated_data['updatedon'] = timezone.now()
#         if request and hasattr(request, 'user'):
#             validated_data['updatedby'] = request.user.id
#         return super().update(instance, validated_data)

# from .models import Districts


# class DistrictsSerializer(serializers.ModelSerializer):

#     state_code = serializers.SlugRelatedField(
#         slug_field='state_code',
#         queryset=States.objects.all()
#     )

#     class Meta:
#         model = Districts
#         fields = '__all__'
#         read_only_fields = (
#             'createdon',
#             'createdby',
#             'updatedon',
#             'updatedby',
#         )

#     def create(self, validated_data):
#         from django.utils import timezone
#         request = self.context.get('request')
#         validated_data['createdon'] = timezone.now()
#         validated_data['updatedon'] = timezone.now()
#         if request and hasattr(request, 'user'):
#             validated_data['createdby'] = request.user.id
#             validated_data['updatedby'] = request.user.id
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         from django.utils import timezone
#         request = self.context.get('request')
#         validated_data['updatedon'] = timezone.now()
#         if request and hasattr(request, 'user'):
#             validated_data['updatedby'] = request.user.id
#         return super().update(instance, validated_data)

# class UsertypeMasterSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = UsertypeMaster
#         fields = '__all__'
#         read_only_fields = (
#             'createdon',
#             'createdby',
#             'updatedon',
#             'updatedby',
#         )

class AccountSerializer(serializers.ModelSerializer):

    bank_code = serializers.SlugRelatedField(
        slug_field='bank_code',
        queryset=Bankdetails.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Account
        fields = '__all__'
        read_only_fields = (
            'createdon',
            'createdby',
            'updatedon',
            'updatedby',
        )

    def create(self, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['createdby'] = request.user.id
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().update(instance, validated_data)

from rest_framework import serializers
from .models import ComplaintMaster


class ComplaintMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = ComplaintMaster
        fields = '__all__'
        read_only_fields = (
            'created_on',
            'created_by',
            'updated_on',
            'updated_by',
        )

# class DoctorSerializer(serializers.ModelSerializer):

#     department_code = serializers.SlugRelatedField(
#         slug_field='department_code',
#         queryset=Departments.objects.all()
#     )

#     marital_status_code = serializers.SlugRelatedField(
#         slug_field='marital_status_code',
#         queryset=MaritalStatusMaster.objects.all(),
#         required=False,
#         allow_null=True
#     )

#     city_code = serializers.SlugRelatedField(
#         slug_field='city_code',
#         queryset=Cities.objects.all(),
#         required=False,
#         allow_null=True
#     )

#     district_code = serializers.SlugRelatedField(
#         slug_field='district_code',
#         queryset=Districts.objects.all(),
#         required=False,
#         allow_null=True
#     )

#     state_code = serializers.SlugRelatedField(
#         slug_field='state_code',
#         queryset=States.objects.all(),
#         required=False,
#         allow_null=True
#     )

#     country_code = serializers.SlugRelatedField(
#         slug_field='country_code',
#         queryset=Countries.objects.all(),
#         required=False,
#         allow_null=True
#     )

#     class Meta:
#         model = Doctor
#         fields = '__all__'
#         read_only_fields = (
#             'createdon',
#             'createdby',
#             'updatedon',
#             'updatedby',
#         )
        
class ExpensesMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExpensesMaster
        fields = "__all__"
        read_only_fields = [
            "createdon",
            "createdby",
            "updatedon",
            "updatedby",
        ]

    def validate_expenses_code(self, value):
        if not value:
            raise serializers.ValidationError("Expenses code is required.")
        return value.strip()

    def validate_expenses_name(self, value):
        if not value:
            raise serializers.ValidationError("Expenses name is required.")
        return value.strip()

    def create(self, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['createdby'] = request.user.id
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().update(instance, validated_data)


# class BankdetailsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Bankdetails
#         fields = '__all__'
#         read_only_fields = (
#             'createdon',
#             'createdby',
#             'updatedon',
#             'updatedby',
#         )

#     def create(self, validated_data):
#         from django.utils import timezone
#         request = self.context.get('request')
#         validated_data['createdon'] = timezone.now()
#         validated_data['updatedon'] = timezone.now()
#         if request and hasattr(request, 'user'):
#             try:
#                 validated_data['createdby'] = request.user.id
#                 validated_data['updatedby'] = request.user.id
#             except Exception:
#                 pass
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         from django.utils import timezone
#         request = self.context.get('request')
#         validated_data['updatedon'] = timezone.now()
#         if request and hasattr(request, 'user'):
#             try:
#                 validated_data['updatedby'] = request.user.id
#             except Exception:
#                 pass
#         return super().update(instance, validated_data)


class MseMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MseMaster
        fields = '__all__'
        read_only_fields = (
            'createdon',
            'createdby',
            'updatedon',
            'updatedby',
        )

    def validate_mse_code(self, value):
        if not value:
            raise serializers.ValidationError("MSE code is required.")
        return value.strip()

    def validate_mse_name(self, value):
        if not value:
            raise serializers.ValidationError("MSE name is required.")
        return value.strip()

    def create(self, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['createdby'] = request.user.id
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().update(instance, validated_data)


class ThoughtContentMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThoughtContentMaster
        fields = [
            'thought_content_code',
            'thought_content_name',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby',
        ]
        read_only_fields = (
            'createdon',
            'createdby',
            'updatedon',
            'updatedby',
        )

    def create(self, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['createdby'] = request.user.id
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().update(instance, validated_data)


class NoticeboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Noticeboard
        fields = [
            'notice_code',
            'notice_name',
            'notice_description',
            'notice_srart_date',
            'notice_expiry_date',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby',
        ]
        read_only_fields = (
            'createdon',
            'createdby',
            'updatedon',
            'updatedby',
        )

    def create(self, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['createdby'] = request.user.id
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().update(instance, validated_data)
