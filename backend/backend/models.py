from django.db import models

# Create your models here.
class Users(models.Model):
    user_id = models.IntegerField(blank=True, null=True)
    username = models.CharField(unique=True, max_length=50)
    password = models.CharField(max_length=255)
    email = models.CharField(max_length=100, blank=True, null=True)
    activkey = models.CharField(max_length=128, blank=True, null=True)
    superuser = models.IntegerField()
    status = models.IntegerField()
    usertype_code = models.ForeignKey('UsertypeMaster', models.DO_NOTHING, db_column='usertype_code', to_field='usertype_code', blank=True, null=True)
    employee_code = models.ForeignKey('EmployeeMaster', models.DO_NOTHING, db_column='employee_code', to_field='employee_code', blank=True, null=True)
    company_code = models.ForeignKey('CompanyMaster', models.DO_NOTHING, db_column='company_code', to_field='company_code', blank=True, null=True)
    candidate_id = models.IntegerField(blank=True, null=True)
    lastvisiton = models.DateTimeField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'

class UsertypeMaster(models.Model):
    usertype_code = models.CharField(unique=True, max_length=45)
    usertype_name = models.CharField(max_length=100)
    financialyear_code = models.ForeignKey('FinancialyearMaster', models.DO_NOTHING, db_column='financialyear_code', to_field='financialyear_code', blank=True, null=True)
    company_code = models.ForeignKey('CompanyMaster', models.DO_NOTHING, db_column='company_code', to_field='company_code', blank=True, null=True)
    status = models.IntegerField()
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usertype_master'
        
class SystemRoute(models.Model):
    display_code = models.CharField(unique=True, max_length=45)
    display_name = models.CharField(max_length=225)
    react_path = models.CharField(unique=True, max_length=255)
    status = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'system_route'
        
class EngineModule(models.Model):
    module_code = models.CharField(unique=True, max_length=25)
    module_name = models.CharField(max_length=60, blank=True, null=True)
    url = models.CharField(max_length=60, blank=True, null=True)
    icon = models.CharField(max_length=1000, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    sequence = models.CharField(max_length=25, blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'engine_module'
        
class EngineSubmodule(models.Model):
    module_code = models.ForeignKey('EngineModule', models.DO_NOTHING, db_column='module_code', to_field='module_code', blank=True, null=True)
    submodule_code = models.CharField(unique=True, max_length=25)
    submodule_name = models.CharField(max_length=60, blank=True, null=True)
    url = models.CharField(max_length=60, blank=True, null=True)
    icon = models.CharField(max_length=600, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    sequence = models.CharField(max_length=25, blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'engine_submodule'
        
class EngineActivity(models.Model):
    activity_code = models.CharField(unique=True, max_length=25)
    activity_name = models.CharField(max_length=60, blank=True, null=True)
    module_code = models.ForeignKey('EngineModule', models.DO_NOTHING, db_column='module_code', to_field='module_code', blank=True, null=True)
    submodule_code = models.ForeignKey('EngineSubmodule', models.DO_NOTHING, db_column='submodule_code', to_field='submodule_code', blank=True, null=True)
    url = models.CharField(max_length=60, blank=True, null=True)
    icon = models.CharField(max_length=600, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    sequence = models.CharField(max_length=25, blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'engine_activity'
        
        
class Settings(models.Model):
    setting_id = models.IntegerField(unique=True)
    setting_name = models.CharField(max_length=100, blank=True, null=True)
    module_code = models.CharField(max_length=25, blank=True, null=True)
    submodule_code = models.CharField(max_length=25, blank=True, null=True)
    activity_code = models.CharField(max_length=25, blank=True, null=True)
    setting_value = models.CharField(max_length=255, blank=True, null=True)
    setting_value2 = models.CharField(max_length=255, blank=True, null=True)
    used_for = models.CharField(max_length=100, blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'settings'
        
class Permissions(models.Model):
    usertype_code = models.CharField(max_length=45)
    usertype_name = models.CharField(max_length=225)
    module_code = models.CharField(max_length=45, blank=True, null=True)
    submodule_code = models.CharField(max_length=45, blank=True, null=True)
    activity_code = models.CharField(max_length=45, blank=True, null=True)
    e_read = models.CharField(max_length=10, blank=True, null=True)
    e_write = models.CharField(max_length=10, blank=True, null=True)
    e_update = models.CharField(max_length=10, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True, db_comment='1=Active, 0=Inactive')
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'permissions'
        
        
class CompanyMaster(models.Model):
    company_code = models.CharField(unique=True, max_length=45)
    company_name = models.CharField(max_length=150)
    email = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    landmark = models.CharField(max_length=255, blank=True, null=True)
    address1 = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    fax = models.CharField(max_length=45, blank=True, null=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    country_code = models.CharField(max_length=45, blank=True, null=True)
    state_code = models.CharField(max_length=45, blank=True, null=True)
    district_code = models.CharField(max_length=45, blank=True, null=True)
    city_code = models.CharField(max_length=45, blank=True, null=True)
    currency = models.CharField(max_length=10, blank=True, null=True)
    reg_number = models.CharField(max_length=100, blank=True, null=True)
    gst_number = models.CharField(unique=True, max_length=100, blank=True, null=True)
    timezone = models.CharField(max_length=100, blank=True, null=True)
    company_logo = models.CharField(max_length=255, blank=True, null=True)
    status = models.IntegerField()
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'company_master'
        
        
class EmployeeMaster(models.Model):
    employee_code = models.CharField(unique=True, max_length=45)
    company_code = models.ForeignKey('CompanyMaster', models.DO_NOTHING, db_column='company_code', to_field='company_code')
    financialyear_code = models.ForeignKey('FinancialyearMaster', models.DO_NOTHING, db_column='financialyear_code', to_field='financialyear_code', blank=True, null=True)
    department_code = models.CharField(max_length=45, blank=True, null=True)
    designation_code = models.CharField(max_length=45, blank=True, null=True)
    usertype_code = models.ForeignKey('UsertypeMaster', models.DO_NOTHING, db_column='usertype_code', to_field='usertype_code', blank=True, null=True)
    division_code = models.CharField(max_length=45, blank=True, null=True)
    employee_firstname = models.CharField(max_length=100)
    employee_middlename = models.CharField(max_length=100, blank=True, null=True)
    employee_lastname = models.CharField(max_length=100)
    dob = models.DateField(blank=True, null=True)
    gender = models.IntegerField(blank=True, null=True, db_comment='1=>Male, 2=>Female, 3=>Other')
    photo = models.CharField(max_length=255, blank=True, null=True)
    joining_date = models.DateField(blank=True, null=True)
    qualification = models.CharField(max_length=150, blank=True, null=True)
    total_experience = models.CharField(max_length=100, blank=True, null=True)
    status = models.IntegerField(db_comment='1=>Existing, 2=>Resigned, 3=>Terminated')
    termination_date = models.DateField(blank=True, null=True)
    termination_reason = models.TextField(blank=True, null=True)
    email = models.CharField(max_length=100, blank=True, null=True)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    landmark = models.CharField(max_length=100, blank=True, null=True)
    address1 = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    country_code = models.CharField(max_length=45, blank=True, null=True)
    state_code = models.CharField(max_length=45, blank=True, null=True)
    district_code = models.CharField(max_length=45, blank=True, null=True)
    city_code = models.CharField(max_length=45, blank=True, null=True)
    pincode = models.CharField(max_length=15, blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'employee_master'
        
        
class FinancialyearMaster(models.Model):
    financialyear_code = models.CharField(unique=True, max_length=45)
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    status = models.IntegerField()
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'financialyear_master'
        
class Countries(models.Model):
    country_code = models.CharField(unique=True, max_length=45)
    country_name = models.CharField(max_length=255)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'countries'
        
class Advicemaster(models.Model):
    advice_code = models.CharField(unique=True, max_length=45)
    advice_name = models.CharField(max_length=500, blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'advicemaster'


class IcdMaster(models.Model):
    icd_code = models.CharField(unique=True, max_length=45)
    icd_name = models.CharField(max_length=255)
    status = models.IntegerField(blank=True, null=True, db_comment='1=Active, 0=Inactive')
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icd_master'



class RoomTypeMaster(models.Model):
    room_type_code = models.CharField(unique=True, max_length=20)
    room_type_name = models.CharField(max_length=100)
    base_charges = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)       
    status = models.IntegerField(blank=True, null=True)
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'room_type_master'


class Bed(models.Model):
    bed_code = models.CharField(unique=True, max_length=45)
    bed_name = models.CharField(max_length=100, blank=True, null=True)
    room_type = models.CharField(max_length=50)
    bed_charges = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.IntegerField(blank=True, null=True, db_comment='1=Active/Available, 0=Inactive') 
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bed'




class HabitMaster(models.Model):
    habit_code = models.CharField(unique=True, max_length=25)
    habit_name = models.CharField(max_length=100)
    status = models.IntegerField(blank=True, null=True, db_comment='1=Active, 0=Inactive')
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'habit_master'


class HallucinationMaster(models.Model):
    hallucination_code = models.CharField(unique=True, max_length=25)
    hallucination_name = models.CharField(max_length=100)
    status = models.IntegerField(blank=True, null=True, db_comment='1=Active, 0=Inactive')
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hallucination_master'


class HistoryMaster(models.Model):
    history_code = models.CharField(unique=True, max_length=25)
    history_name = models.CharField(max_length=100)
    status = models.IntegerField(blank=True, null=True, db_comment='1=Active, 0=Inactive')
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'history_master'



class MentalIllnessMaster(models.Model):
    mental_illness_code = models.CharField(unique=True, max_length=25)
    mental_illness_name = models.CharField(max_length=100)
    status = models.IntegerField(blank=True, null=True, db_comment='1=Active, 0=Inactive')
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'mental_illness_master'



class DsmMaster(models.Model):
    dsm_code = models.CharField(unique=True, max_length=25)
    dsm_name = models.CharField(max_length=100)
    status = models.IntegerField(blank=True, null=True, db_comment='1=Active, 0=Inactive')
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dsm_master'