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
    },    async loadPendingInvitations() {
      this.loading = true;
      try {
        // Obtener todas las invitaciones para la organización (todos los estados)
        const invitationsResponse = await fetch(
          `${import.meta.env.VITE_PROPGMS_API_URL}/invitations?organizationId=${this.organizationId}&_t=${new Date().getTime()}`
        );
        
        if (!invitationsResponse.ok) {
          throw new Error(`Error al obtener invitaciones: ${invitationsResponse.status}`);
        }
        
        const allInvitations = await invitationsResponse.json();
        console.log("Todas las invitaciones obtenidas:", allInvitations);
        
        // Agregar información de la persona para cada invitación
        const invitationsWithPersons = [];
        for (const invitation of allInvitations) {
          try {
            const personResponse = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/persons/${invitation.personId}`);
            if (personResponse.ok) {
              const person = await personResponse.json();
              invitationsWithPersons.push({
                ...invitation,
                personName: `${person.name} ${person.lastName}`,
                personEmail: person.email
              });
            } else {
              invitationsWithPersons.push(invitation);
            }
          } catch (error) {
            console.error(`Error al obtener datos de persona para invitación ${invitation.id}:`, error);
            invitationsWithPersons.push(invitation);
          }
        }
        
        // Filtrar solo invitaciones pendientes para mostrar en la interfaz
        this.pendingInvitations = invitationsWithPersons.filter(inv => inv.status === 'Pending');
        console.log("Invitaciones pendientes:", this.pendingInvitations);
      } catch (e) {
        console.error("Error al cargar invitaciones:", e);
        this.pendingInvitations = [];
      } finally {
        this.loading = false;
      }
    },async searchUsers() {
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
        console.log("IDs de miembros:", memberPersonIds);        // Obtener solo las invitaciones PENDIENTES para no mostrar personas con invitaciones activas
        // Esto permite volver a invitar a usuarios que hayan rechazado o aceptado invitaciones previas
        const pendingInvitationsResponse = await fetch(
          `${import.meta.env.VITE_PROPGMS_API_URL}/invitations?organizationId=${this.organizationId}&status=Pending&_t=${new Date().getTime()}`
        );
        
        const pendingInvitations = await pendingInvitationsResponse.json();
        console.log("Invitaciones pendientes para esta organización:", pendingInvitations);
        
        // Extraer los IDs de personas con invitaciones pendientes únicamente
        const pendingInvitedPersonIds = pendingInvitations.map(inv => inv.personId);
        console.log("IDs de personas con invitaciones pendientes:", pendingInvitedPersonIds);
          // Filtrar: no miembros, no invitados con invitaciones PENDIENTES, no el propio usuario
        this.searchResults = allPersons.filter(person =>
          person.id !== this.currentUserId &&
          !memberPersonIds.includes(person.id) &&
          !pendingInvitedPersonIds.includes(person.id) &&
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
        
        // Mostrar mensaje de que se está enviando la invitación
        if (this.$toast) {
          this.$toast.add({
            severity: 'info',
            summary: this.$t('organization.invite.sending'),
            detail: this.$t('organization.invite.please_wait'),
            life: 2000
          });
        }
        
        // Validar datos requeridos
        if (!this.organizationId || !user.id || !this.currentUserId) {
          throw new Error('Faltan datos requeridos para crear la invitación');
        }
        
        // Datos para la invitación en formato compatible con API
        const invitationData = {
          organizationId: this.organizationId,
          personId: user.id,
          invitedBy: this.currentUserId,
          invitedAt: new Date().toISOString(),
          status: 'Pending'
        };
        
        // Usar el método directo de creación para asegurar que se crea correctamente
        console.log("Enviando petición de invitación directamente a la API:", invitationData);
        let response;
        
        // Intentar crear la invitación con axios directamente para depuración
        try {
          response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/invitations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(invitationData)
          });
          
          const createdInvitation = await response.json();
          console.log("Respuesta directa de la API:", createdInvitation);
          
          // Verificar que la invitación se creó correctamente
          if (!createdInvitation || (!createdInvitation.id && !createdInvitation._id)) {
            throw new Error('Error al crear la invitación: respuesta inválida');
          }
          
          console.log("Invitación creada exitosamente:", createdInvitation);
        } catch (apiError) {
          console.error("Error en la llamada directa a la API:", apiError);
          throw apiError;
        }
        
        // Mostrar mensaje de éxito
        if (this.$toast) {
          this.$toast.add({
            severity: 'success',
            summary: this.$t('organization.invite.success_title'),
            detail: this.$t('organization.invite.success_message', { name: user.name }),
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
          
          // Programar múltiples actualizaciones para asegurar que todos los componentes se actualicen
          // Esto es particularmente útil para componentes que pueden cargar datos de forma asíncrona
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
          }, 500);
          
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
          }, 2000);
        }
        
        // Notificar al componente padre que se ha enviado la invitación
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
    },    isUserInvited(personId) {
      // Verificar si el usuario ya tiene una invitación pendiente
      // Nota: this.pendingInvitations ya contiene solo invitaciones con estado "Pending"
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
