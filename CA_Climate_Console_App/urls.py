from django.conf.urls import patterns, url

from CA_Climate_Console_App import views

urlpatterns = patterns('',
    url(r'^downscale$', views.downscale, name='downscale'),
    url(r'^generate_eems_tree$', views.generate_eems_tree, name='generate_eems_tree'),
    url(r'^ca$', views.index, name='ca'),
    url(r'^california$', views.index, name='ca'),
    url(r'^drecp$', views.index, name='drecp'),
    url(r'^multi-lcc$', views.view2, name='multi-lcc'),
    url(r'^multilcc$', views.view2, name='multi-lcc'),
    url(r'^multi-lcc_1$', views.index, name='multi-lcc'),
    url(r'^multilcc_1$', views.index, name='multi-lcc'),
    url(r'^get_ecosystem_services_data$', views.get_ecosystem_services_data, name='ecosystem_servies'),
    url(r'', views.index, name='ca'),
)
