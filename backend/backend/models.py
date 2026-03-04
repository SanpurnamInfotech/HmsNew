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
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'company_master'
        
        
class EmployeeMaster(models.Model):
    employee_code = models.CharField(unique=True, max_length=45)
    company_code = models.CharField(max_length=45, blank=True, null=True)
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
    sort_order = models.IntegerField(blank=True, null=True)
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

class MaritalStatusMaster(models.Model):
    marital_status_code = models.CharField(unique=True, max_length=45)
    marital_status_name = models.CharField(max_length=100)
    status = models.IntegerField(blank=True, null=True)        # 1=Active, 0=Inactive
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'marital_status_master'

class RelationMaster(models.Model):
    relation_code  = models.CharField(unique=True, max_length=45)
    relation_name = models.CharField(max_length=100)
    status = models.IntegerField(blank=True, null=True)        # 1=Active, 0=Inactive
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'relation_master'        

class Departments(models.Model):
    department_code = models.CharField(unique=True, max_length=25)
    department_name = models.CharField(max_length=100)
    financialyear_code = models.ForeignKey('FinancialyearMaster', models.DO_NOTHING, db_column='financialyear_code', to_field='financialyear_code', blank=True, null=True)
    company_code  = models.ForeignKey('CompanyMaster', models.DO_NOTHING, db_column='company_code', to_field='company_code', blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)     # 1=Active, 0=Inactive
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'departments'

class BloodGroupMaster(models.Model):
    blood_group_code = models.CharField(unique=True, max_length=10)
    blood_group_name = models.CharField(unique=True, max_length=20)
    description = models.CharField(max_length=255, blank=True, null=True)
    sort_order = models.IntegerField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField()
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField()
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'blood_group_master'

class BloodDonor(models.Model):
    donor_firstname = models.CharField(max_length=255)
    donor_middlename = models.CharField(max_length=255, blank=True, null=True)
    donor_lastname = models.CharField(max_length=255)
    blood_group_code = models.CharField(max_length=10)
    gender = models.CharField(max_length=45, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=100, blank=True, null=True)
    address1 = models.TextField(blank=True, null=True)
    address2 = models.TextField(blank=True, null=True)
    last_donation_date = models.DateTimeField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True, default=1)
    sort_order = models.IntegerField(blank=True, null=True, default=1000)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "blood_donor"

class Bankdetails(models.Model):
    bank_code = models.CharField(unique=True, max_length=45)
    bank_name = models.CharField(max_length=100)
    employee_code = models.CharField(max_length=45, blank=True, null=True)
    bank_address = models.CharField(max_length=255, blank=True, null=True)
    bank_phone = models.CharField(max_length=45, blank=True, null=True)
    bank_branch = models.CharField(max_length=100, blank=True, null=True)
    bank_ifsc = models.CharField(max_length=45, blank=True, null=True)
    bank_accountno = models.CharField(max_length=45, blank=True, null=True)
    bank_ddpayableaddress = models.CharField(max_length=255, blank=True, null=True)
    financialyear_code = models.CharField(max_length=45, blank=True, null=True)
    company_code = models.CharField(max_length=45, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bankdetails'

class BedAllotment(models.Model):
    bed_code = models.CharField(max_length=45, blank=True, null=True)
    patient_code = models.CharField(max_length=45, blank=True, null=True)
    allotment_timestamp = models.DateTimeField(blank=True, null=True)
    discharge_timestamp = models.DateTimeField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "bed_allotment"


class Patient(models.Model):
    patient_code = models.CharField(unique=True, max_length=45)
    hospital_code = models.CharField(max_length=45, null=True, blank=True)
    patient_first_name = models.CharField(max_length=100)
    patient_middle_name = models.CharField(max_length=100, blank=True, null=True)
    patient_last_name = models.CharField(max_length=100)
    dob = models.DateField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    gender = models.IntegerField(blank=True, null=True)  # 1=Male,2=Female,3=Other
    marital_status_code = models.CharField(max_length=45, blank=True, null=True)
    blood_group_code = models.CharField(max_length=10, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    aadhar_no = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=100, blank=True, null=True)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    landmark = models.CharField(max_length=100, blank=True, null=True)
    address1 = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    city_code = models.CharField(max_length=45, blank=True, null=True)
    district_code = models.CharField(max_length=45, blank=True, null=True)
    state_code = models.CharField(max_length=45, blank=True, null=True)
    country_code = models.CharField(max_length=45, blank=True, null=True)
    pincode = models.CharField(max_length=15, blank=True, null=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    informant = models.CharField(max_length=100, blank=True, null=True)
    relation_code = models.CharField(max_length=45, blank=True, null=True)
    reliability = models.CharField(max_length=45, blank=True, null=True)
    referred_by_dr = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_relation = models.CharField(max_length=45, blank=True, null=True)
    patient_photo_path = models.CharField(max_length=255, blank=True, null=True)
    renew_date = models.DateField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)  # 1=Active,0=Inactive
    sort_order = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'patient'    

class OpdBillMaster(models.Model):
    opd_bill_code = models.CharField(max_length=45, unique=True)
    opd_bill_name = models.TextField()
    opd_bill_charge = models.IntegerField()
    sort_order = models.IntegerField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'opd_bill_master'     

class OpdBillingDetails(models.Model):
    opd_billing_code = models.CharField(max_length=45, primary_key=True)
    opd_bill_code = models.CharField(max_length=45)
    opd_bill_name = models.CharField(max_length=5000, blank=True, null=True)
    quantity = models.IntegerField(blank=True, null=True, default=1)
    rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    sort_order = models.IntegerField(blank=True, null=True, default=1000)
    status = models.IntegerField(blank=True, null=True, default=1)
    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'opd_billing_details'  

class OpdBilling(models.Model):
    opd_billing_code = models.CharField(max_length=45, primary_key=True)
    patient_code = models.CharField(max_length=45)
    bill_no = models.CharField(max_length=45, blank=True, null=True)
    appointment_code = models.CharField(max_length=45, blank=True, null=True)
    appointment_type_code = models.CharField(max_length=45, blank=True, null=True)
    hospital_name = models.CharField(max_length=100, blank=True, null=True)

    billing_date = models.DateField(blank=True, null=True)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, default=0.00)
    bill_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, default=0.00)
    amt_received = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, default=0.00)
    dues_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, default=0.00)

    types_of_items = models.CharField(max_length=100, blank=True, null=True)
    sort_order = models.IntegerField(blank=True, null=True, default=1000)
    status = models.IntegerField(blank=True, null=True, default=1)

    createdon = models.DateTimeField(blank=True, null=True)
    createdby = models.IntegerField(blank=True, null=True)
    updatedon = models.DateTimeField(blank=True, null=True)
    updatedby = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "opd_billing"                     

