from django.urls import path
from .views import *
from .api_views import *


urlpatterns = [
    
    path('api/', getRoutes),
    
    path("api/admin-login/", LoginView.as_view(), name="admin-login"),
    path("api/admin-register/", RegisterView.as_view(), name="admin-register"),
    
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

    # fixed routes first
    path('api/mental-illness-master/create/', MentalIllnessMasterCreateView.as_view()),
    path('api/mental-illness-master/update/<str:mental_illness_code>/', MentalIllnessMasterUpdateView.as_view()),
    path('api/mental-illness-master/delete/<str:mental_illness_code>/', MentalIllnessMasterDeleteView.as_view()),

    # dynamic route always last
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

    path('api/possession/', PossessionMasterListView.as_view(), name='possession-list'),
    path('api/possession/create/', PossessionMasterCreateView.as_view(), name='possession-create'),
    path('api/possession/detail/<str:possession_code>/', PossessionMasterDetailView.as_view(), name='possession-detail'),
    path('api/possession/update/<str:possession_code>/', PossessionMasterUpdateView.as_view(), name='possession-update'),
    path('api/possession/delete/<str:possession_code>/', PossessionMasterDeleteView.as_view(), name='possession-delete'),


    path('api/prescriptions/',PrescriptionListView.as_view(), name='prescription-list'),
    path('api/prescriptions/create/',PrescriptionCreateView.as_view(), name='prescription-create'),
    path('api/prescriptions/detail/<str:prescription_code>/',PrescriptionDetailView.as_view(), name='prescription-detail'),
    path('api/prescriptions/update/<str:prescription_code>/',PrescriptionUpdateView.as_view(), name='prescription-update'),
    path('api/prescriptions/delete/<str:prescription_code>/',PrescriptionDeleteView.as_view(), name='prescription-delete'),

    # This is the specific endpoint used by your PrescriptionReport.jsx
    path('api/prescription-report/<str:prescription_code>/',PrescriptionDetailView.as_view(), name='prescription-report-data'),
    
    
    
    path('api/cities/', CitiesListView.as_view(), name='cities-list'),
    path('api/cities/create/', CitiesCreateView.as_view(), name='cities-create'),
    path('api/cities/update/<str:city_code>/', CitiesUpdateView.as_view(), name='cities-update'),
    path('api/cities/delete/<str:city_code>/', CitiesDeleteView.as_view(), name='cities-delete'),

    path('api/states/', StatesListView.as_view(), name='states-list'),
    path('api/states/create/', StatesCreateView.as_view(), name='states-create'),
    path('api/states/update/<str:state_code>/', StatesUpdateView.as_view(), name='states-update'),
    path('api/states/delete/<str:state_code>/', StatesDeleteView.as_view(), name='states-delete'),

    path('api/districts/', DistrictsListView.as_view(), name='districts-list'),
    path('api/districts/create/', DistrictsCreateView.as_view(), name='districts-create'),
    path('api/districts/update/<str:district_code>/', DistrictsUpdateView.as_view(), name='districts-update'),
    path('api/districts/delete/<str:district_code>/', DistrictsDeleteView.as_view(), name='districts-delete'),
    
    path('api/mood-history/', MoodHistoryListView.as_view(), name='moodhistory-list'),
    path('api/mood-history/create/', MoodHistoryCreateView.as_view(), name='moodhistory-create'),
    path('api/mood-history/<str:mood_history_code>/', MoodHistoryDetailView.as_view(), name='moodhistory-detail'),
    path('api/mood-history/update/<str:mood_history_code>/', MoodHistoryUpdateView.as_view(), name='moodhistory-update'),
    path('api/mood-history/delete/<str:mood_history_code>/', MoodHistoryDeleteView.as_view(), name='moodhistory-delete'),
    
    path('api/expenses/', ExpensesListView.as_view(), name='expenses-list'),
    path('api/expenses/create/', ExpensesCreateView.as_view(), name='expenses-create'),
    path('api/expenses/update/<str:expenses_code>/', ExpensesUpdateView.as_view(), name='expenses-update'),
    path('api/expenses/delete/<str:expenses_code>/', ExpensesDeleteView.as_view(), name='expenses-delete'),
    
    path('api/mse_master/', MseMasterListView.as_view(), name='mse_master-list'),
    path('api/mse_master/create/', MseMasterCreateView.as_view(), name='mse_master-create'),
    path('api/mse_master/update/<str:mse_code>/', MseMasterUpdateView.as_view(), name='mse_master-update'),
    path('api/mse_master/delete/<str:mse_code>/', MseMasterDeleteView.as_view(), name='mse_master-delete'),
    
    # Thought Content Master CRUD
    path('api/thought_content_master/', ThoughtContentListView.as_view(), name='thoughtcontent-list'),
    path('api/thought_content_master/create/', ThoughtContentListView.as_view(), name='thoughtcontent-create'),
    path('api/thought_content_master/update/<str:thought_content_code>/', ThoughtContentDetailView.as_view(), name='thoughtcontent-update'),
    path('api/thought_content_master/delete/<str:thought_content_code>/', ThoughtContentDetailView.as_view(), name='thoughtcontent-delete'),
    
    
    path('api/complaints/', ComplaintListView.as_view(), name='complaint-list'),
    path('api/complaints/create/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('api/complaints/update/<str:complaint_code>/', ComplaintUpdateView.as_view(), name='complaint-update'),
    path('api/complaints/delete/<str:complaint_code>/', ComplaintDeleteView.as_view(), name='complaint-delete'),
    
    path('api/financialyear-master/',FinancialyearMasterListView.as_view(),name='financialyear-master-list'),
    path('api/financialyear-master/create/',FinancialyearMasterCreateView.as_view(),name='financialyear-master-create'),
    path('api/financialyear-master/update/<str:financialyear_code>/',FinancialyearMasterUpdateView.as_view(),name='financialyear-master-update'),
    path('api/financialyear-master/delete/<str:financialyear_code>/',FinancialyearMasterDeleteView.as_view(),name='financialyear-master-delete'),
    path('api/financialyear-master/<str:financialyear_code>/',FinancialyearMasterDetailView.as_view(),name='financialyear-master-detail'),
    


]



    
    
