from django.urls import path
from .views import *
from .api_views import *
# आधीचे class-based import काढून टाका
# from .api_views import RoomTypeMasterListView, RoomTypeMasterCreateView, RoomTypeMasterUpdateView, RoomTypeMasterDeleteView

# याची जागा हा import वापरा
from .api_views import (
    room_type_master_list,
    room_type_master_create,
    room_type_master_update,
    room_type_master_delete
)

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



    # ICD MASTER

    path('api/icd-master/', icdmaster_list, name='icdmaster-list'),
    path('api/icd-master/detail/<str:icd_code>/', icdmaster_detail, name='icdmaster-detail'),
    path('api/icd-master/create/', icdmaster_create, name='icdmaster-create'),
    path('api/icd-master/update/<str:icd_code>/', icdmaster_update, name='icdmaster-update'),
    path('api/icd-master/delete/<str:icd_code>/', icdmaster_delete, name='icdmaster-delete'),

    
    path('api/room-type-master/', room_type_master_list, name='roomtype-list'),
    path('api/room-type-master/create/', room_type_master_create, name='roomtype-create'),
    path('api/room-type-master/update/<str:room_type_code>/', room_type_master_update, name='roomtype-update'),
    path('api/room-type-master/delete/<str:room_type_code>/', room_type_master_delete, name='roomtype-delete'),


    path('api/bed-master/', bed_master_list),
    path('api/bed-master/create/', bed_master_create),
    path('api/bed-master/update/<str:bed_code>/', bed_master_update),
    path('api/bed-master/delete/<str:bed_code>/', bed_master_delete),

    path('api/habit-master/', habit_master_list, name='habit-master-list'),
    path('api/habit-master/create/', habit_master_create, name='habit-master-create'),
    path('api/habit-master/update/<str:habit_code>/', habit_master_update, name='habit-master-update'),
    path('api/habit-master/delete/<str:habit_code>/', habit_master_delete, name='habit-master-delete'),

    path('api/hallucination-master/', hallucination_master_list, name='hallucination-master-list'),
    path('api/hallucination-master/create/', hallucination_master_create, name='hallucination-master-create'),
    path('api/hallucination-master/update/<str:hallucination_code>/', hallucination_master_update, name='hallucination-master-update'),
    path('api/hallucination-master/delete/<str:hallucination_code>/', hallucination_master_delete, name='hallucination-master-delete'),

    path('api/history-master/', history_master_list, name='history-master-list'),
    path('api/history-master/create/', history_master_create, name='history-master-create'),
    path('api/history-master/update/<str:history_code>/', history_master_update, name='history-master-update'),
    path('api/history-master/delete/<str:history_code>/', history_master_delete, name='history-master-delete'),


    path('api/mental-illness-master/',mental_illness_master_list,name='mental-illness-master-list'),
    path('api/mental-illness-master/create/',mental_illness_master_create,name='mental-illness-master-create'),
    path('api/mental-illness-master/update/<str:mental_illness_code>/',mental_illness_master_update, name='mental-illness-master-update'),
    path('api/mental-illness-master/delete/<str:mental_illness_code>/',mental_illness_master_delete,name='mental-illness-master-delete'),

        
    path('api/dsm-master/', dsm_master_list, name='dsm-master-list'),
    path('api/dsm-master/create/', dsm_master_create, name='dsm-master-create'),
    path('api/dsm-master/update/<str:dsm_code>/', dsm_master_update, name='dsm-master-update'),
    path('api/dsm-master/delete/<str:dsm_code>/', dsm_master_delete, name='dsm-master-delete'),


]



    
    
