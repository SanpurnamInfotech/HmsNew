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
class DistrictsSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Districts
        fields = "__all__"
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



class IcdMasterSerializer(serializers.ModelSerializer):
    createdon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )
    updatedon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = IcdMaster
        fields = [
            'icd_code',
            'icd_name',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]
        read_only_fields = ['createdon', 'updatedon', 'createdby', 'updatedby']

    def create(self, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id

        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            instance.updatedby = request.user.id

        instance.updatedon = timezone.now()

        return super().update(instance, validated_data)






from rest_framework import serializers
from .models import RoomTypeMaster
from django.utils import timezone


class RoomTypeMasterSerializer(serializers.ModelSerializer):

    createdon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )
    updatedon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = RoomTypeMaster
        fields = [
            'room_type_code',
            'room_type_name',
            'base_charges',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]

        read_only_fields = ['createdon', 'updatedon', 'createdby', 'updatedby']

    def create(self, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id

        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            instance.updatedby = request.user.id

        instance.updatedon = timezone.now()

        return super().update(instance, validated_data)
    


class BedSerializer(serializers.ModelSerializer):

    createdon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )
    updatedon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = Bed
        fields = [
            'bed_code',
            'bed_name',
            'room_type',
            'bed_charges',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]
        read_only_fields = ['createdon', 'updatedon', 'createdby', 'updatedby']

    def create(self, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id

        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            instance.updatedby = request.user.id

        instance.updatedon = timezone.now()

        return super().update(instance, validated_data)
    




class HabitMasterSerializer(serializers.ModelSerializer):

    createdon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )
    updatedon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = HabitMaster
        fields = [
            'habit_code',
            'habit_name',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]

        read_only_fields = [
            'createdon',
            'updatedon',
            'createdby',
            'updatedby'
        ]

    def create(self, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id

        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            instance.updatedby = request.user.id

        instance.updatedon = timezone.now()

        return super().update(instance, validated_data)



from rest_framework import serializers
from .models import HallucinationMaster
from django.utils import timezone


class HallucinationMasterSerializer(serializers.ModelSerializer):

    createdon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )
    updatedon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = HallucinationMaster
        fields = [
            'hallucination_code',
            'hallucination_name',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]

        read_only_fields = [
            'createdon',
            'updatedon',
            'createdby',
            'updatedby'
        ]

    def create(self, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id

        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            instance.updatedby = request.user.id

        instance.updatedon = timezone.now()

        return super().update(instance, validated_data)



from rest_framework import serializers
from .models import HistoryMaster
from django.utils import timezone


class HistoryMasterSerializer(serializers.ModelSerializer):

    createdon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )
    updatedon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = HistoryMaster
        fields = [
            'history_code',
            'history_name',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]
        read_only_fields = [
            'createdon',
            'updatedon',
            'createdby',
            'updatedby'
        ]

    def create(self, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id
            validated_data['createdon'] = timezone.now()
            validated_data['updatedon'] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            instance.updatedby = request.user.id
            instance.updatedon = timezone.now()

        return super().update(instance, validated_data)
    


from rest_framework import serializers
from .models import MentalIllnessMaster
from django.utils import timezone


class MentalIllnessMasterSerializer(serializers.ModelSerializer):

    createdon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )
    updatedon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = MentalIllnessMaster
        fields = [
            'mental_illness_code',
            'mental_illness_name',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]

        read_only_fields = [
            'createdon',
            'updatedon',
            'createdby',
            'updatedby'
        ]

    def create(self, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id

        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            instance.updatedby = request.user.id

        instance.updatedon = timezone.now()

        return super().update(instance, validated_data)


from rest_framework import serializers
from .models import DsmMaster
from django.utils import timezone


class DsmMasterSerializer(serializers.ModelSerializer):

    createdon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )
    updatedon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = DsmMaster
        fields = [
            'dsm_code',
            'dsm_name',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]

        read_only_fields = [
            'createdon',
            'updatedon',
            'createdby',
            'updatedby'
        ]

    def create(self, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id

        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            instance.updatedby = request.user.id

        instance.updatedon = timezone.now()

        return super().update(instance, validated_data)




from rest_framework import serializers
from .models import PremorbidPersonalityMaster
from django.utils import timezone


class PremorbidPersonalityMasterSerializer(serializers.ModelSerializer):

    createdon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )
    updatedon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = PremorbidPersonalityMaster
        fields = [
            'premorbid_personality_code',
            'premorbid_personality_name',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]

        read_only_fields = [
            'createdon',
            'updatedon',
            'createdby',
            'updatedby'
        ]

    def create(self, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id

        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            instance.updatedby = request.user.id

        instance.updatedon = timezone.now()

        return super().update(instance, validated_data)
    

from rest_framework import serializers
from .models import PossessionMaster
from django.utils import timezone


class PossessionMasterSerializer(serializers.ModelSerializer):

    createdon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )
    updatedon = serializers.DateTimeField(
        format="%d-%m-%Y %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = PossessionMaster
        fields = [
            'possession_code',
            'possession_name',
            'status',
            'sort_order',
            'createdon',
            'createdby',
            'updatedon',
            'updatedby'
        ]

        read_only_fields = [
            'createdon',
            'updatedon',
            'createdby',
            'updatedby'
        ]

    def create(self, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            validated_data['createdby'] = request.user.id
            validated_data['updatedby'] = request.user.id

        validated_data['createdon'] = timezone.now()
        validated_data['updatedon'] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if request and hasattr(request, 'user'):
            instance.updatedby = request.user.id

        instance.updatedon = timezone.now()

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
        

class MoodHistoryMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodHistoryMaster
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