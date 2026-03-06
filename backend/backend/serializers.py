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
        
# class SettingsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Settings
#         fields = '__all__'  
        
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
    

class MaritalStatusMasterSerializer(serializers.ModelSerializer):  
    class Meta:
        model = MaritalStatusMaster
        fields = "__all__"

# class DoctorSerializer(serializers.ModelSerializer):  
#     class Meta:
#         model = Doctor
#         fields = "__all__"

class PatientSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Patient
        fields = "__all__"


        
class DepartmentsSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Departments
        fields = "__all__"
        read_only_fields = ['department_code', 'createdon', 'createdby', 'updatedon', 'updatedby']

    def create(self, validated_data):
        with transaction.atomic():
            last_dept = Departments.objects.select_for_update().order_by('department_code').last()
            
            if not last_dept or not last_dept.department_code:
                new_num = 1
            else:
                try:
                    # Extracts number from 'DEPT000001' -> 1, then increments
                    last_id_numeric = last_dept.department_code.replace("DEPT", "")
                    new_num = int(last_id_numeric) + 1
                except (ValueError, TypeError):
                    new_num = 1
            
            # Formats to DEPT + 6 digits (e.g., DEPT000001)
            validated_data['department_code'] = f"DEPT{new_num:06d}"
            
            return super().create(validated_data)
        

from rest_framework import serializers
from .models import PrescriptionHeader, PrescriptionItems, Patient, Doctor

class PrescriptionItemsSerializer(serializers.ModelSerializer):
    # Dynamically fetch medicine name from the related Medicine model
    medicine_name = serializers.ReadOnlyField(source='medicine_code.medicine_name')

    class Meta:
        model = PrescriptionItems
        fields = ['medicine_code', 'medicine_name', 'dosage', 'duration', 'instructions', 'status']

class PrescriptionReportSerializer(serializers.ModelSerializer):
    # source='prescriptionitems_set' works because of the ForeignKey in PrescriptionItems
    items = PrescriptionItemsSerializer(many=True, read_only=True, source='prescriptionitems_set')
    doctor_details = serializers.SerializerMethodField()
    patient_details = serializers.SerializerMethodField()

    class Meta:
        model = PrescriptionHeader
        fields = '__all__'

    def get_doctor_details(self, obj):
        # Dynamically fetch doctor from the Doctor model using the code from header
        doc = Doctor.objects.filter(doctor_code=obj.doctor_code).first()
        if doc:
            return {
                "name": doc.doctor_name,
                "degree": doc.qualification,
                "mobile": doc.mobile
            }
        return None

    def get_patient_details(self, obj):
        # Dynamically fetch patient using patient_code
        patient = Patient.objects.filter(patient_code=obj.patient_code).first()
        if patient:
            # Map gender integer to text
            gender_map = {1: "Male", 2: "Female", 3: "Other"}
            return {
                "full_name": f"{patient.patient_first_name} {patient.patient_last_name}",
                "age": patient.age,
                "sex": gender_map.get(patient.gender, "Unknown"),
                "mobile": patient.mobile
            }
        return None
        
class AdvicemasterSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Advicemaster
        fields = "__all__"

class CompanyMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyMaster
        fields = '__all__'

class EmployeeMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeMaster
        fields = '__all__'

class MaritalStatusMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaritalStatusMaster
        fields = '__all__'

class RelationMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelationMaster
        fields = '__all__'



class BloodGroupMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodGroupMaster
        fields = "__all__"
        extra_kwargs = {
            "createdon": {"required": False},
            "updatedon": {"required": False},
            "createdby": {"required": False},
            "updatedby": {"required": False},
        }

class BloodDonorSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodDonor
        fields = "__all__"

class BankdetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bankdetails
        fields = "__all__"
        read_only_fields = ("createdon", "createdby", "updatedon", "updatedby")

class BedAllotmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BedAllotment
        fields = "__all__"        

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = "__all__"
        extra_kwargs = {
    "hospital_code": {"required": False, "allow_null": True},
}

        





# class BedSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Bed
#         fields = "__all__"
    


class IpdRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = IpdRegistration
        fields = '__all__'
        read_only_fields = (
            'ipd_registeration_code',
            'ipd_number',
            'created_on',
            'updated_on',
            'created_by',
            'updated_by',
        )

# class DoctorSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Doctor
#         fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class IpdServicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = IpdServices
        fields = "__all__"
        read_only_fields = (
            'service_id',
            'ipd_number',
            'created_on',
            'updated_on',
            'created_by',
            'updated_by',
        )

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
    
from rest_framework import serializers
from .models import MoodHistoryMaster
from django.utils import timezone

class MoodHistoryMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = MoodHistoryMaster
        fields = "__all__"
        read_only_fields = [
            "createdon",
            "createdby",
            "updatedon",
            "updatedby",
        ]

    def validate_mood_history_code(self, value):
        if not value:
            raise serializers.ValidationError("Mood history code is required.")
        return value.strip()

    def validate_mood_history_name(self, value):
        if not value:
            raise serializers.ValidationError("Mood history name is required.")
        return value.strip()

    def create(self, validated_data):
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
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().update(instance, validated_data)

from rest_framework import serializers
from .models import States
from django.utils import timezone

class StatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = States
        fields = "__all__"
        read_only_fields = [
            "createdon",
            "createdby",
            "updatedon",
            "updatedby",
        ]

    def validate_state_code(self, value):
        if not value:
            raise serializers.ValidationError("State code is required.")
        return value.strip()

    def validate_state_name(self, value):
        if not value:
            raise serializers.ValidationError("State name is required.")
        return value.strip()

    def create(self, validated_data):
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
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().update(instance, validated_data)

from rest_framework import serializers
from .models import Districts
from django.utils import timezone

class DistrictsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Districts
        fields = "__all__"
        read_only_fields = ["createdon", "createdby", "updatedon", "updatedby"]

    def validate_district_code(self, value):
        if not value:
            raise serializers.ValidationError("District code is required.")
        return value.strip()

    def validate_district_name(self, value):
        if not value:
            raise serializers.ValidationError("District name is required.")
        return value.strip()

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['createdby'] = request.user.id
                validated_data['updatedby'] = request.user.id
            except Exception: pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception: pass
        return super().update(instance, validated_data)

from rest_framework import serializers
from .models import Cities
from django.utils import timezone

class CitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cities
        fields = "__all__"
        read_only_fields = ["createdon", "createdby", "updatedon", "updatedby"]

    def validate_city_code(self, value):
        if not value:
            raise serializers.ValidationError("City code is required.")
        return value.strip()

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['createdby'] = request.user.id
                validated_data['updatedby'] = request.user.id
            except Exception: pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception: pass
        return super().update(instance, validated_data)
    
from rest_framework import serializers
from .models import Doctor
from django.utils import timezone

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = "__all__"
        read_only_fields = [
            "createdon",
            "createdby",
            "updatedon",
            "updatedby",
        ]

    def validate_doctor_code(self, value):
        if not value:
            raise serializers.ValidationError("Doctor code is required.")
        return value.strip()

    def validate_doctor_name(self, value):
        if not value:
            raise serializers.ValidationError("Doctor name is required.")
        return value.strip()

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()
        
        if request and hasattr(request, 'user'):
            try:
                # User ID save karne ke liye
                validated_data['createdby'] = request.user.id
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        validated_data['updatedon'] = timezone.now()
        
        if request and hasattr(request, 'user'):
            try:
                # Update ke waqt sirf updatedby change hoga
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().update(instance, validated_data)
    


class IcdMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = IcdMaster
        fields = "__all__"
        


class RoomTypeMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = RoomTypeMaster
        fields = "__all__"
    

class BedSerializer(serializers.ModelSerializer):

    class Meta:
        model = Bed
        fields = "__all__"
        read_only_fields = ["bed_code", "createdon", "createdby", "updatedon", "updatedby"]
    

class HabitMasterSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = HabitMaster
        fields = "__all__"


class HallucinationMasterSerializer(serializers.ModelSerializer):
    
      class Meta:
        model = HallucinationMaster
        fields = "__all__"





class HistoryMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = HistoryMaster
        fields ="__all__"
        



class MentalIllnessMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = MentalIllnessMaster
        fields ="__all__"





class DsmMasterSerializer(serializers.ModelSerializer):
      class Meta:
        model = DsmMaster
        fields ="__all__"



class PremorbidPersonalityMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = PremorbidPersonalityMaster
        fields = "__all__"
    




class PossessionMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model=PossessionMaster
        fields ="__all__"
        

     
   
class FinancialyearMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = FinancialyearMaster
        fields = "__all__"
   


class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = "__all__"
        read_only_fields = ["setting_id"]

    
    
class MedicineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicine
        fields = "__all__"
        



class MedicineCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = MedicineCategory
        fields = "__all__"      
        

class AppointmentTypeMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppointmentTypeMaster
        fields = "__all__"   
        
        
from rest_framework import serializers
from .models import Appointment, Patient, Doctor, AppointmentTypeMaster


class AppointmentSerializer(serializers.ModelSerializer):

    patient_code = serializers.SlugRelatedField(
        queryset=Patient.objects.all(),
        slug_field="patient_code",
        allow_null=True,
        required=False
    )

    
    doctor_code = serializers.SlugRelatedField(
        queryset=Doctor.objects.all(),
        slug_field="doctor_code"
    )

    appointment_type_code = serializers.SlugRelatedField(
        queryset=AppointmentTypeMaster.objects.all(),
        slug_field="appointment_type_code",
        allow_null=True,
        required=False
    )

    class Meta:
        model = Appointment
        fields = "__all__" 
        
# class TransactionsSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Transactions
#         fields = "__all__"                         

class HospitalDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalDetails
        fields = '__all__'
        
# Serializer for Header with Nested Items
