<template>  <div class="notification-bell" ref="container">
    <button class="bell-button" @click="toggleMenu" :class="{'has-notifications': notificationCount > 0}">
      <i class="pi pi-bell"></i>
      <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
    </button>
    
    <transition name="fade">
      <div v-if="showMenu" class="notification-dropdown">
        <NotificationMenu 
          @invitation-processed="forceUpdateNotificationCount" 
          @close-menu="showMenu = false" />
      </div>
    </transition>
  </div>
</template>

<script>
import { OrganizationInvitationService } from '../services/organization-invitation.service.js';
import { OrganizationInvitationStatus } from '../model/organization-invitation-status.js';
import NotificationMenu from './notification-menu.component.vue';
import { authService } from '../../iam/services/auth.service.js';

export default {
  name: "NotificationBell",
  components: {
    NotificationMenu
  },
  data() {
    return {
      notificationCount: 0,
      showMenu: false,
      currentUserId: null,
      checkInterval: null,
      isFirstLoad: true
    }
  },
  mounted() {
    this.loadCurrentUser();
    document.addEventListener('click', this.handleClickOutside);
    
    // Revisar nuevas notificaciones periódicamente
    this.checkInterval = setInterval(() => {
      this.updateNotificationCount(false); // False = no mostrar animación de alerta
    }, 180000); // Cada 3 minutos
    
    // Escuchar evento global para refrescar notificaciones
    window.addEventListener('refresh-notifications', this.updateNotificationCount);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    window.removeEventListener('refresh-notifications', this.updateNotificationCount);
  },
  methods: {
    async loadCurrentUser() {
      try {
        // Verificar si el usuario está autenticado
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          this.currentUserId = currentUser?.personId || null;
        } else {
          this.currentUserId = null;
        }
        this.updateNotificationCount();
      } catch (error) {
        console.error("Error loading current user:", error);
        this.currentUserId = null;
      }    },    /**
     * Actualiza el contador de notificaciones basado en las invitaciones pendientes
     * @param {boolean} showAlert - Si debe mostrar animación de alerta
     * @returns {Promise<void>}
     */
    async updateNotificationCount(showAlert = true) {
      if (!this.currentUserId) {
        console.log("[NotificationBell] No hay usuario autenticado");
        this.notificationCount = 0;
        return;
      }
      
      try {
        console.log(`[NotificationBell] Actualizando contador para usuario: ${this.currentUserId}`);
        
        // Obtener invitaciones pendientes usando el servicio mejorado
        const invitations = await OrganizationInvitationService.getByPersonId(this.currentUserId);
        
        // Las invitaciones ya vienen filtradas por status=Pending desde el servicio mejorado
        const pendingCount = Array.isArray(invitations) ? invitations.length : 0;
        
        console.log(`[NotificationBell] ${pendingCount} invitaciones pendientes encontradas`);
        
        // Detectar si hay nuevas notificaciones para animar la campana
        const hasNewNotifications = !this.isFirstLoad && pendingCount > this.notificationCount;
        
        // Actualizar el contador
        this.notificationCount = pendingCount;
        this.isFirstLoad = false;
        
        // Mostrar animación si corresponde
        if (hasNewNotifications && showAlert) {
          this.animateBell();
        }
      } catch (error) {
        console.error("Error updating notification count:", error);
        this.notificationCount = 0;
      }    },
    
    // Forzar actualización inmediata del contador cuando se procesa una invitación
    async forceUpdateNotificationCount() {
      console.log("Forzando actualización del contador de notificaciones");
      // Actualizar el contador inmediatamente sin animación
      await this.updateNotificationCount(false);
    },
    
    animateBell() {
      // Agregar clase para animar la campana
      const bell = this.$refs.container.querySelector('.bell-button');
      bell.classList.add('bell-animated');
      
      // Eliminar la clase después de la animación
      setTimeout(() => {
        bell.classList.remove('bell-animated');
      }, 2000);
    },
    
    toggleMenu() {
      this.showMenu = !this.showMenu;
      
      // Si se abre el menú, actualizar inmediatamente el conteo
      if (this.showMenu) {
        this.updateNotificationCount(false);
      }
    },
    
    handleClickOutside(event) {
      if (this.$refs.container && !this.$refs.container.contains(event.target)) {
        this.showMenu = false;
      }
    }
  }
}
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
}

.bell-button:hover {
  background-color: var(--surface-hover);
}

.bell-button.has-notifications {
  color: var(--primary-600);
}

.bell-button.has-notifications:hover {
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  font-size: 0.7rem;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(var(--primary-color-rgb), 0.3);
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: -10px;
  z-index: 1000;
  width: 350px;
}

/* Animación para el dropdown */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Animación para la campana */
@keyframes bell-ring {
  0% { transform: rotate(0); }
  10% { transform: rotate(15deg); }
  20% { transform: rotate(-15deg); }
  30% { transform: rotate(13deg); }
  40% { transform: rotate(-13deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(-10deg); }
  70% { transform: rotate(7deg); }
  80% { transform: rotate(-7deg); }
  90% { transform: rotate(3deg); }
  100% { transform: rotate(0); }
}

.bell-animated {
  animation: bell-ring 1.5s ease;
  color: var(--primary-600) !important;
}

@media screen and (max-width: 768px) {
  .notification-dropdown {
    width: 320px;
    right: -75px;
  }
}

@media screen and (max-width: 480px) {
  .notification-dropdown {
    width: calc(100vw - 30px);
    right: -100px;
    max-width: 320px;
  }
  
  /* Triángulo indicador */
  .notification-dropdown::before {
    right: 110px;
  }
}
</style>
