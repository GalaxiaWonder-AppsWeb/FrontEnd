<template>
  <div class="toolbar-container">
    <!-- Parte superior fija -->    <pv-toolbar class="toolbar-top">
      <template #start>
        <div class="title-section">
          <!-- Botón de navegación hacia atrás, mostrado solo en vistas específicas -->
          <pv-button 
            v-if="showBackButton" 
            icon="pi pi-arrow-left" 
            class="p-button-text p-button-rounded back-button" 
            @click="navigateBack"
            aria-label="Volver"
            v-tooltip="$t('navigation.back')"
          />
          <!-- Enlace para volver a organizaciones cuando estamos en una organización específica -->
          <pv-button 
            v-if="inOrganizationView" 
            icon="pi pi-th-large" 
            :label="$t('organization.all')" 
            class="p-button-text organizations-link" 
            @click="goToOrganizationsList"
          />
          <h1 class="section-title">{{ $t(sectionTitle+'.title') }}</h1>
        </div>
      </template>
      <template #end>
        <NotificationBell v-if="isAuthenticated" />        <button @click="toggleProfileMenu" class="user-profile-button">          <img 
            v-if="currentUser && currentUser.profilePicture" 
            :src="currentUser.profilePicture" 
            @error="handleAvatarLoadError"
            alt="Profile Picture" 
            class="profile-avatar-image" 
          />
          <div v-else class="profile-avatar-placeholder">
            {{ getUserInitials() }}
          </div>
        </button>
        <div v-if="showProfileMenu" class="profile-menu" ref="profileMenu">          <div class="profile-info" v-if="currentUser">
            <span class="user-name">{{ currentUser.name }} {{ currentUser.lastName }}</span>
            <span class="user-email">{{ currentUser.email }}</span>
          </div>
          <div class="profile-actions">
            <button class="profile-action" @click="goToProfile">
              <i class="pi pi-user"></i>
              {{ $t('profile.view') }}
            </button>
            <button class="profile-action logout-button" @click="logout">
              <i class="pi pi-sign-out"></i>
              {{ $t('auth.logout') }}
            </button>
          </div>
        </div>
        <LanguageSwitcher />
      </template>
    </pv-toolbar>    <!-- Parte inferior: navegación dinámica -->    <nav class="toolbar-nav">
      <template v-if="inOrganizationView">
        <!-- Opciones siempre visibles para todos los miembros -->
        <pv-button text plain :label="$t(sectionTitle + '.section.information')" @click="goTo('information')" />
        <pv-button text plain :label="$t(sectionTitle + '.section.projects')" @click="goTo('projects')" />
        <pv-button text plain :label="$t(sectionTitle + '.section.members')" @click="goTo('members')" />
        
        <!-- Opciones solo para Contratista (creador) -->
        <pv-button v-if="isContractor" text plain :label="$t(sectionTitle + '.section.configurations')" @click="goTo('settings')" />
      </template>      <template v-else-if="inProjectView">
        <pv-button text plain :label="$t(sectionTitle + '.section.information')" @click="goTo('information')" />
        <pv-button text plain :label="$t(sectionTitle + '.section.schedule')" @click="goTo('schedule')" />
        <pv-button text plain :label="$t(sectionTitle + '.section.change-management')" @click="goTo('change-management')" />
        <pv-button v-if="isCoordinator" text plain :label="$t(sectionTitle + '.section.settings')" @click="goTo('settings')" />
      </template>

      <template v-else-if="inOrganizationGeneralView">
        <pv-button text plain :label="$t('navigation.dashboard.organizations')" @click="goTo('organizations')" />
        <pv-button text plain :label="$t('navigation.dashboard.invitations')" @click="goTo('invitations')" />
      </template>
    </nav>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from './language-switcher.component.vue'
import NotificationBell from '../../organizations/components/notification-bell.component.vue'
import { authService } from '../../iam/services/auth.service.js'

export default {
  name: 'ToolbarComponent',
  components: {
    LanguageSwitcher,
    NotificationBell
  },  data() {
    return {
      route: useRoute(),
      router: useRouter(),
      currentUser: null,
      isAuthenticated: false,
      showProfileMenu: false,
      isContractor: false,
      isCoordinator: false
    }
  },
  async mounted() {
    this.checkAuthentication();
    // Cerrar menú de perfil al hacer clic fuera
    document.addEventListener('click', this.handleClickOutside);
    
    // Verificar si el usuario es contratista
    if (this.inOrganizationView) {
      this.isContractor = await this.userHasRole('Contractor');
    }
  },  async created() {
    // Verificar el rol del usuario cuando se crea el componente
    if (this.inOrganizationView) {
      this.isContractor = await this.userHasRole('Contractor');
    }
    
    if (this.inProjectView) {
      this.isCoordinator = await this.userHasProjectRole('Coordinator');
    }
    
    // Vigilar cambios en la ruta para actualizar el rol
    this.$watch(
      () => this.route.params.orgId,
      async () => {
        if (this.inOrganizationView) {
          this.isContractor = await this.userHasRole('Contractor');
        }
      }
    );
    
    // Vigilar cambios en la ruta para actualizar el rol de proyecto
    this.$watch(
      () => this.route.params.projectId,
      async () => {
        if (this.inProjectView) {
          this.isCoordinator = await this.userHasProjectRole('Coordinator');
        }
      }
    );
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },  computed: {
    // Propiedad para determinar si se muestra el botón de regreso
    showBackButton() {
      // Mostrar en perfiles y vistas específicas
      return this.route.path === '/profile' || 
             this.inOrganizationView || 
             this.inProjectView;
    },
    
    inOrganizationView() {
      return this.route.path.startsWith('/organizations/') && !this.route.path.includes('/projects/');
    },
    inProjectView() {
      return this.route.path.includes('/projects/') || 
             (this.route.name === 'organization-specific-project' && this.route.params.projectId)
    },
    inOrganizationGeneralView(){
      return this.route.path.includes('/organizations') || this.route.path.includes('/invitations')
    },    sectionTitle() {
      if (this.inProjectView) return 'projects'
      if (this.inOrganizationView) return 'organization'
      return 'organization'
    }},
  async mounted() {
    this.checkAuthentication();
    // Cerrar menú de perfil al hacer clic fuera
    document.addEventListener('click', this.handleClickOutside);
    
    // Verificar si el usuario es contratista
    if (this.inOrganizationView) {
      this.isContractor = await this.userHasRole('Contractor');
    }
  },methods: {    /**
     * Verifica si el usuario actual tiene el rol especificado en la organización activa
     * @param {string} role - El rol a verificar (Contractor, Worker)
     * @returns {boolean} - true si el usuario tiene el rol, false en caso contrario
     */
    async userHasRole(role) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        return false;
      }
      
      // Si estamos verificando el rol de Contractor y tenemos un orgId
      if (role === 'Contractor' && this.inOrganizationView && this.route.params.orgId && user.personId) {
        try {
          // Verificar si el usuario es el creador de la organización
          const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/organizations/${this.route.params.orgId}`);
          if (response.ok) {
            const organization = await response.json();
            if (organization && organization.createdBy === user.personId) {
              // Si es el creador, establecer el rol como Contractor en localStorage
              if (!user.activeOrganizationRole || user.activeOrganizationRole !== 'Contractor') {
                user.activeOrganizationRole = 'Contractor';
                localStorage.setItem('user', JSON.stringify(user));
              }
              return true;
            }
          }
        } catch (error) {
          console.error('Error al verificar si el usuario es creador:', error);
        }
      }
      
      // Verificación normal por activeOrganizationRole
      return user.activeOrganizationRole === role;
    },
    
    /**
     * Verifica si el usuario actual tiene el rol especificado en el proyecto activo
     * @param {string} role - El rol a verificar (Coordinator, Specialist)
     * @returns {boolean} - true si el usuario tiene el rol, false en caso contrario
     */
    async userHasProjectRole(role) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        return false;
      }
      
      // Si el usuario es Contractor en la organización, automáticamente es Coordinator en el proyecto
      if (user.activeOrganizationRole === 'Contractor' && role === 'Coordinator') {
        // Establecer el rol de proyecto en localStorage si no está ya
        if (!user.activeProjectRole || user.activeProjectRole !== 'Coordinator') {
          user.activeProjectRole = 'Coordinator';
          localStorage.setItem('user', JSON.stringify(user));
        }
        return true;
      }
      
      // Verificación por activeProjectRole
      return user.activeProjectRole === role;
    },
    
    // Método para navegar hacia atrás o a una vista principal según corresponda
    navigateBack() {
      if (this.route.path === '/profile') {
        // Desde el perfil, regresar a la página anterior si existe, o a organizaciones
        if (window.history.length > 2) {
          this.router.go(-1);
        } else {
          this.router.push('/organizations');
        }
      } else if (this.inOrganizationView) {
        // Desde una organización, volver a la lista de organizaciones
        this.router.push('/organizations');
      } else if (this.inProjectView) {
        // Desde un proyecto, volver a la vista de proyectos de la organización
        const { orgId } = this.route.params;
        this.router.push(`/organizations/${orgId}/projects`);
      }
    },
    
    // Método directo para ir a la lista de organizaciones
    goToOrganizationsList() {
      this.router.push('/organizations');
    },
    
    goTo(section) {
      const { orgId, projectId } = this.route.params
      let path = ''
      if (this.inOrganizationGeneralView) {
        path = `/${section}`
      }
      if (this.inProjectView && projectId) {
        path = `/organizations/${orgId}/projects/${projectId}`
        if (section !== 'projects') {
          path += `/${section}`
        }
      } else if (this.inOrganizationView && orgId) {
        path = `/organizations/${orgId}/${section}`
      }
      this.router.push(path)
    },    async checkAuthentication() {
      try {
        // Verificar si el usuario está autenticado
        const isAuth = authService.isAuthenticated();
        this.isAuthenticated = isAuth;
        
        if (isAuth) {
          // Obtener la información del usuario actual
          this.currentUser = authService.getCurrentUser();
          
          // Si no hay información del usuario, usamos información por defecto
          if (!this.currentUser) {
            this.currentUser = { 
              name: "Usuario",
              lastName: "Autenticado",
              email: "usuario@ejemplo.com" 
            };
          } 
          else if (this.currentUser.personId && !this.currentUser.profilePicture) {
            // Si el usuario no tiene foto de perfil en localStorage, intentamos obtenerla
            try {
              const personData = await import('../../iam/services/person.service.js')
                .then(module => module.personService.getById(this.currentUser.personId));
                
              if (personData && personData.profilePicture) {
                // Actualizar el usuario en memoria y en localStorage
                this.currentUser.profilePicture = personData.profilePicture;
                localStorage.setItem('user', JSON.stringify(this.currentUser));
              }
            } catch (personError) {
              console.error("Error fetching user profile picture:", personError);
            }
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        this.isAuthenticated = false;
      }
    },
    
    toggleProfileMenu(event) {
      event.stopPropagation();
      this.showProfileMenu = !this.showProfileMenu;
    },
      handleClickOutside(event) {
      // Cerrar el menú del perfil cuando se hace clic fuera
      if (this.showProfileMenu && 
          !event.target.closest('.profile-menu') && 
          !event.target.closest('[icon="pi pi-user"]')) {
        this.showProfileMenu = false;
      }
    },    async logout() {
      try {
        // Limpiar el localStorage completamente para garantizar que no queden datos de sesión
        localStorage.clear();
        
        // También ejecutar el método de logout del servicio que elimina el usuario
        await authService.logout();
        
        this.$toast.add({
          severity: 'success',
          summary: this.$t('auth.logout_success'),
          life: 3000
        });
        
        // Redirigir al usuario a la página de login
        window.location.href = '/login'; // Usamos location.href para asegurarnos de un refresh completo
      } catch (error) {
        console.error("Error during logout:", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cerrar la sesión correctamente',
          life: 3000
        });
      }
    },    goToProfile() {
      this.showProfileMenu = false; // Cerrar el menú
      this.router.push('/profile');
      
      // Si estamos en alguna ruta que requiere un layout específico, 
      // necesitamos recargar para aplicar el layout de usuario
      if (this.inOrganizationView || this.inProjectView) {
        setTimeout(() => {
          window.location.href = '/profile'; 
        }, 100);
      }
    },
      getUserInitials() {
      if (!this.currentUser || !this.currentUser.name) return '?';
      
      const firstName = this.currentUser.name.charAt(0);
      const lastName = this.currentUser.lastName ? this.currentUser.lastName.charAt(0) : '';
      
      return (firstName + lastName).toUpperCase();
    },
    
    handleAvatarLoadError(event) {
      // Si la imagen no se puede cargar, mostrar las iniciales
      event.target.style.display = 'none';
      // Asegurarnos de que no haya referencias rotas en localStorage
      if (this.currentUser) {
        this.currentUser.profilePicture = '';
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
    },
  }
}
</script>

<style scoped>
.toolbar-container {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: white;
  color: black;
}

.toolbar-top {
  background-color: #1e3a8a;
  color: white;
  border-radius: 0;
  padding: 0.75rem 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;

}

.toolbar-nav {
  display: flex;
  justify-content: start;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
}

::v-deep(.p-button-label){
  color: black;
}

::v-deep(.p-button-label:hover){
  text-decoration: underline;
  background: white;
}

.toolbar-nav .p-button.p-button-text:hover {
  background-color: transparent !important;
  color: white !important;
}

/* Estilos para el menú de perfil */
.profile-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 60px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  z-index: 1001;
  overflow: hidden;
}

.profile-info {
  padding: 12px 16px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 3px;
}

.user-email {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
}

.profile-actions {
  padding: 8px 0;
}

.profile-action {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-color);
  gap: 10px;
  transition: all 0.2s ease-in-out;
  border-radius: 4px;
  margin: 0 4px;
}

.profile-action:hover {
  background-color: #f1f1f1;
  color: var(--primary-color);
}

.profile-action i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.logout-button {
  background-color: rgba(219, 234, 254, 0.5);
  color: #2563eb;
  font-weight: 500;
}

.logout-button:hover {
  background-color: rgba(219, 234, 254, 0.8);
}

.user-profile-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  padding: 0;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.user-profile-button:hover {
  transform: scale(1.05);
  border-color: white;
}

.profile-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: bold;
  background-color: var(--primary-color);
  color: white;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-button {
  margin-right: 0.5rem;
}

.organizations-link {
  margin-right: 1rem;
  font-size: 0.9rem;
}
</style>
