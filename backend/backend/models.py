from django.db import models

# Create your models here.
class Users(models.Model):
    user_id = models.IntegerField(unique=True, blank=True, null=True)
    username = models.CharField(max_length=20, db_collation='utf8mb3_general_ci')
    password = models.CharField(max_length=128, db_collation='utf8mb3_general_ci')
    email = models.CharField(max_length=128, db_collation='utf8mb3_general_ci')
    activkey = models.CharField(max_length=128, db_collation='utf8mb3_general_ci', blank=True, null=True)
    superuser = models.IntegerField()
    status = models.IntegerField()
    usertype_id = models.IntegerField()
    employee_code = models.CharField(max_length=45, db_collation='latin1_bin', blank=True, null=True)
    candidate_id = models.IntegerField(blank=True, null=True)
    company_code = models.CharField(max_length=45, db_collation='latin1_bin', blank=True, null=True)  
    createdon = models.DateTimeField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    lastvisiton = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'

class Usertype(models.Model):
    usertype_id= models.IntegerField(blank=True, null=True)
    usertype_name = models.CharField(max_length=45, blank=True, null=True)
    financialyear_id = models.IntegerField(blank=True, null=True)
    company_code = models.CharField(max_length=45, blank=True, null=True)
    createdon = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updatedon = models.DateTimeField(auto_now=True, blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usertype'
        
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
    usertype_id = models.CharField(max_length=25, blank=True, null=True)
    module_code = models.CharField(max_length=25, blank=True, null=True)
    submodule_code = models.CharField(max_length=25, blank=True, null=True)
    activity_code = models.IntegerField(blank=True, null=True)
    e_read = models.CharField(max_length=10, blank=True, null=True)
    e_write = models.CharField(max_length=10, blank=True, null=True)
    e_update = models.CharField(max_length=10, blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'permissions'
        
        
class Company(models.Model):
    company_code = models.CharField(max_length=45, blank=True, null=True)
    company_name = models.CharField(max_length=45, blank=True, null=True)
    company_address = models.CharField(max_length=256, blank=True, null=True)
    company_email = models.CharField(max_length=45, blank=True, null=True)
    company_phone = models.CharField(max_length=15, blank=True, null=True)
    company_mobile = models.CharField(max_length=15, blank=True, null=True)
    company_fax = models.CharField(max_length=45, blank=True, null=True)
    company_contactperson = models.CharField(max_length=45, blank=True, null=True)
    company_country = models.CharField(max_length=45, blank=True, null=True)
    company_state = models.CharField(max_length=45, blank=True, null=True)
    company_currency = models.CharField(max_length=60, blank=True, null=True)
    company_registrationNumber = models.CharField(max_length=45, blank=True, null=True)
    company_gstnumber = models.CharField(db_column='company_GSTNumber', unique=True, max_length=45, blank=True, null=True)  # Field name made lowercase.

    company_timezone = models.CharField(max_length=60, blank=True, null=True)
    company_logo = models.CharField(max_length=60, blank=True, null=True)
    createdon = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updatedon = models.DateTimeField(auto_now=True, blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'company'
        
        
class Employee(models.Model):
    employee_code = models.CharField(unique=True, max_length=45, blank=True, null=True)
    employee_firstname = models.CharField(max_length=45, blank=True, null=True)
    employee_middlename = models.CharField(max_length=45, blank=True, null=True)
    employee_lastname = models.CharField(max_length=45, blank=True, null=True)
    employee_joiningdate = models.DateField(blank=True, null=True)
    employee_qualification = models.CharField(max_length=45, blank=True, null=True)
    employee_totalexperiance = models.CharField(max_length=45, blank=True, null=True)
    financialyear_id = models.IntegerField(blank=True, null=True)
    company_code = models.CharField(max_length=45, blank=True, null=True)
    department_code = models.CharField(max_length=256, blank=True, null=True)
    designation_id = models.IntegerField(blank=True, null=True)
    usertype_id = models.IntegerField(blank=True, null=True)
    division_code = models.CharField(max_length=256, blank=True, null=True)
    employee_dob = models.DateField(blank=True, null=True)
    employee_gender = models.CharField(max_length=10, blank=True, null=True, db_comment='1=>Male,2=>Female')
    employee_address1 = models.CharField(max_length=256, blank=True, null=True)
    employee_address2 = models.CharField(max_length=256, blank=True, null=True)
    employee_country = models.CharField(max_length=45, blank=True, null=True)
    employee_state = models.CharField(max_length=45, blank=True, null=True)
    employee_city = models.CharField(max_length=45, blank=True, null=True)
    employee_pincode = models.CharField(max_length=45, blank=True, null=True)
    employee_phone = models.CharField(max_length=15, blank=True, null=True)
    employee_mobile = models.CharField(max_length=15, blank=True, null=True)
    employee_email = models.CharField(max_length=45, blank=True, null=True)
    employee_photo = models.BinaryField()
    employee_status = models.CharField(max_length=45, blank=True, null=True, db_comment='1=>existing,2=>resigned,3=>terminated')
    contact_id = models.CharField(max_length=45,blank=True, null=True)
    termination_date = models.DateField(blank=True, null=True)
    termination_reason = models.CharField(max_length=256, blank=True, null=True)
    createdon = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updatedon = models.DateTimeField(auto_now=True, blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'employee'
        
        
class Financialyear(models.Model):
    financialyear_id = models.IntegerField(unique=True, blank=True, null=True)
    financialyear_startyear = models.CharField(max_length=45, blank=True, null=True)
    financialyear_endyear = models.CharField(max_length=45, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'financialyear'
        
class Countries(models.Model):
    country_code = models.CharField(unique=True, max_length=45, blank=True, null=True)
    country_name = models.CharField(max_length=255)
    createdon = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(auto_now=True,blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'countries'
        
class Advicemaster(models.Model):
    advicemaster_id = models.IntegerField(blank=True, null=True)
    advice_name = models.TextField()
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'advicemaster'