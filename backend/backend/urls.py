from django.urls import path
from .views import *
from .api_views import *

urlpatterns = [
    
    path('api/', getRoutes),
    
    path("api/admin-login/", LoginView.as_view(), name="admin-login"),
    path("api/admin-register/", RegisterView.as_view(), name="admin-register"),
    
    path('api/available_urls/', AvailableURLsView.as_view(), name='available_urls'),
    
    path('api/settings/', SettingsListView.as_view(), name='settings-list'),
    path('api/settings/create/', SettingsCreateView.as_view(), name='settings-create'),
    path('api/settings/<int:setting_id>/', SettingsDetailView.as_view(), name='settings-detail'),
    path('api/settings/update/<int:setting_id>/', SettingsUpdateView.as_view(), name='settings-update'),
    path('api/settings/delete/<int:setting_id>/', SettingsDeleteView.as_view(), name='settings-delete'),
    
    path('api/usertypes/', UserTypeListView.as_view(), name='usertype-list'),
    path('api/usertypes/create/', UserTypeCreateView.as_view(), name='usertype-create'),
    path('api/usertypes/<int:usertype_code>/', UserTypeDetailView.as_view(), name='usertype-detail'),
    path('api/usertypes/update/<int:usertype_code>/', UserTypeUpdateView.as_view(), name='usertype-update'),
    path('api/usertypes/delete/<int:usertype_code>/', UserTypeDeleteView.as_view(), name='usertype-delete'),
    
    path("api/engine-module/", EngineModuleListView.as_view()),
    path("api/engine-module/create/", EngineModuleCreateView.as_view()),
    path("api/engine-module/<str:module_code>/", EngineModuleDetailView.as_view()),
    path("api/engine-module/update/<str:module_code>/", EngineModuleUpdateView.as_view()),
    path("api/engine-module/delete/<str:module_code>/", EngineModuleDeleteView.as_view()),

    path("api/engine-submodule/", EngineSubmoduleListView.as_view()),
    path("api/engine-submodule/create/", EngineSubmoduleCreateView.as_view()),      
    path("api/engine-submodule/<str:submodule_code>/", EngineSubmoduleDetailView.as_view()),
    path("api/engine-submodule/update/<str:submodule_code>/", EngineSubmoduleUpdateView.as_view()),
    path("api/engine-submodule/delete/<str:submodule_code>/", EngineSubmoduleDeleteView.as_view()),

    path("api/engine-activity/", EngineActivityListView.as_view()),
    path("api/engine-activity/create/", EngineActivityCreateView.as_view()),     
    path("api/engine-activity/<str:activity_code>/", EngineActivityDetailView.as_view()),
    path("api/engine-activity/update/<str:activity_code>/", EngineActivityUpdateView.as_view()),
    path("api/engine-activity/delete/<str:activity_code>/", EngineActivityDeleteView.as_view()),
    
    
    path('api/countries/', CountriesListView.as_view(), name='countries-list'),
    path('api/countries/create/', CountriesCreateView.as_view(), name='countries-create'),  
    path('api/countries/update/<str:country_code>/', CountriesUpdateView.as_view(), name='countries-update'),
    path('api/countries/delete/<str:country_code>/', CountriesDeleteView.as_view(), name='countries-delete'),
    
    
    path('api/advice_master/', AdvicemasterListView.as_view(), name='advice-list'),
    path('api/advice_master/detail/<str:advice_code>/', AdvicemasterDetailView.as_view(), name='advice-detail'),
    path('api/advice_master/create/', AdvicemasterCreateView.as_view(), name='advice-create'),
    path('api/advice_master/update/<str:advice_code>/', AdvicemasterUpdateView.as_view(), name='advice-update'),
    path('api/advice_master/delete/<str:advice_code>/', AdvicemasterDeleteView.as_view(), name='advice-delete'),

    path('api/company_master/', CompanyMasterListView.as_view(), name='company-master-list'),
    path('api/company_master/detail/<str:company_code>/', CompanyMasterDetailView.as_view(), name='company-master-detail'),
    path('api/company_master/create/', CompanyMasterCreateView.as_view(), name='company-master-create'),
    path('api/company_master/update/<str:company_code>/', CompanyMasterUpdateView.as_view(), name='company-master-update'),
    path('api/company_master/delete/<str:company_code>/', CompanyMasterDeleteView.as_view(), name='company-master-delete'),

    path('api/employee_master/', EmployeeMasterListView.as_view(), name='employee-master-list'),
    path('api/employee_master/detail/<str:employee_code>/', EmployeeMasterDetailView.as_view(), name='employee-master-detail'),
    path('api/employee_master/create/', EmployeeMasterCreateView.as_view(), name='employee-master-create'),
    path('api/employee_master/update/<str:employee_code>/', EmployeeMasterUpdateView.as_view(), name='employee-master-update'),
    path('api/employee_master/delete/<str:employee_code>/', EmployeeMasterDeleteView.as_view(), name='employee-master-delete'),

    path('api/marital_status_master/', MaritalStatusMasterListView.as_view(), name='marital-status-list'),
    path('api/marital_status_master/detail/<str:marital_status_code>/', MaritalStatusMasterDetailView.as_view(), name='marital-status-detail'),
    path('api/marital_status_master/create/', MaritalStatusMasterCreateView.as_view(), name='marital-status-create'),
    path('api/marital_status_master/update/<str:marital_status_code>/', MaritalStatusMasterUpdateView.as_view(), name='marital-status-update'),
    path('api/marital_status_master/delete/<str:marital_status_code>/', MaritalStatusMasterDeleteView.as_view(), name='marital-status-delete'),
  
    path('api/relation_master/', RelationMasterListView.as_view(), name='relation-list'),
    path('api/relation_master/detail/<str:relation_code>/', RelationMasterDetailView.as_view(), name='realtion-detail'),
    path('api/relation_master/create/', RelationMasterCreateView.as_view(), name='relation-create'),
    path('api/relation_master/update/<str:relation_code>/', RelationMasterUpdateView.as_view(), name='relation-update'),
    path('api/relation_master/delete/<str:relation_code>/', RelationMasterDeleteView.as_view(), name='relation-delete'),

    path('api/departments/', DepartmentsListView.as_view(), name='departments-list'),
    path('api/departments/detail/<str:department_code>/', DepartmentsDetailView.as_view(), name='departments-detail'),
    path('api/departments/create/', DepartmentsCreateView.as_view(), name='departments-create'),
    path('api/departments/update/<str:department_code>/', DepartmentsUpdateView.as_view(), name='departments-update'),
    path('api/departments/delete/<str:department_code>/', DepartmentsDeleteView.as_view(), name='departments-delete'),

    path('api/blood_group_master/', BloodGroupMasterListView.as_view(), name='blood-group-master-list'),
    path('api/blood_group_master/detail/<str:blood_group_code>/', BloodGroupMasterDetailView.as_view(), name='blood-group-master-detail'),
    path('api/blood_group_master/create/', BloodGroupMasterCreateView.as_view(), name='blood-group-master-create'),
    path('api/blood_group_master/update/<str:blood_group_code>/', BloodGroupMasterUpdateView.as_view(), name='blood-group-master-update'),
    path('api/blood_group_master/delete/<str:blood_group_code>/', BloodGroupMasterDeleteView.as_view(), name='blood-group-master-delete'),

    path("api/blood_donor/", BloodDonorListView.as_view(), name="blood-donor-list"),
    path("api/blood_donor/detail/<int:pk>/", BloodDonorDetailView.as_view(), name="blood-donor-detail"),
    path("api/blood_donor/create/", BloodDonorCreateView.as_view(), name="blood-donor-create"),
    path("api/blood_donor/update/<int:pk>/", BloodDonorUpdateView.as_view(), name="blood-donor-update"),
    path("api/blood_donor/delete/<int:pk>/", BloodDonorDeleteView.as_view(), name="blood-donor-delete"),

    path('api/bankdetails/', BankdetailsListView.as_view(), name='bankdetails-list'),
    path('api/bankdetails/detail/<str:bank_code>/', BankdetailsDetailView.as_view(), name='bankdetails-detail'),
    path('api/bankdetails/create/', BankdetailsCreateView.as_view(), name='bankdetails-create'),
    path('api/bankdetails/update/<str:bank_code>/', BankdetailsUpdateView.as_view(), name='bankdetails-update'),
    path('api/bankdetails/delete/<str:bank_code>/', BankdetailsDeleteView.as_view(), name='bankdetails-delete'),

    path("api/bed_allotment/", BedAllotmentListView.as_view(), name="bed-allotment-list"),
    path("api/bed_allotment/detail/<int:id>/", BedAllotmentDetailView.as_view(), name="bed-allotment-detail"),
    path("api/bed_allotment/create/", BedAllotmentCreateView.as_view(), name="bed-allotment-create"),
    path("api/bed_allotment/update/<int:id>/", BedAllotmentUpdateView.as_view(), name="bed-allotment-update"),
    path("api/bed_allotment/delete/<int:id>/", BedAllotmentDeleteView.as_view(), name="bed-allotment-delete"),

    path('api/patient/', PatientListView.as_view(), name='patient-list'),
    path('api/patient/detail/<str:patient_code>/', PatientDetailView.as_view(), name='patient-detail'),
    path('api/patient/create/', PatientCreateView.as_view(), name='patient-create'),
    path('api/patient/update/<str:patient_code>/', PatientUpdateView.as_view(), name='patient-update'),
    path('api/patient/delete/<str:patient_code>/', PatientDeleteView.as_view(), name='patient-delete'),
    

]