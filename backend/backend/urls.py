from django.urls import path
from .views import *
from .api_views import *


urlpatterns = [
    
    path('api/', getRoutes),
    
    path("api/admin-login/", LoginView.as_view(), name="admin-login"),
    path("api/admin-register/", RegisterView.as_view(), name="admin-register"),
    

    path('api/available_urls/', AvailableURLsView.as_view(), name='available_urls'),
    
    # path('api/settings/', SettingsListView.as_view(), name='settings-list'),
    # path('api/settings/create/', SettingsCreateView.as_view(), name='settings-create'),
    # path('api/settings/<int:setting_id>/', SettingsDetailView.as_view(), name='settings-detail'),
    # path('api/settings/update/<int:setting_id>/', SettingsUpdateView.as_view(), name='settings-update'),
    # path('api/settings/delete/<int:setting_id>/', SettingsDeleteView.as_view(), name='settings-delete'),

   
    

    
    path("api/engine-module/", EngineModuleListView.as_view()),
    path("api/engine-module/create/", EngineModuleCreateView.as_view()),
    path("api/engine-module/<str:module_code>/", EngineModuleDetailView.as_view()),
    path("api/engine-module/update/<str:module_code>/", EngineModuleUpdateView.as_view()),
    path("api/engine-module/delete/<str:module_code>/", EngineModuleDeleteView.as_view()),
   
   path('api/universal-permissions/', UniversalPermissionsView.as_view(), name='universal-permissions'),

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
    path("api/blood_donor/detail/<str:blood_group_code>/", BloodDonorDetailView.as_view(), name="blood-donor-detail"),
    path("api/blood_donor/create/", BloodDonorCreateView.as_view(), name="blood-donor-create"),
    path("api/blood_donor/update/<str:blood_group_code>/", BloodDonorUpdateView.as_view(), name="blood-donor-update"),
    path("api/blood_donor/delete/<str:blood_group_code>/", BloodDonorDeleteView.as_view(), name="blood-donor-delete"),

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
    
    path('api/patient-dates/<str:patient_code>/', PatientPrescriptionDatesView.as_view(), name='patient-dates'),
    
    path('api/prescription-report/', PrescriptionReportView.as_view(), name='prescription-report'),
    # path('api/prescription-pdf/', PrescriptionPDFView.as_view(), name='prescription-pdf'),
    
    path('api/mood-history/', MoodHistoryListView.as_view(), name='mood-history-list'),
    path('api/mood-history/create/', MoodHistoryCreateView.as_view(), name='mood-history-create'),
    path('api/mood-history/update/<str:mood_history_code>/', MoodHistoryUpdateView.as_view(), name='mood-history-update'),
    path('api/mood-history/delete/<str:mood_history_code>/', MoodHistoryDeleteView.as_view(), name='mood-history-delete'),

    path('api/states/', StatesListView.as_view(), name='states-list'),
    path('api/states/create/', StatesCreateView.as_view(), name='states-create'),
    path('api/states/update/<str:state_code>/', StatesUpdateView.as_view(), name='states-update'),
    path('api/states/delete/<str:state_code>/', StatesDeleteView.as_view(), name='states-delete'),

    path('api/districts/', DistrictsListView.as_view(), name='districts-list'),
    path('api/districts/create/',  DistrictsCreateView.as_view(),  name='districts-create'),
    path('api/districts/update/<str:district_code>/',  DistrictsUpdateView.as_view(),  name='districts-update'),
    path('api/districts/delete/<str:district_code>/', DistrictsDeleteView.as_view(),  name='districts-delete'),


    path('api/cities/', CitiesListView.as_view(), name='cities-list'),
    path('api/cities/create/', CitiesCreateView.as_view(), name='cities-create'),
    path('api/cities/update/<str:city_code>/', CitiesUpdateView.as_view(), name='cities-update'),
    path('api/cities/delete/<str:city_code>/', CitiesDeleteView.as_view(), name='cities-delete'),


    path('api/mood-history/', MoodHistoryListView.as_view(), name='mood-history-list'),
    path('api/mood-history/create/', MoodHistoryCreateView.as_view(), name='mood-history-create'),
    path('api/mood-history/update/<str:mood_history_code>/', MoodHistoryUpdateView.as_view(), name='mood-history-update'),
    path('api/mood-history/delete/<str:mood_history_code>/', MoodHistoryDeleteView.as_view(), name='mood-history-delete'),
    
    path('api/aadhaar-otp-request/', AadhaarOTPRequestView.as_view(), name='aadhaar-otp-request'),

    path('api/aadhaar-verify-otp/', AadhaarVerifyView.as_view(), name='aadhaar-verify-otp'),
    
    path('api/icd-master/', IcdMasterListView.as_view()),
    path('api/icd-master/create/', IcdMasterCreateView.as_view()),
    path('api/icd-master/update/<str:icd_code>/', IcdMasterUpdateView.as_view()),
    path('api/icd-master/delete/<str:icd_code>/', IcdMasterDeleteView.as_view()),
    path('api/icd-master/<str:icd_code>/', IcdMasterDetailView.as_view()),

    path('api/room-type-master/', RoomTypeMasterListView.as_view()),
    path('api/room-type-master/create/', RoomTypeMasterCreateView.as_view()),
    path('api/room-type-master/update/<str:room_type_code>/', RoomTypeMasterUpdateView.as_view()),
    path('api/room-type-master/delete/<str:room_type_code>/', RoomTypeMasterDeleteView.as_view()),
    path('api/room-type-master/<str:room_type_code>/', RoomTypeMasterDetailView.as_view()),

    path('api/bed/', BedListView.as_view(), name='bed-list'),
    path('api/bed/create/', BedCreateView.as_view(), name='bed-create'),
    path('api/bed/update/<str:bed_code>/', BedUpdateView.as_view(), name='bed-update'),
    path('api/bed/delete/<str:bed_code>/', BedDeleteView.as_view(), name='bed-delete'),
    path('api/bed/<str:bed_code>/', BedDetailView.as_view(), name='bed-detail'),

    path('api/habit-master/', HabitMasterListView.as_view()),
    path('api/habit-master/create/', HabitMasterCreateView.as_view()),
    path('api/habit-master/update/<str:habit_code>/', HabitMasterUpdateView.as_view()),
    path('api/habit-master/delete/<str:habit_code>/', HabitMasterDeleteView.as_view()),
    path('api/habit-master/<str:habit_code>/', HabitMasterDetailView.as_view()),
    
    path('api/hallucination-master/create/', HallucinationMasterCreateView.as_view(), name='hallucination-master-create'),
    path('api/hallucination-master/update/<str:hallucination_code>/', HallucinationMasterUpdateView.as_view(), name='hallucination-master-update'),
    path('api/hallucination-master/delete/<str:hallucination_code>/', HallucinationMasterDeleteView.as_view(), name='hallucination-master-delete'),
    path('api/hallucination-master/<str:hallucination_code>/', HallucinationMasterDetailView.as_view(), name='hallucination-master-detail'),
    path('api/hallucination-master/', HallucinationMasterListView.as_view(), name='hallucination-master-list'),
    
    path('api/history-master/', HistoryMasterListView.as_view()),
    path('api/history-master/create/', HistoryMasterCreateView.as_view()),
    path('api/history-master/update/<str:history_code>/', HistoryMasterUpdateView.as_view()),
    path('api/history-master/delete/<str:history_code>/', HistoryMasterDeleteView.as_view()),
    path('api/history-master/<str:history_code>/', HistoryMasterDetailView.as_view()),

    path('api/mental-illness-master/', MentalIllnessMasterListView.as_view()),
    path('api/mental-illness-master/create/', MentalIllnessMasterCreateView.as_view()),
    path('api/mental-illness-master/update/<str:mental_illness_code>/', MentalIllnessMasterUpdateView.as_view()),
    path('api/mental-illness-master/delete/<str:mental_illness_code>/', MentalIllnessMasterDeleteView.as_view()),
    path('api/mental-illness-master/<str:mental_illness_code>/', MentalIllnessMasterDetailView.as_view()),

        
    
    path('api/dsm-master/', DsmMasterListView.as_view()),
    path('api/dsm-master/create/', DsmMasterCreateView.as_view()),
    path('api/dsm-master/update/<str:dsm_code>/', DsmMasterUpdateView.as_view()),
    path('api/dsm-master/delete/<str:dsm_code>/', DsmMasterDeleteView.as_view()),
    path('api/dsm-master/<str:dsm_code>/', DsmMasterDetailView.as_view()),



    path('api/premorbid-personality-master/',PremorbidPersonalityMasterListView.as_view(),name='premorbid-personality-master-list'),
    path('api/premorbid-personality-master/create/',PremorbidPersonalityMasterCreateView.as_view(),name='premorbid-personality-master-create'),
    path('api/premorbid-personality-master/update/<str:premorbid_personality_code>/',PremorbidPersonalityMasterUpdateView.as_view(),name='premorbid-personality-master-update'),
    path('api/premorbid-personality-master/delete/<str:premorbid_personality_code>/',PremorbidPersonalityMasterDeleteView.as_view(),name='premorbid-personality-master-delete'),
    path('api/premorbid-personality-master/<str:premorbid_personality_code>/',PremorbidPersonalityMasterDetailView.as_view(),name='premorbid-personality-master-detail'),
    
    path('api/possession-master/', PossessionMasterListView.as_view(), name='possession-master-list'),
    path('api/possession-master/create/', PossessionMasterCreateView.as_view(), name='possession-master-create'),
    path('api/possession-master/update/<str:possession_code>/', PossessionMasterUpdateView.as_view(), name='possession-master-update'),
    path('api/possession-master/delete/<str:possession_code>/', PossessionMasterDeleteView.as_view(), name='possession-master-delete'),
    path('api/possession-master/<str:possession_code>/', PossessionMasterDetailView.as_view(), name='possession-master-detail'),    
        
    path('api/financialyear-master/',FinancialyearMasterListView.as_view(),name='financialyear-master-list'),
    path('api/financialyear-master/create/',FinancialyearMasterCreateView.as_view(),name='financialyear-master-create'),
    path('api/financialyear-master/update/<str:financialyear_code>/',FinancialyearMasterUpdateView.as_view(),name='financialyear-master-update'),
    path('api/financialyear-master/delete/<str:financialyear_code>/',FinancialyearMasterDeleteView.as_view(),name='financialyear-master-delete'),
    path('api/financialyear-master/<str:financialyear_code>/',FinancialyearMasterDetailView.as_view(),name='financialyear-master-detail'),
    
    
    path('api/settings/', SettingsListView.as_view(), name='settings-list'),
    path('api/settings/create/', SettingsCreateView.as_view(), name='settings-create'),
    path('api/settings/update/<int:setting_id>/', SettingsUpdateView.as_view(), name='settings-update'),
    path('api/settings/delete/<int:setting_id>/', SettingsDeleteView.as_view(), name='settings-delete'),
    path('api/settings/<int:setting_id>/', SettingsDetailView.as_view(), name='settings-detail'),
    
    path('api/medicine/', MedicineListView.as_view(), name='medicine-list'),
    path('api/medicine/create/',MedicineCreateView.as_view(),name='medicine-create'),
    path('api/medicine/update/<str:medicine_code>/',MedicineUpdateView.as_view(),name='medicine-update'),
    path('api/medicine/delete/<str:medicine_code>/',MedicineDeleteView.as_view(),name='medicine-delete'),
    path('api/medicine/<str:medicine_code>/',MedicineDetailView.as_view(),name='medicine-detail'),
        
    
    path("api/medicine-category/",MedicineCategoryListView.as_view(),name="medicine-category-list"),
    path("api/medicine-category/create/",MedicineCategoryCreateView.as_view(),name="medicine-category-create"),
    path("api/medicine-category/<str:medicine_cat_code>/",MedicineCategoryDetailView.as_view(),name="medicine-category-detail"),
    path("api/medicine-category/update/<str:medicine_cat_code>/",MedicineCategoryUpdateView.as_view(),name="medicine-category-update"),
    path("api/medicine-category/delete/<str:medicine_cat_code>/",MedicineCategoryDeleteView.as_view(),name="medicine-category-delete"),
    
    
    path("api/appointment-type-master/",AppointmentTypeMasterListView.as_view()),
    path("api/appointment-type-master/create/",AppointmentTypeMasterCreateView.as_view()),
    path("api/appointment-type-master/<str:appointment_type_code>/",AppointmentTypeMasterDetailView.as_view()),
    path("api/appointment-type-master/update/<str:appointment_type_code>/",AppointmentTypeMasterUpdateView.as_view()),
    path("api/appointment-type-master/delete/<str:appointment_type_code>/",AppointmentTypeMasterDeleteView.as_view()),
    
    
    path('api/appointment/',AppointmentListView.as_view(),name='appointment-list'),
    path('api/appointment/create/',AppointmentCreateView.as_view(),name='appointment-create'),
    path('api/appointment/<str:appointment_code>/',AppointmentDetailView.as_view(),name='appointment-detail'),
    path('api/appointment/update/<str:appointment_code>/',AppointmentUpdateView.as_view(),name='appointment-update'),
    path('api/appointment/delete/<str:appointment_code>/',AppointmentDeleteView.as_view(),name='appointment-delete'),
    
    
    path('api/transactions/', TransactionsListView.as_view(), name='transactions-list'),
    path('api/transactions/create/', TransactionsCreateView.as_view(), name='transactions-create'),
    path('api/transactions/update/<str:transaction_code>/', TransactionsUpdateView.as_view(), name='transactions-update'),
    path('api/transactions/delete/<str:transaction_code>/', TransactionsDeleteView.as_view(), name='transactions-delete'),
    path('api/transactions/<str:transaction_code>/', TransactionsDetailView.as_view(), name='transactions-detail'),
    
    
     path('api/ect/', EctListView.as_view(), name='ect-list'),
     path('api/ect/create/', EctCreateView.as_view(), name='ect-create'),
     path('api/ect/<str:ect_code>/', EctDetailView.as_view(), name='ect-detail'),
      path('api/ect/update/<str:ect_code>/', EctUpdateView.as_view(), name='ect-update'),
     path('api/ect/delete/<str:ect_code>/', EctDeleteView.as_view(), name='ect-delete'),



    
    path('api/follow-up/', FollowUpListView.as_view(), name='followup-list'),
    path('api/follow-up/create/', FollowUpCreateView.as_view(), name='followup-create'),
    path('api/follow-up/<str:follow_up_code>/', FollowUpDetailView.as_view(), name='followup-detail'),
    path('api/follow-up/update/<str:follow_up_code>/', FollowUpUpdateView.as_view(), name='followup-update'),
    path('api/follow-up/delete/<str:follow_up_code>/', FollowUpDeleteView.as_view(), name='followup-delete'),


    path('api/account/',AccountListView.as_view(),name='account-list'),
    path('api/account/create/',AccountCreateView.as_view(),name='account-create'),
    path('api/account/update/<str:account_code>/',AccountUpdateView.as_view(),name='account-update'),
    path('api/account/delete/<str:account_code>/',AccountDeleteView.as_view(),name='account-delete'),
    path('api/account/<str:account_code>/',AccountDetailView.as_view(),name='account-detail' ),

    
    path('api/doctors/', DoctorListView.as_view(), name='doctors-list'),
    path('api/doctors/<str:doctor_code>/', DoctorDetailView.as_view(), name='doctors-detail'),
    path('api/doctors/create/', DoctorCreateView.as_view(), name='doctors-create'),
    path('api/doctors/update/<str:doctor_code>/', DoctorUpdateView.as_view(), name='doctors-update'),
    path('api/doctors/delete/<str:doctor_code>/', DoctorDeleteView.as_view(), name='doctors-delete'),


    path('api/hospital/',HospitalListView.as_view(),name='hospital-list'),
    path('api/hospital/create/',HospitalCreateView.as_view(),name='hospital-create'),
    path('api/hospital/update/<str:hospital_code>/',HospitalUpdateView.as_view(),name='hospital-update'),
    path('api/hospital/delete/<str:hospital_code>/',HospitalDeleteView.as_view(),name='hospital-delete'),
    path('api/hospital_details/', HospitalDetailsListView.as_view(), name='hospital_details_list'),\
    
    path('api/complaints/', ComplaintListView.as_view(), name='complaints-list'),
    path('api/complaints/create/', ComplaintCreateView.as_view(), name='complaints-create'),
    path('api/complaints/update/<str:complaint_code>/', ComplaintUpdateView.as_view(), name='complaints-update'),
    path('api/complaints/delete/<str:complaint_code>/', ComplaintDeleteView.as_view(), name='complaints-delete'),

     path('api/expenses/', ExpensesListView.as_view(), name='expenses-list'),
    path('api/expenses/create/', ExpensesCreateView.as_view(), name='expenses-create'),
    path('api/expenses/update/<str:expenses_code>/', ExpensesUpdateView.as_view(), name='expenses-update'),
    path('api/expenses/delete/<str:expenses_code>/', ExpensesDeleteView.as_view(), name='expenses-delete'),

     path('api/notices/', NoticeListView.as_view(), name='notices-list'),
    path('api/notices/create/', NoticeCreateView.as_view(), name='notices-create'),
    path('api/notices/update/<str:notice_code>/', NoticeUpdateView.as_view(), name='notices-update'),
    path('api/notices/delete/<str:notice_code>/', NoticeDeleteView.as_view(), name='notices-delete'),


    path('api/mse_master/', MseMasterListView.as_view(), name='mse-list'),
    path('api/mse_master/create/', MseMasterCreateView.as_view(), name='mse-create'),
    path('api/mse_master/update/<str:mse_code>/', MseMasterUpdateView.as_view(), name='mse-update'),
    path('api/mse_master/delete/<str:mse_code>/', MseMasterDeleteView.as_view(), name='mse-delete'),

    path('api/thought_content/', ThoughtContentListView.as_view(), name='thought-content-list'),
    path('api/thought_content/create/', ThoughtContentCreateView.as_view(), name='thought-content-create'),
    path('api/thought_content/update/<str:thought_content_code>/', ThoughtContentUpdateView.as_view(), name='thought-content-update'),
    path('api/thought_content/delete/<str:thought_content_code>/', ThoughtContentDeleteView.as_view(), name='thought-content-delete'),

    path('api/transaction-modes/', TransactionModeListView.as_view(), name='transaction-modes-list'),
    path('api/transaction-modes/create/', TransactionModeCreateView.as_view(), name='transaction-modes-create'),
    path('api/transaction-modes/update/<str:transaction_mode_code>/', TransactionModeUpdateView.as_view(), name='transaction-modes-update'),
    path('api/transaction-modes/delete/<str:transaction_mode_code>/', TransactionModeDeleteView.as_view(), name='transaction-modes-delete'),


    path('api/opd-casesheet/', OpdCasesheetListView.as_view(), name='opd-casesheet-list'),
    path('api/opd-casesheet/create/', OpdCasesheetCreateView.as_view(), name='opd-casesheet-create'),
    path('api/opd-casesheet/<str:opd_casesheet_code>/', OpdCasesheetDetailView.as_view(), name='opd-casesheet-detail'),
    path('api/opd-casesheet/update/<str:opd_casesheet_code>/', OpdCasesheetUpdateView.as_view(), name='opd-casesheet-update'),
    path('api/opd-casesheet/delete/<str:opd_casesheet_code>/', OpdCasesheetDeleteView.as_view(), name='opd-casesheet-delete'),
    
    path('api/discharge-summary/', DischargeSummaryListView.as_view(), name='discharge-summary-list'),
    path('api/discharge-summary/create/', DischargeSummaryCreateView.as_view(), name='discharge-summary-create'),
    path('api/discharge-summary/update/<str:discharge_summary_code>/', DischargeSummaryUpdateView.as_view(), name='discharge-summary-update'),
    path('api/discharge-summary/delete/<str:discharge_summary_code>/', DischargeSummaryDeleteView.as_view(), name='discharge-summary-delete'),
    
    
    path('api/designation/',DesignationListView.as_view(), name='designation-list'),
    path('api/designation/create/',DesignationCreateView.as_view(), name='designation-create'),
    path('api/designation/<str:designation_code>/',DesignationDetailView.as_view(), name='designation-detail'),
    path('api/designation/update/<str:designation_code>/',DesignationUpdateView.as_view(), name='designation-update'),
    path('api/designation/delete/<str:designation_code>/',DesignationDeleteView.as_view(), name='designation-delete'),
    
    path('api/division/',DivisionListView.as_view(), name='division-list'),
    path('api/division/create/',DivisionCreateView.as_view(), name='division-create'),
    path('api/division/<str:division_code>/',DivisionDetailView.as_view(), name='division-detail'),
    path('api/division/update/<str:division_code>/',DivisionUpdateView.as_view(), name='division-update'),
    path('api/division/delete/<str:division_code>/',DivisionDeleteView.as_view(), name='division-delete'),
    
    path('api/branches/', BranchListView.as_view(), name='branch-list'),
    path('api/branches/create/', BranchCreateView.as_view(), name='branch-create'),
    path('api/branches/<str:branch_code>/', BranchDetailView.as_view(), name='branch-detail'),
    path('api/branches/update/<str:branch_code>/', BranchUpdateView.as_view(), name='branch-update'),
    path('api/branches/delete/<str:branch_code>/', BranchDeleteView.as_view(), name='branch-delete'),
    
    path("api/blood_donors/", BloodDonorListView.as_view(), name="blood-donor-list"),
    path("api/blood_donors/detail/<str:blood_donor_code>/", BloodDonorDetailView.as_view(), name="blood-donor-detail"),
    path("api/blood_donors/create/", BloodDonorCreateView.as_view(), name="blood-donor-create"),
    path("api/blood_donors/update/<str:blood_donor_code>/", BloodDonorUpdateView.as_view(), name="blood-donor-update"),
    path("api/blood_donors/delete/<str:blood_donor_code>/", BloodDonorDeleteView.as_view(), name="blood-donor-delete"),
    
    path("api/opd_bill_master/", OpdBillMasterListView.as_view(), name="blood-donor-list"),
    path("api/opd_bill_master/detail/<str:opd_bill_code>/", OpdBillMasterDetailView.as_view(), name="opd_bill_detail"),
    path("api/opd_bill_master/create/", OpdBillMasterCreateView.as_view(), name="opd_bill_create"),
    path("api/opd_bill_master/update/<str:opd_bill_code>/", OpdBillMasterUpdateView.as_view(), name="opd_bill_update"),
    path("api/opd_bill_master/delete/<str:opd_bill_code>/", OpdBillMasterDeleteView.as_view(), name="opd_bill_delete"),
    
    
]





    
    
