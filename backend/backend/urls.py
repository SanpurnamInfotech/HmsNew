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




    
    path('api/settings/', SettingsListView.as_view(), name='settings-list'),
    path('api/settings/create/', SettingsCreateView.as_view(), name='settings-create'),
    path('api/settings/update/<int:setting_id>/', SettingsUpdateView.as_view(), name='settings-update'),
    path('api/settings/delete/<int:setting_id>/', SettingsDeleteView.as_view(), name='settings-delete'),
    path('api/settings/<int:setting_id>/', SettingsDetailView.as_view(), name='settings-detail'),
    
  

    path('api/ipd-registration/create/', IpdRegistrationCreateView.as_view()),
    path('api/ipd-registration/', IpdRegistrationListView.as_view()),
    path('api/ipd-registration/<str:ipd_registeration_code>/', IpdRegistrationDetailView.as_view()),
    path('api/ipd-registration/update/<str:ipd_registeration_code>/', IpdRegistrationUpdateView.as_view()),
    path('api/ipd-registration/delete/<str:ipd_registeration_code>/', IpdRegistrationDeleteView.as_view()),
    path('api/doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('api/patients/', PatientListView.as_view(), name='patient-list'),

    path("api/ipd-services/create/", IpdServicesCreateView.as_view()),
    path("api/ipd-services/", IpdServicesListView.as_view()),
    path("api/ipd-services/<str:service_id>/", IpdServicesDetailView.as_view()),
    path("api/ipd-services/update/<str:service_id>/", IpdServicesUpdateView.as_view()),
    path("api/ipd-services/delete/<str:service_id>/", IpdServicesDeleteView.as_view()),

    path('api/mse_master/', MseMasterListView.as_view(), name='mse-list'),
    path('api/mse_master/create/', MseMasterCreateView.as_view(), name='mse-create'),
    path('api/mse_master/update/<str:mse_code>/', MseMasterUpdateView.as_view(), name='mse-update'),
    path('api/mse_master/delete/<str:mse_code>/', MseMasterDeleteView.as_view(), name='mse-delete'),
    
    path('api/complaints/', ComplaintListView.as_view(), name='complaint-list'),
    path('api/complaints/create/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('api/complaints/update/<str:complaint_code>/', ComplaintUpdateView.as_view(), name='complaint-update'),
    path('api/complaints/delete/<str:complaint_code>/', ComplaintDeleteView.as_view(), name='complaint-delete'),

   

    # API-prefixed routes (frontend uses baseURL + endpoint, ensure /api/expenses/ is reachable)
    path('api/expenses/', ExpensesListView.as_view(), name='expenses-list'),
    path('api/expenses/create/', ExpensesCreateView.as_view(), name='expenses-create'),
    path('api/expenses/update/<str:expenses_code>/', ExpensesUpdateView.as_view(), name='expenses-update'),
    path('api/expenses/delete/<str:expenses_code>/', ExpensesDeleteView.as_view(), name='expenses-delete'),
    
    # Thought Content Master CRUD
    path('api/thought_content_master/', ThoughtContentListView.as_view(), name='thoughtcontent-list'),
    path('api/thought_content_master/create/', ThoughtContentListView.as_view(), name='thoughtcontent-create'),
    path('api/thought_content_master/update/<str:thought_content_code>/', ThoughtContentDetailView.as_view(), name='thoughtcontent-update'),
    path('api/thought_content_master/delete/<str:thought_content_code>/', ThoughtContentDetailView.as_view(), name='thoughtcontent-delete'),
    
    # Noticeboard CRUD
    path('api/noticeboard/', NoticeboardListView.as_view(), name='noticeboard-list'),
    path('api/noticeboard/create/', NoticeboardListView.as_view(), name='noticeboard-create'),
    path('api/noticeboard/update/<str:notice_code>/', NoticeboardDetailView.as_view(), name='noticeboard-update'),
    path('api/noticeboard/delete/<str:notice_code>/', NoticeboardDetailView.as_view(), name='noticeboard-delete'),


    # Mood History API Routes
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

# path('api/doctors/', DoctorListView.as_view(), name='doctors-list'),
    path('api/doctors/create/', DoctorCreateView.as_view(), name='doctors-create'),
    path('api/doctors/update/<str:doctor_code>/', DoctorUpdateView.as_view(), name='doctors-update'),
    path('api/doctors/delete/<str:doctor_code>/', DoctorDeleteView.as_view(), name='doctors-delete'),

    path('api/departments/', DepartmentsListView.as_view(), name='departments-list'),
    path('api/departments/detail/<str:department_code>/', DepartmentsDetailView.as_view(), name='departments-detail'),
    path('api/departments/create/', DepartmentsCreateView.as_view(), name='departments-create'),
    path('api/departments/update/<str:department_code>/', DepartmentsUpdateView.as_view(), name='departments-update'),
    path('api/departments/delete/<str:department_code>/', DepartmentsDeleteView.as_view(), name='departments-delete'),

 
]



    
    
