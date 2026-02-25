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
    
    path('api/medicine/', medicine_list, name='medicine-list'),
    path('api/medicine/create/', medicine_create, name='medicine-create'),
    path('api/medicine/update/<str:medicine_code>/', medicine_update, name='medicine-update'),
    path('api/medicine/delete/<str:medicine_code>/', medicine_delete, name='medicine-delete'),
    
    
    path('api/medicine-category/', medicine_category_list, name='medicine-category-list'),
    path('api/medicine-category/create/', medicine_category_create, name='medicine-category-create'),
    path('api/medicine-category/update/<str:medicine_cat_code>/', medicine_category_update, name='medicine-category-update'),
    path('api/medicine-category/delete/<str:medicine_cat_code>/', medicine_category_delete, name='medicine-category-delete'),

    path('api/ipd-registration/create/', IpdRegistrationCreateView.as_view()),
    path('api/ipd-registration/list/', IpdRegistrationListView.as_view()),
    path('api/ipd-registration/<str:ipd_registeration_code>/', IpdRegistrationDetailView.as_view()),
    path('api/ipd-registration/update/<str:ipd_registeration_code>/', IpdRegistrationUpdateView.as_view()),
    path('api/ipd-registration/delete/<str:ipd_registeration_code>/', IpdRegistrationDeleteView.as_view()),


]



    
    
