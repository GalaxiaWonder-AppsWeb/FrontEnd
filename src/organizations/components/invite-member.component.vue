<template>
  <div class="invite-member-container">
    <h3>{{ $t('organization.invite.title') }}</h3>
    
    <div class="search-section">
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <pv-input-text 
          v-model="searchTerm" 
          :placeholder="$t('organization.invite.search')" 
          @input="searchUsers" 
          class="w-full" />
      </span>
    </div>

    <div v-if="loading" class="loading-container">
      <pv-progress-spinner style="width:50px;height:50px" />
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="searchResults.length === 0 && searchTerm" class="no-results">
      {{ $t('organization.invite.no_results') }}
    </div>

    <div v-else-if="searchResults.length > 0" class="search-results">
      <div v-for="user in searchResults" :key="user.id" class="user-item">
        <div class="user-info">
          <div class="user-name">{{ user.name }} {{ user.lastName }}</div>
          <div class="user-email">{{ user.email }}</div>
        </div>
        <pv-button 
          icon="pi pi-user-plus" 
          :label="$t('organization.invite.button')" 
          @click="inviteUser(user)" 
          :disabled="isUserInvited(user.id)"
          :class="{'p-button-outlined': isUserInvited(user.id)}" />
      </div>
    </div>

    <div class="pending-invitations" v-if="pendingInvitations.length > 0">
      <h4>{{ $t('organization.invite.pending') }}</h4>
      <div v-for="invitation in pendingInvitations" :key="invitation.id" class="invitation-item">
        <div class="invitation-info">
          <span>{{ invitation.personName }} ({{ invitation.personEmail }})</span>
          <span class="invitation-date">{{ formatDate(invitation.invitedAt) }}</span>
        </div>
        <pv-tag :severity="getInvitationSeverity(invitation.status)">
          {{ $t(`organization.invite.status.${invitation.status.toLowerCase()}`) }}
        </pv-tag>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router';
import { OrganizationInvitationService } from '../services/organization-invitation.service.js';
import { personService } from '../services/person.service.js';
import { OrganizationInvitationStatus } from '../model/organization-invitation-status.js';
import { authService } from '../../iam/services/auth.service.js';

export default {
  name: "InviteMember",
  data() {
    return {
      route: useRoute(),
      searchTerm: '',
      searchResults: [],
      pendingInvitations: [],
      loading: false,
      error: null,
      currentUserId: null // Se debe obtener el usuario actual de la sesión
    }
  },
  computed: {
    organizationId() {
      return this.route.params.orgId;
    }
  },
  mounted() {
    this.loadCurrentUser();
    this.loadPendingInvitations();
    // Cargar usuarios automáticamente al abrir la ventana
    this.searchUsers();
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
          this.error = 'You must be logged in to invite members';
        }
      } catch (error) {
        console.error("Error loading current user:", error);
        this.currentUserId = null;
        this.error = 'Error loading user information';
      }
    },
    async loadPendingInvitations() {
      this.loading = true;
      try {
        const invitations = await OrganizationInvitationService.getByOrgId(this.organizationId);
        this.pendingInvitations = invitations.filter(inv => inv.status === 'Pending');
      } catch (e) {
        this.pendingInvitations = [];
      } finally {
        this.loading = false;
      }
    },    async searchUsers() {
      this.loading = true;
      try {
        console.log("Buscando usuarios...");
        
        // Obtener todos los usuarios registrados directamente del endpoint
        const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/persons`);
        if (!response.ok) {
          throw new Error('No se pudo obtener la lista de personas');
        }
        const allPersons = await response.json();
        console.log("Personas obtenidas:", allPersons);
        
        // Obtener miembros actuales de la organización
        const membersResponse = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/members?organizationId=${this.organizationId}`);
        const members = await membersResponse.json();
        console.log("Miembros obtenidos:", members);
        
        const memberPersonIds = members.map(m => m.personId);
        console.log("IDs de miembros:", memberPersonIds);
        
        // Obtener invitaciones pendientes
        const pendingPersonIds = this.pendingInvitations.map(inv => inv.personId);
        console.log("IDs de invitaciones pendientes:", pendingPersonIds);
        
        // Filtrar: no miembros, no invitados, no el propio usuario
        this.searchResults = allPersons.filter(person =>
          person.id !== this.currentUserId &&
          !memberPersonIds.includes(person.id) &&
          !pendingPersonIds.includes(person.id) &&
          (
            !this.searchTerm ||
            person.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            person.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            person.email?.toLowerCase().includes(this.searchTerm.toLowerCase())
          )
        );
        
        console.log("Resultados de búsqueda:", this.searchResults);
      } catch (e) {
        console.error("Error al buscar usuarios:", e);
        this.searchResults = [];
      } finally {
        this.loading = false;
      }
    },    async inviteUser(user) {
      try {
        this.loading = true;
        console.log("Invitando usuario:", user);
        
        // Validar datos requeridos
        if (!this.organizationId || !user.id || !this.currentUserId) {
          throw new Error('Faltan datos requeridos para crear la invitación');
        }
        
        // Datos para la invitación en formato compatible con ASP.NET Core
        const invitationData = {
          organizationId: this.organizationId,
          personId: user.id,
          invitedBy: this.currentUserId
          // Ya no pasamos invitedAt y status, lo hará el servicio
        };
        
        // Usar el método mejorado del servicio de invitaciones
        const createdInvitation = await OrganizationInvitationService.createInvitation(invitationData);
        
        // Verificar que la invitación se creó correctamente
        if (!createdInvitation || !createdInvitation.id) {
          throw new Error('Error al crear la invitación: respuesta inválida');
        }
        
        console.log("Invitación creada exitosamente:", createdInvitation);
          if (this.$toast) {
          this.$toast.add({
            severity: 'success',
            summary: this.$t('organization.invite.sent_title'),
            detail: this.$t('organization.invite.sent_message', { name: user.name }),
            life: 3000
          });
        }
        
        // Refrescar datos locales
        await this.loadPendingInvitations();
        await this.searchUsers();
        
        // Disparar eventos para actualizar notificaciones en toda la aplicación
        if (window && window.dispatchEvent) {
          // Notificar a todos los componentes que necesitan actualizarse
          window.dispatchEvent(new CustomEvent('refresh-notifications'));
          
          // Programar una segunda actualización para asegurar que todos los componentes se actualicen
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
          }, 500);
        }
        
        this.$emit('invitationSent');
      } catch (e) {
        console.error("Error al invitar usuario:", e);
        if (this.$toast) {
          this.$toast.add({
            severity: 'error',
            summary: this.$t('organization.invite.error_title'),
            detail: this.$t('organization.invite.error_message'),
            life: 3000
          });
        }
      } finally {
        this.loading = false;
      }
    },
    isUserInvited(personId) {
      return this.pendingInvitations.some(inv => inv.personId === personId);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    getInvitationSeverity(status) {
      switch (status) {
        case OrganizationInvitationStatus.PENDING:
          return 'warning';
        case OrganizationInvitationStatus.ACCEPTED:
          return 'success';
        case OrganizationInvitationStatus.REJECTED:
          return 'danger';
        default:
          return 'info';
      }
    }
  }
}
</script>

<style scoped>
.invite-member-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-section {
  margin-bottom: 1rem;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--surface-card);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--text-color);
}

.user-email {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.loading-container, .error-message, .no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.error-message {
  color: var(--red-500);
}

.pending-invitations {
  margin-top: 1rem;
  border-top: 1px solid var(--surface-border);
  padding-top: 1rem;
}

.invitation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--surface-border);
}

.invitation-info {
  display: flex;
  flex-direction: column;
}

.invitation-date {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.w-full {
  width: 100%;
}
</style>
