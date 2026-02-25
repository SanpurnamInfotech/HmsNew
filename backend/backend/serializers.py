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

    
    


class MedicineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicine
        fields = "__all__"
        

class MedicineCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = MedicineCategory
        fields = "__all__"        

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