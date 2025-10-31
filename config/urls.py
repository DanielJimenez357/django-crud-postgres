"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from libros import views as vistas
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name="login"),
    path('logout/', auth_views.LogoutView.as_view(), name="logout"),
    path("registrarse/", vistas.registrarse,  name="registrarse"),
    path("", vistas.home,  name="home"),
    path("libreria/", vistas.libreria,  name="libreria"),
    path("nuevolibro/", vistas.nuevoLibro,  name="nuevoLibro"),
    path("borrar/<str:id>", vistas.borrar,  name="borrar"),
    path("editar/<str:id>", vistas.editarLibro,  name="editar"),
    path("detalle/<str:id>", vistas.detalles,  name="detalles"),
    path("lista/api/", vistas.listaApi,  name="api"),
    path("fetch/", vistas.fetch_API, name="fetch"),
    path("perfil/", vistas.perfil, name="perfil"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
