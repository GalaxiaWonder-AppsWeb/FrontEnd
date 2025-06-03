<template>
  <div class="toolbar-container">
    <!-- Parte superior fija -->
    <pv-toolbar class="toolbar-top">
      <template #start>
        <h1 class="section-title">{{ $t(sectionTitle+'.title') }}</h1>
      </template>      <template #end>        <NotificationBell v-if="isAuthenticated" />
        <pv-button icon="pi pi-user" text rounded severity="info" @click="toggleProfileMenu" class="user-profile-button" />
        <div v-if="showProfileMenu" class="profile-menu" ref="profileMenu">
          <div class="profile-info" v-if="currentUser">
            <span class="user-name">{{ currentUser.name }} {{ currentUser.lastName }}</span>
            <span class="user-email">{{ currentUser.email }}</span>
          </div>
          <div class="profile-actions">
            <button class="profile-action logout-button" @click="logout">
              <i class="pi pi-sign-out"></i>
              {{ $t('auth.logout') }}
            </button>
          </div>
        </div>
        <LanguageSwitcher />
      </template>
    </pv-toolbar>

    <!-- Parte inferior: navegación dinámica -->
    <nav class="toolbar-nav">
      <template v-if="inOrganizationView">
        <pv-button text plain :label="$t(sectionTitle + '.section.information')" @click="goTo('information')" />
        <pv-button text plain :label="$t(sectionTitle + '.section.projects')" @click="goTo('projects')" />
        <pv-button text plain :label="$t(sectionTitle + '.section.members')" @click="goTo('members')" />
        <pv-button text plain :label="$t(sectionTitle + '.section.configurations')" @click="goTo('settings')" />
      </template>

      <template v-else-if="inProjectView">
        <pv-button text plain label="Information" @click="goTo('information')" />
        <pv-button text plain label="Schedule" @click="goTo('schedule')" />
        <pv-button text plain label="Change Management" @click="goTo('change-management')" />
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
  },
  data() {
    return {
      route: useRoute(),
      router: useRouter(),
      currentUser: null,
      isAuthenticated: false,
      showProfileMenu: false
    }
  },
  mounted() {
    this.checkAuthentication();
    // Cerrar menú de perfil al hacer clic fuera
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  computed: {
    inOrganizationView() {
      return this.route.path.startsWith('/organizations/') && !this.route.path.includes('/projects/');
    },
    inProjectView() {
      return this.route.path.includes('/projects/') || 
             (this.route.name === 'organization-specific-project' && this.route.params.projectId)
    },
    sectionTitle() {
      if (this.inProjectView) return 'project'
      if (this.inOrganizationView) return 'organization'
      return 'organization'
    }
  },  methods: {
    goTo(section) {
      const { orgId, projectId } = this.route.params
      let path = ''
      if (this.inProjectView && projectId) {
        path = `/organizations/${orgId}/projects/${projectId}`
        if (section !== 'projects') {
          path += `/${section}`
        }
      } else if (this.inOrganizationView && orgId) {
        path = `/organizations/${orgId}/${section}`
      }
      this.router.push(path)
    },
      async checkAuthentication() {
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
    }
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
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  transition: all 0.2s ease-in-out;
}

.user-profile-button:hover {
  background-color: #f1f5f9 !important;
  transform: scale(1.05);
}
</style>
