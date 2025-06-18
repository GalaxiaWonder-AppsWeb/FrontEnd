<template>
  <div class="invite-member-container">
    <h3>{{ $t('organization.invite.title') }}</h3>
    
    <!-- Replace search section with email input -->
    <div class="email-input-section">
      <span class="p-input-icon-left">
        <i class="pi pi-envelope" />
        <pv-input-text 
          v-model="emailToCheck" 
          :placeholder="$t('organization.invite.email_placeholder')" 
          @blur="verifyEmailWhenComplete"
          :class="{'p-invalid': !!emailError}"
          class="w-full" />
      </span>
      <small v-if="emailError" class="p-error">{{ emailError }}</small>
      
      <!-- Show invite button when user is verified -->
      <div v-if="verifiedUser" class="verified-user mt-2">
        <div class="user-info">
          <div class="user-name">{{ verifiedUser.name }} {{ verifiedUser.lastName }}</div>
          <div class="user-email">{{ verifiedUser.email }}</div>
        </div>
        <pv-button 
          icon="pi pi-user-plus" 
          :label="$t('organization.invite.button')" 
          @click="inviteUser(verifiedUser)" 
          :disabled="isUserInvited(verifiedUser.id)" 
          :class="{'p-button-outlined': isUserInvited(verifiedUser.id)}" />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <pv-progress-spinner style="width:50px;height:50px" />
    </div>

    <div v-if="error && !emailError" class="error-message">
      {{ error }}
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
import { personService } from '../../shared/services/person.service.js';
import { OrganizationInvitationStatus } from '../model/organization-invitation-status.js';
import { authService } from '../../iam/services/auth.service.js';

export default {
  name: "InviteMember",
  data() {
    return {
      route: useRoute(),
      emailToCheck: '',
      emailError: '',
      verifiedUser: null,
      pendingInvitations: [],
      loading: false,
      error: null,
      currentUserId: null
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
    },    /**
     * Verifies the email when the input field loses focus
     * This ensures exactly one API call when the email is fully entered
     */
    async verifyEmailWhenComplete() {
      // Clear previous verification results
      this.verifiedUser = null;
      this.emailError = '';
      
      // Don't do anything if the field is empty
      if (!this.emailToCheck.trim()) {
        return;
      }
      
      // Validate email format before making API call
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.emailToCheck)) {
        this.emailError = this.$t('organization.invite.invalid_email');
        return;
      }
      
      // Now that we have a valid email format, verify if it's a registered user
      try {
        this.loading = true;
        this.error = null;
        
        // This will make exactly ONE GET request to verify if the email exists
        const result = await personService.searchByEmail(this.emailToCheck);
        
        if (!result || result.length === 0) {
          this.emailError = this.$t('organization.invite.email_not_found');
          return;
        }
        
        const user = result[0]; // Assume the first result is the matched user
        
        // Check if the user is already a member of the organization
        const membersResponse = await fetch(
          `${import.meta.env.VITE_PROPGMS_API_URL}/organization-members?organizationId=${this.organizationId}`
        );
        const members = await membersResponse.json();
        const memberPersonIds = members.map(m => m.personId);
        
        if (memberPersonIds.includes(user.id)) {
          this.emailError = this.$t('organization.invite.user_already_member');
          return;
        }
        
        // Set the verified user to display info and invite button
        this.verifiedUser = user;
          // Show success message
        if (this.$toast) {
          this.$toast.add({
            severity: 'info',
            summary: this.$t('organization.invite.email_verified'),
            life: 2000
          });
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        this.emailError = this.$t('organization.invite.error_search');
      } finally {
        this.loading = false;
      }
    },
    async inviteUser(user) {
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
          organizationId: Number(this.organizationId),
          personId: Number(user.id),
          invitedBy: Number(this.currentUserId),
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
        }        // Refrescar datos locales
        await this.loadPendingInvitations();
        // Reset the email input and verification state
        this.emailToCheck = '';
        this.verifiedUser = null;
        
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

.email-input-section {
  margin-bottom: 1.5rem;
}

.verified-user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--surface-hover);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.p-error {
  display: block;
  margin-top: 0.25rem;
}

.loading-container, .error-message {
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
