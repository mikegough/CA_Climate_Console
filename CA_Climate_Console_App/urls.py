from django.conf.urls import patterns, url

from CA_Climate_Console_App import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index')
)
