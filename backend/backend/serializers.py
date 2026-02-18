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

from rest_framework import serializers
from .models import IcdMaster
from django.utils import timezone


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
    
    
from rest_framework import serializers
from .models import Bed
from django.utils import timezone

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
    


from rest_framework import serializers
from .models import HabitMaster
from django.utils import timezone


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



