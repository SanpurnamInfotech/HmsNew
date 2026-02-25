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
    class Meta:
        model = Countries
        fields = "__all__"
    
class StatesSerializer(serializers.ModelSerializer):  
    class Meta:
        model = States
        fields = "__all__"
class CitiesSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Cities
        fields = "__all__"

from .models import Districts


class DistrictsSerializer(serializers.ModelSerializer):

    state_code = serializers.SlugRelatedField(
        slug_field='state_code',
        queryset=States.objects.all()
    )

    class Meta:
        model = Districts
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
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            validated_data['updatedby'] = request.user.id
        return super().update(instance, validated_data)


class FinancialyearMasterSerializer(serializers.ModelSerializer):  
    class Meta:
        model = FinancialyearMaster
        fields = "__all__"
class MaritalStatusMasterSerializer(serializers.ModelSerializer):  
    class Meta:
        model = MaritalStatusMaster
        fields = "__all__"
class DoctorSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Doctor
        fields = "__all__"
class PatientSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Patient
        fields = "__all__"
        
class DepartmentsSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Departments
        fields = "__all__"
        
from rest_framework import serializers
from django.db import transaction
from .models import PrescriptionHeader, PrescriptionItems

class PrescriptionItemsSerializer(serializers.ModelSerializer):
    medicine_name = serializers.ReadOnlyField(source='medicine_code.medicine_name')

    class Meta:
        model = PrescriptionItems
        fields = ['medicine_code', 'medicine_name', 'dosage', 'duration', 'instructions', 'status']

class PrescriptionHeaderSerializer(serializers.ModelSerializer):
    # Using 'items' to represent the child records
    items = PrescriptionItemsSerializer(many=True, source='prescriptionitems_set', required=False)
    patient_name = serializers.ReadOnlyField(source='patient_code.patient_name')
    doctor_name = serializers.ReadOnlyField(source='doctor_code.doctor_name')

    class Meta:
        model = PrescriptionHeader
        fields = '__all__'

    def create(self, validated_data):
        items_data = self.context.get('request').data.get('items', [])
        with transaction.atomic():
            prescription = PrescriptionHeader.objects.create(**validated_data)
            for item in items_data:
                PrescriptionItems.objects.create(prescription_code=prescription, **item)
        return prescription
        
class AdvicemasterSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Advicemaster
        fields = "__all__"
