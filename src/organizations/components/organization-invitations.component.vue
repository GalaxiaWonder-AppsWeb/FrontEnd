<template>
  <div class="notification-menu" @click.stop>
    <div class="notification-header">
      <h3>{{ $t('notifications.title') }}</h3>
      <div v-if="invitations.length > 0" class="notification-counter">{{ invitations.length }}</div>
    </div>

    <div v-if="loading" class="notification-loading">
      <pv-progress-spinner style="width:30px;height:30px" />
    </div>
    
    <div v-else-if="error" class="notification-error">
      {{ error }}
    </div>
    
    <div v-else-if="invitations.length === 0" class="notification-empty">
      <i class="pi pi-bell-slash"></i>
      <p>{{ $t('notifications.empty') }}</p>
    </div>
    
    <div v-else class="notification-list">
      <div v-for="invitation in invitations" :key="invitation.id" class="notification-item">
        <div class="notification-content">
          <div class="notification-org-avatar">
            {{ getInitials(invitation.organizationName) }}
          </div>
          <div>
            <div class="notification-title">{{ invitation.organizationName }}</div>
            <div class="notification-subtitle">
              {{ $t('notifications.invited_by') }} {{ invitation.inviterName }}
            </div>
            <div class="notification-time">
              <i class="pi pi-clock"></i>
              {{ formatDate(invitation.invitedAt) }}
            </div>
          </div>
        </div>
        
        <div class="notification-actions">
          <pv-button 
            icon="pi pi-check" 
            class="p-button-success p-button-sm accept-button"
            :disabled="processingInvitation === invitation.id"
            @click="acceptInvitation(invitation)" />
          <pv-button 
            icon="pi pi-times" 
            class="p-button-danger p-button-sm reject-button"
            :disabled="processingInvitation === invitation.id"
            @click="rejectInvitation(invitation)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { OrganizationInvitationService } from '../services/organization-invitation.service.js';
import { organizationService } from '../services/organization.service.js';
import { personService } from '../../shared/services/person.service.js';
import { organizationMemberService } from '../services/organization-member.service.js';
import { OrganizationInvitationStatus } from '../model/organization-invitation-status.js';
import { authService } from '../../iam/services/auth.service.js';

export default {
  name: "OrganizationInvitations",
  emits: ['invitation-processed', 'close-menu'],
  data() {
    return {
      invitations: [],
      loading: false,
      error: null,
      currentUserId: null,
      processingInvitation: null, // Para rastrear qué invitación está siendo procesada
      redirectTimeout: null // Para gestionar el timeout de redirección
    }
  },
  mounted() {
    this.loadCurrentUser();
    
    // Registrar un listener para actualizar las notificaciones
    window.addEventListener('refresh-notifications', this.loadInvitations);
  },
  beforeUnmount() {
    // Limpiar listeners y timeouts al desmontar
    window.removeEventListener('refresh-notifications', this.loadInvitations);
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  },
  methods: {
    getInitials(name) {
      if (!name) return '?';
      
      // Dividir el nombre por espacios y obtener la primera letra de cada palabra
      return name
        .split(' ')
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join('');
    },
    
    async loadCurrentUser() {
      try {
        // Verificar si el usuario está autenticado
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          this.currentUserId = currentUser?.personId || null;
        } else {
          this.currentUserId = null;
        }
        this.loadInvitations();
      } catch (error) {
        console.error("Error loading current user:", error);
        this.currentUserId = null;
        this.error = this.$t('notifications.error_loading');
      }
    },    async loadInvitations() {
      if (!this.currentUserId) {
        console.log("No hay usuario autenticado, no se cargan invitaciones");
        this.invitations = [];
        this.error = this.$t('notifications.login_required');
        return;
      }
      
      try {
        this.loading = true;
        this.error = null;
        
        console.log(`Cargando invitaciones para el usuario: ${this.currentUserId}`);
        
        // Cargar invitaciones directamente de la API para asegurar que obtenemos los datos más recientes
        const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/invitations?personId=${this.currentUserId}&status=Pending&_t=${new Date().getTime()}`);
        
        if (!response.ok) {
          throw new Error(`Error al obtener invitaciones: ${response.status} ${response.statusText}`);
        }
        
        const invitations = await response.json();
        console.log("Invitaciones obtenidas directamente de la API:", invitations);
        
        // Verificar que tenemos datos de invitaciones
        if (!Array.isArray(invitations)) {
          console.error("La respuesta de invitaciones no es un array:", invitations);
          this.invitations = [];
          this.error = this.$t('notifications.error_loading');
          return;
        }
        
        // Filtrar invitaciones pendientes, aceptando tanto 'Pending' como 'PENDING'
        const pendingInvitations = invitations.filter(
          inv => inv.status === 'Pending' || inv.status === 'PENDING'
        );
        
        console.log("Invitaciones pendientes filtradas:", pendingInvitations);
        
        // Enriquecer con detalles de organización e invitador
        const enrichedInvitations = await Promise.all(
          pendingInvitations.map(async invitation => {
            let organizationName = 'Organización';
            let inviterName = 'Usuario';
            
            try {
              const organization = await organizationService.getById(invitation.organizationId);
              if (organization) {
                organizationName = organization.name || organization.legalName;
              }
              
              const inviter = await personService.getById(invitation.invitedBy);
              if (inviter) {
                inviterName = `${inviter.name} ${inviter.lastName}`;
              }
            } catch (error) {
              console.warn("Error fetching details for invitation:", error);
            }
            
            return {
              ...invitation,
              organizationName,
              inviterName
            };
          })
        );
        
        this.invitations = enrichedInvitations;
      } catch (error) {
        console.error("Error loading invitations:", error);
        this.error = this.$t('notifications.error_loading');
      } finally {
        this.loading = false;
      }
    },
      async acceptInvitation(invitation) {
      // Prevenir múltiples clics
      if (this.processingInvitation) {
        return;
      }
      
      try {
        this.processingInvitation = invitation.id;
        console.log("Aceptando invitación ID:", invitation.id);
        
        // Mostrar spinner y notificación de procesamiento
        this.$toast.add({
          severity: 'info',
          summary: this.$t('notifications.processing'),
          detail: this.$t('notifications.accepting'),
          life: 2000
        });
        
        // Actualizar el estado de la invitación a ACCEPTED utilizando el método mejorado
        console.log("Actualizando invitación con ID:", invitation.id);
        await OrganizationInvitationService.accept(invitation.id);
          // 2. Crear el miembro de la organización
        const newMember = {
          personId: Number(this.currentUserId),
          organizationId: Number(invitation.organizationId),
          type: 'Worker', // Por defecto, los invitados se unen como trabajadores
          joinedAt: new Date().toISOString()
        };
        
        console.log("Creando nuevo miembro:", newMember);
        await organizationMemberService.create(newMember);
        
        // Actualizar el usuario en localStorage para reflejar que ahora es miembro de esta organización
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          // Solo para esta organización, establecer el rol como Worker
          currentUser.activeOrganizationRole = 'Worker';
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
        
        // Mostrar notificación de éxito
        this.$toast.add({
          severity: 'success',
          summary: this.$t('notifications.accepted_title'),
          detail: this.$t('notifications.accepted_message', { org: invitation.organizationName }),
          life: 3000
        });
          // Eliminar esta invitación del array local
        this.invitations = this.invitations.filter(inv => inv.id !== invitation.id);
        
        // Si no quedan invitaciones, cerrar el menú
        if (this.invitations.length === 0) {
          this.$emit('close-menu');
        }
        
        // Notificar a otros componentes para actualizar el contador inmediatamente
        this.$emit('invitation-processed');
          // Emitir eventos para actualizar lista de organizaciones
        if (window && window.dispatchEvent) {
          // Emitir evento para actualizar las notificaciones inmediatamente
          window.dispatchEvent(new CustomEvent('refresh-notifications'));
          
          // También programar una segunda actualización después de un momento
          // para asegurar que el contador se actualice correctamente
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
          }, 500);
          
          // Notificar que hay nuevas organizaciones disponibles
          window.dispatchEvent(new CustomEvent('organizations-updated'));
          
          // Cerrar el menú de notificaciones para mostrar las organizaciones actualizadas
          this.$emit('close-menu');
          
          // NO redireccionamos al usuario a la organización, solo actualizamos la lista
          console.log("Invitación aceptada, se actualizará la lista de organizaciones");
        }
      } catch (error) {
        console.error("Error accepting invitation:", error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('notifications.error_title'),
          detail: this.$t('notifications.error_accept'),
          life: 3000
        });
      } finally {
        this.processingInvitation = null;
      }
    },
      async rejectInvitation(invitation) {
      // Prevenir múltiples clics
      if (this.processingInvitation) {
        return;
      }
      
      try {
        this.processingInvitation = invitation.id;
        console.log("Rechazando invitación ID:", invitation.id);
        
        // Mostrar spinner y notificación
        this.$toast.add({
          severity: 'info',
          summary: this.$t('notifications.processing'),
          detail: this.$t('notifications.rejecting'),
          life: 2000
        });
        
        // Actualizar el estado de la invitación a REJECTED utilizando el método mejorado
        console.log("Actualizando invitación con ID:", invitation.id);
        await OrganizationInvitationService.reject(invitation.id);
        
        // Mostrar toast de éxito
        this.$toast.add({
          severity: 'info',
          summary: this.$t('notifications.rejected_title'),
          detail: this.$t('notifications.rejected_message'),
          life: 3000
        });
          // Eliminar esta invitación del array local
        this.invitations = this.invitations.filter(inv => inv.id !== invitation.id);
        
        // Si no quedan invitaciones, cerrar el menú
        if (this.invitations.length === 0) {
          this.$emit('close-menu');
        }
        
        // Notificar a otros componentes para actualizar el contador inmediatamente
        this.$emit('invitation-processed');        // Disparar evento global inmediatamente
        if (window && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('refresh-notifications'));
          
          // También programar una segunda actualización después de un momento
          // para asegurar que el contador se actualice correctamente
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
          }, 500);
          
          // No es necesario actualizar la lista de organizaciones ya que se rechazó la invitación
        }
      } catch (error) {
        console.error("Error rejecting invitation:", error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('notifications.error_title'),
          detail: this.$t('notifications.error_reject'),
          life: 3000
        });
      } finally {
        this.processingInvitation = null;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      
      const now = new Date();
      const date = new Date(dateString);
      
      // Si es hoy, mostrar solo la hora
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Si es este año, mostrar día y mes
      if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
      }
      
      // Si es otro año, mostrar fecha completa
      return date.toLocaleDateString();
    }
  }
}
</script>

<style scoped>
.notification-menu {
  width: 100%;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
  color: #213547; /* Negro para textos principales */
}

.notification-header {
  padding: 1rem;
  border-bottom: 1px solid #ececec;
  background: #f7f8fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
}

.notification-counter {
  background: #2563eb;
  color: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(37,99,235,0.2);
}

.notification-loading, .notification-error, .notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: #666;
  text-align: center;
  flex: 1;
}

.notification-empty i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.45;
  color: #aaa;
}

.notification-list {
  overflow-y: auto;
  flex: 1;
}

.notification-item {
  background: #fafafa;
  border-radius: 12px;
  margin-bottom: 0.8rem;
  padding: 1.2rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.15s, background 0.15s;
  border: 1px solid #ececec;
  box-shadow: 0 2px 8px rgba(33,53,71,0.06);
}

.notification-item:last-child {
  margin-bottom: 0;
}

.notification-item:hover {
  background: #f0f6ff;
  box-shadow: 0 4px 12px rgba(33,53,71,0.13);
}

.notification-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.notification-org-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #b4d0fc 0%, #e3edfa 100%);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  border: 2px solid #dde8f5;
  box-shadow: 0 2px 6px rgba(37,99,235,0.10);
}

.notification-title {
  font-weight: 700;
  margin-bottom: 0.18rem;
  color: #1a1a1a;
}

.notification-subtitle {
  font-size: 0.96rem;
  color: #60697b;
  margin-bottom: 0.22rem;
}

.notification-time {
  font-size: 0.83rem;
  color: #9196aa;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.notification-time i {
  font-size: 0.9rem;
  color: #2563eb;
}

.notification-actions {
  display: flex;
  gap: 0.7rem;
}

.accept-button,
.reject-button {
  font-weight: 600;
  color: #fff;
  padding: 0.4em 1.3em;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.96rem;
  transition: box-shadow 0.18s, transform 0.18s, background 0.18s;
  box-shadow: 0 2px 7px rgba(33,53,71,0.08);
}

.accept-button {
  background: #17c964;
  box-shadow: 0 2px 5px rgba(23,201,100,0.17);
}
.accept-button:hover {
  background: #11a954;
  box-shadow: 0 4px 12px rgba(23,201,100,0.32);
  transform: translateY(-1px);
}

.reject-button {
  background: #f31260;
  box-shadow: 0 2px 5px rgba(243,18,96,0.17);
}
.reject-button:hover {
  background: #be1846;
  box-shadow: 0 4px 12px rgba(243,18,96,0.32);
  transform: translateY(-1px);
}

/* Responsive tweaks */
@media screen and (max-width: 480px) {
  .notification-menu {
    width: 100%;
    border-radius: 0;
    max-height: 100vh;
    padding: 0.5rem;
  }

  .notification-header {
    padding: 0.7rem;
  }

  .notification-org-avatar {
    width: 34px;
    height: 34px;
    font-size: 0.97rem;
  }

  .notification-actions {
    flex-direction: column;
    gap: 0.45rem;
  }

  .notification-item {
    padding: 0.7rem 0.5rem;
  }
}
</style>
