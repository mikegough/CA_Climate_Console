from django.conf.urls import patterns, url

from CA_Climate_Console_App import views

urlpatterns = patterns('',
    url(r'^downscale$', views.downscale, name='downscale'),
    url(r'^generate_eems_tree$', views.generate_eems_tree, name='generate_eems_tree'),
    url(r'^(?i)ca$', views.index, name='ca'),
    url(r'^(?i)conus$', views.view3, name='conus'),
    url(r'^(?i)california$', views.index, name='ca'),
    url(r'^(?i)drecp$', views.index, name='drecp'),
    url(r'^(?i)multi-lcc$', views.view2, name='multi-lcc'),
    url(r'^(?i)multilcc$', views.view2, name='multi-lcc'),
    url(r'^multi-lcc_1$', views.index, name='multi-lcc'),
    url(r'^multilcc_1$', views.index, name='multi-lcc'),
    url(r'^(?i)sagebrush$', views.index, name='sagebrush'),
    url(r'^get_ecosystem_services_data$', views.get_ecosystem_services_data, name='ecosystem_servies'),
    url(r'', views.index, name='ca'),
)
