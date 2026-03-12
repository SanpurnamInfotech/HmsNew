from .models import *
from rest_framework import serializers
from django.db import transaction
from django.contrib.auth.hashers import make_password 
import re
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
        
class DoctorSerializer(serializers.ModelSerializer):
    # Accept related objects by their code strings coming from frontend
    department_code = serializers.SlugRelatedField(
        queryset=Departments.objects.all(), slug_field='department_code', allow_null=True, required=False
    )
    marital_status_code = serializers.SlugRelatedField(
        queryset=MaritalStatusMaster.objects.all(), slug_field='marital_status_code', allow_null=True, required=False
    )
    city_code = serializers.SlugRelatedField(
        queryset=Cities.objects.all(), slug_field='city_code', allow_null=True, required=False
    )
    district_code = serializers.SlugRelatedField(
        queryset=Districts.objects.all(), slug_field='district_code', allow_null=True, required=False
    )
    state_code = serializers.SlugRelatedField(
        queryset=States.objects.all(), slug_field='state_code', allow_null=True, required=False
    )
    country_code = serializers.SlugRelatedField(
        queryset=Countries.objects.all(), slug_field='country_code', allow_null=True, required=False
    )

    class Meta:
        model = Doctor
        fields = '__all__'
        read_only_fields = ['doctor_code']  # doctor_code ko manually change nahi karna

    def create(self, validated_data):
        # Make create robust: get the latest PK, extract trailing number from code
        import re

        last = Doctor.objects.order_by('-pk').first()
        new_number = 1
        if last and last.doctor_code:
            try:
                m = re.search(r"(\d+)$", last.doctor_code)
                if m:
                    last_number = int(m.group(1))
                    new_number = last_number + 1
            except Exception:
                new_number = 1

        validated_data['doctor_code'] = f'DR{new_number:03d}'
        return super().create(validated_data)
    
        
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

    items = PrescriptionItemsSerializer(many=True, read_only=True, source='prescriptionitems_set')
    doctor_details = serializers.SerializerMethodField()
    patient_details = serializers.SerializerMethodField()
    chief_complaints = serializers.SerializerMethodField()
    clinical_findings = serializers.SerializerMethodField()

    class Meta:
        model = PrescriptionHeader
        fields = [
            'prescription_code', 'appointment_code', 'patient_code', 'doctor_code', 'prescription_date',
            'diagnosis', 'symptoms', 'case_history', 'next_visit_date', 'pdf_file_path', 'status', 'sort_order',
            'createdon', 'createdby', 'updatedon', 'updatedby',
            'items', 'doctor_details', 'patient_details', 'chief_complaints', 'clinical_findings'
        ]

    def get_doctor_details(self, obj):
        doc = Doctor.objects.filter(doctor_code=obj.doctor_code).first()
        if doc:
            return {
                "name": doc.doctor_name,
                "degree": doc.qualification,
                "reg_no": getattr(doc, 'registration_no', ''),
                "mobile": doc.mobile
            }
        return None

    def get_patient_details(self, obj):
        patient = Patient.objects.filter(patient_code=obj.patient_code).first()
        if patient:
            gender_map = {1: "Male", 2: "Female", 3: "Other"}
            address = f"{patient.address1 or ''} {patient.address2 or ''} {patient.city_code or ''} {patient.district_code or ''} {patient.state_code or ''} {patient.country_code or ''} {patient.pincode or ''}"
            return {
                "full_name": f"{patient.patient_first_name} {patient.patient_last_name}",
                "age": patient.age,
                "sex": gender_map.get(patient.gender, "Unknown"),
                "mobile": patient.mobile,
                "id": patient.patient_code,
                "address": address.strip(),
                "weight": float(patient.weight_kg) if patient.weight_kg else None,
                "height": None,  # Add if you have height field
                "bp": None,      # Add if you have BP field
            }
        return None

    def get_chief_complaints(self, obj):
        # Assume symptoms is a text field with complaints separated by newlines or commas
        if obj.symptoms:
            return [s.strip() for s in obj.symptoms.replace('\r', '').split('\n') if s.strip()] or [obj.symptoms]
        return []

    def get_clinical_findings(self, obj):
        # Assume case_history is a text field with findings separated by newlines or commas
        if obj.case_history:
            return [s.strip() for s in obj.case_history.replace('\r', '').split('\n') if s.strip()] or [obj.case_history]
        return []
        
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
        # Make employee_code read-only to prevent updates from changing it
        read_only_fields = ['employee_code', 'createdon', 'createdby', 'updatedon', 'updatedby']
        
    def create(self, validated_data):
        with transaction.atomic():
            last_emp = EmployeeMaster.objects.select_for_update().order_by('employee_code').last()
            
            if not last_emp or not last_emp.employee_code:
                new_num = 1
            else:
                try:
                    # Extracts number from 'EMP000001' -> 1, then increments
                    last_id_numeric = last_emp.employee_code.replace("EMP", "")
                    new_num = int(last_id_numeric) + 1
                except (ValueError, TypeError):
                    new_num = 1
            
            # Formats to EMP + 6 digits (e.g., EMP000001)
            validated_data['employee_code'] = f"EMP{new_num:06d}"
            
            return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Ensure employee_code is never changed during an update
        validated_data.pop('employee_code', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

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
        # These are handled by the system, not the user
        read_only_fields = ['patient_code', 'createdon', 'createdby', 'updatedon', 'updatedby']
        extra_kwargs = {
            "hospital_code": {"required": False, "allow_null": True, "allow_blank": True},
            "uhid": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def create(self, validated_data):
        with transaction.atomic():
            # Get the last patient to increment the code
            last_pat = Patient.objects.select_for_update().order_by('patient_code').last()
            
            if not last_pat or not last_pat.patient_code:
                new_num = 1
            else:
                try:
                    # FIX: Changed "DEPT" to "PAT" to match Patient prefix
                    last_id_numeric = last_pat.patient_code.replace("PAT", "")
                    new_num = int(last_id_numeric) + 1
                except (ValueError, TypeError):
                    new_num = 1
            
            # Formats to PAT + 6 digits (e.g., PAT000001)
            validated_data['patient_code'] = f"PAT{new_num:06d}"
            
            return super().create(validated_data)
           
class OpdBillMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpdBillMaster
        fields = '__all__'
        

class OpdBillingDetailsSerializer(serializers.ModelSerializer):
    opd_bill_code = serializers.SlugRelatedField(
        slug_field='opd_bill_code', 
        queryset=OpdBillMaster.objects.all()
    )

    class Meta:
        model = OpdBillingDetails
        fields = '__all__'
        extra_kwargs = {'opd_billing_code': {'required': False}}

class OpdBillingSerializer(serializers.ModelSerializer):
    bill_items = OpdBillingDetailsSerializer(many=True)
    patient_code = serializers.SlugRelatedField(
        slug_field='patient_code', 
        queryset=Patient.objects.all()
    )

    class Meta:
        model = OpdBilling
        fields = '__all__'
        read_only_fields = ('createdby', 'createdon', 'updatedby', 'updatedon')
        extra_kwargs = {'opd_billing_code': {'required': False}}

    def create(self, validated_data):
        bill_items_data = validated_data.pop('bill_items', [])

        if not validated_data.get('opd_billing_code'):
            last_bill = OpdBilling.objects.all().order_by('opd_billing_code').last()
            if not last_bill:
                new_code = "BILL-000001"
            else:
                last_string = last_bill.opd_billing_code
                numbers = re.findall(r'\d+', last_string)
                num = int(numbers[-1]) if numbers else 0
                new_code = f"BILL-{str(num + 1).zfill(6)}"
            validated_data['opd_billing_code'] = new_code

        billing_instance = OpdBilling.objects.create(**validated_data)
        
        for item_data in bill_items_data:
            OpdBillingDetails.objects.create(
                opd_billing_code=billing_instance,
                **item_data
            )
            
        return billing_instance

    def update(self, instance, validated_data):
        # 1. Extract bill_items if present
        bill_items_data = validated_data.pop('bill_items', None)

        # 2. Update parent OpdBilling fields (excluding billing_code)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 3. Update nested items (Delete existing and recreate)
        if bill_items_data is not None:
            # Clear old items associated with this bill
            instance.bill_items.all().delete()
            
            # Create new items from the payload
            for item_data in bill_items_data:
                OpdBillingDetails.objects.create(
                    opd_billing_code=instance,
                    **item_data
                )

        return instance

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








class PatientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = [
            'patient_code',
            'uhid',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]

    def create(self, validated_data):
        with transaction.atomic():

            last_patient = (
                Patient.objects
                .select_for_update()
                .order_by('-id')
                .first()
            )

            if last_patient and last_patient.patient_code:
                try:
                    last_number = int(last_patient.patient_code.replace("PAT", ""))
                    new_number = last_number + 1
                except ValueError:
                    new_number = 1
            else:
                new_number = 1

            validated_data["patient_code"] = f"PAT{new_number:06d}"
            validated_data["uhid"] = f"UHID{new_number:06d}"

            patient = Patient.objects.create(**validated_data)

            return patient


    def update(self, instance, validated_data):

        # Prevent updating these fields
        validated_data.pop('patient_code', None)
        validated_data.pop('uhid', None)

        return super().update(instance, validated_data)
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

        
class OpdCasesheetSerializer(serializers.ModelSerializer):

    class Meta:
        model = OpdCasesheet
        fields = "__all__"       
        
class TransactionModeMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = TransactionModeMaster
        fields = "__all__"       
                          
class TransactionsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transactions
        fields = '__all__'
        read_only_fields = ('transaction_code','createdon','createdby','updatedon','updatedby')

    def create(self, validated_data):

        if not validated_data.get('transaction_code'):

            last_transaction = Transactions.objects.all().order_by('transaction_code').last()

            if not last_transaction:
                new_code = "TRN-000001"
            else:
                last_code = last_transaction.transaction_code
                last_number = int(last_code.split("-")[1])
                new_code = f"TRN-{str(last_number + 1).zfill(6)}"

            validated_data['transaction_code'] = new_code

        return super().create(validated_data)


class AccountSerializer(serializers.ModelSerializer):

    class Meta:
        model = Account
        fields = "__all__"
        read_only_fields = ["createdon", "createdby", "updatedon", "updatedby"]

    # ================= VALIDATIONS =================

    def validate_account_code(self, value):
        if not value:
            raise serializers.ValidationError("Account code is required.")
        return value.strip()

    def validate_account_number(self, value):
        if not value:
            raise serializers.ValidationError("Account number is required.")
        return value.strip()

    # ================= CREATE =================

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

    # ================= UPDATE =================

    def update(self, instance, validated_data):
        request = self.context.get('request')

        validated_data['updatedon'] = timezone.now()

        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass

        return super().update(instance, validated_data)




class HospitalDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = HospitalDetails
        fields = "__all__"
        read_only_fields = [
            "createdon",
            "createdby",
            "updatedon",
            "updatedby",
        ]

    def validate_hospital_code(self, value):
        if not value:
            raise serializers.ValidationError("Hospital code is required")
        return value.strip()

    def validate_hospital_name(self, value):
        if not value:
            raise serializers.ValidationError("Hospital name is required")
        return value.strip()
class EctSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ect
        fields = "__all__"
        


class FollowUpSerializer(serializers.ModelSerializer):

    class Meta:
        model = FollowUp
        fields = "__all__"        
class DischargeSummarySerializer(serializers.ModelSerializer):

    class Meta:
        model = DischargeSummary
        fields = "__all__"        



class UsertypeMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = UsertypeMaster
        fields = "__all__"                         
class DivisionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Division
        fields = "__all__"                         
class DesignationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Designation
        fields = "__all__"    

class OpdCasesheetSerializer(serializers.ModelSerializer):
        model = OpdCasesheet
        fields = [
            'opd_casesheet_code',
            'patient_code',
            'case_title',
            'chief_complaint',
            'symptoms',
            'diagnosis',
            'vital_signs',
            'weight_kg',
            'height_cm',
            'bp_sys',
            'bp_dia',
            'status',
            'sort_order',
        ]
        
        def create(self, validated_data):
            # You can add logic here to automatically set createdby if needed
            return super().create(validated_data)

        def update(self, instance, validated_data):
            # You can add logic here to automatically set updatedon/updatedby
            return super().update(instance, validated_data)


class DischargeSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DischargeSummary
        fields = "__all__"
        # In fields ko manual input se protect karne ke liye read_only rakha hai
        read_only_fields = [
            "createdon",
            "createdby",
            "updatedon",
            "updatedby",
        ]

    def validate_discharge_summary_code(self, value):
        if not value:
            raise serializers.ValidationError("Discharge summary code is required.")
        return value.strip()

    def validate_patient_code(self, value):
        if not value:
            raise serializers.ValidationError("Patient code is required.")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        # Timestamp set karna
        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()
        
        # User tracking logic
        if request and hasattr(request, 'user'):
            try:
                # Agar user logged in hai toh uski ID save karein
                validated_data['createdby'] = request.user.id
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        # Sirf update timestamp aur user badalna
        validated_data['updatedon'] = timezone.now()
        
        if request and hasattr(request, 'user'):
            try:
                validated_data['updatedby'] = request.user.id
            except Exception:
                pass
        return super().update(instance, validated_data)


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = "__all__"



class BloodDonorSerializer(serializers.ModelSerializer):    
    class Meta:
        model = BloodDonor
        fields = '__all__'
        read_only_fields = ('createdby', 'createdon', 'updatedby', 'updatedon', 'blood_donor_code')

    def create(self, validated_data):
        if not validated_data.get('blood_donor_code'):
            last_donor = BloodDonor.objects.all().order_by('id').last()
            if not last_donor:
                new_code = "DONOR-000001"
            else:
                last_id = last_donor.id
                new_code = f"DONOR-{str(last_id + 1).zfill(6)}"
            validated_data['blood_donor_code'] = new_code
            
        return super().create(validated_data)
    
    
class CompanyMasterSerializer(serializers.ModelSerializer):    
    class Meta:
        model = CompanyMaster
        fields = '__all__'
        read_only_fields = ('company_code','createdby', 'createdon', 'updatedby', 'updatedon')

    def create(self, validated_data):
        if not validated_data.get('company_code'):
            last_company = CompanyMaster.objects.all().order_by('id').last()
            if not last_company:
                new_code = "COMP-000001"
            else:
                last_id = last_company.id
                new_code = f"COMP-{str(last_id + 1).zfill(6)}"
            validated_data['company_code'] = new_code
            
        return super().create(validated_data)
    
class OpdBillMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpdBillMaster
        fields = '__all__'
        read_only_fields = ('opd_bill_code','createdby', 'createdon', 'updatedby', 'updatedon')

    def create(self, validated_data):
        if not validated_data.get('opd_bill_code'):
            last_opd_bill_master = OpdBillMaster.objects.all().order_by('id').last()
            if not last_opd_bill_master:
                new_code = "OPD-000001"
            else:
                last_id = last_opd_bill_master.id
                new_code = f"OPD-{str(last_id + 1).zfill(6)}"
            validated_data['opd_bill_code'] = new_code
            
        return super().create(validated_data)


                     
