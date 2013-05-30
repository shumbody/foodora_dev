from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    (r'^$', 'django.views.generic.simple.direct_to_template', {'template': 'main.html'}),
    #url(r'^$', 'foodora_dev.views.home', name='home'),
    # url(r'^foodora_dev/', include('foodora_dev.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^search/', 'app.views.search', name='search'),
    url(r'^recommend/', 'app.views.recommend', name='recommend'),
    url(r'^random/', 'app.views.get_random', name='random'),
)

