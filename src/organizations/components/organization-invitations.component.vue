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
              {{ $t('notifications.invited_by') }} {{ invitation.invitedByFullName }}
            </div>
            <div class="notification-time">
              <i class="pi pi-clock"></i>
              {{ formatDate(invitation.invitedOn) }}
            </div>
          </div>
        </div>


          <span :class="['invitation-status', invitation.status.toLowerCase()]">
            {{ invitation.status }}
          </span>


        <div class="notification-actions">
          <pv-button
            icon="pi pi-check"
            class="p-button-success p-button-sm accept-button"
            :disabled="processingInvitation === invitation.id || invitation.status === 'ACCEPTED' || invitation.status === 'REJECTED'"
            @click="acceptInvitation(invitation)" />
          <pv-button
            icon="pi pi-times"
            class="p-button-danger p-button-sm reject-button"
            :disabled="processingInvitation === invitation.id || invitation.status === 'ACCEPTED' || invitation.status === 'REJECTED'"
            @click="rejectInvitation(invitation)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { organizationService } from '../services/organization.service.js';
import { authService } from '../../iam/services/auth.service.js';
import { OrganizationInvitationAssembler} from "../services/organization-invitation.assembler.js";
import {organizationInvitationService} from "../services/organization-invitation.service.js";
import {personService} from "../../shared/services/person.service.js";

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
    },
    async loadInvitations() {
      if (!this.currentUserId) {
        this.invitations = [];
        this.error = this.$t('notifications.login_required');
        return;
      }

      try {
        this.loading = true;
        this.error = null;

        // 1. Obtener las invitaciones con el servicio
        const response = await organizationService.getAllInvitationByPersonId(this.currentUserId);
        const rawInvitations = Array.isArray(response?.data) ? response.data : response;
        // 2. Transformar cada invitación con assembler si tienes uno
        const invitations = rawInvitations.map(inv =>
            OrganizationInvitationAssembler
                ? OrganizationInvitationAssembler.toEntityFromResource(inv)
                : inv
        );

        // 3. Enriquecer invitaciones con nombre de la organización y del invitador
        for (const invitation of invitations) {
          // Obtener nombre de la organización
          if (!invitation.organizationName && invitation.organizationId) {
            try {
              const orgData = await organizationService.getById(invitation.organizationId);
              invitation.organizationName = orgData?.legalName || "Organización desconocida";
            } catch {
              invitation.organizationName = "Organización desconocida";
            }
          }
          // Obtener nombre y correo del invitador
          if (invitation.invitedBy) {
            try {
              const personRes = await personService.getById(invitation.invitedBy);
              invitation.invitedByName =
                  personRes?.firstName && personRes?.lastName
                      ? `${personRes.firstName} ${personRes.lastName}`
                      : "Usuario desconocido";
              invitation.invitedByEmail = personRes?.email || '';
            } catch {
              invitation.invitedByName = "Usuario desconocido";
              invitation.invitedByEmail = '';
            }
          }
        }

        this.invitations = invitations;
        this.loading = false;
      } catch (error) {
        console.error("Error al cargar invitaciones:", error);
        this.error = this.$t('notifications.error_loading');
        this.invitations = [];
        this.loading = false;
      } finally {
        this.processingInvitation = null;
      }
    },

    async acceptInvitation(invitationId) {
      try {
        this.processingInvitation = invitationId;
        await organizationInvitationService.accept(invitationId );
        this.$toast.add({
          severity: 'success',
          summary: this.$t('notifications.accepted_title'),
          detail: this.$t('notifications.accepted_message'),
          life: 3000
        });
        await this.loadInvitations();
      } catch (error) {
        console.error("Error al aceptar invitación:", error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('organization.notifications.error_title'),
          detail: this.$t('organization.invite.error_message'),
          life: 3000
        });
      } finally {
        this.processingInvitation = null;
      }
    },

    async rejectInvitation(invitationId) {
      try {
        this.processingInvitation = invitationId;
        await organizationInvitationService.reject( invitationId );
        this.$toast.add({
          severity: 'info',
          summary: this.$t('notifications.rejected_title'),
          detail: this.$t('notifications.rejected_message'),
          life: 3000
        });
        await this.loadInvitations();
      } catch (error) {
        console.error("Error al rechazar invitación:", error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('organization.invite.error_title'),
          detail: this.$t('organization.invite.error_message'),
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
  margin-bottom: 1.5rem; /* Aumentado desde 1.2rem para mejor separación entre tarjetas */
  padding: 1.5rem 1.2rem; /* Mantenido igual */
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.15s, background 0.15s;
  border: 1px solid #ececec;
  box-shadow: 0 2px 8px rgba(33,53,71,0.06);
  gap: 1.2rem; /* Añadido gap para separar los elementos internos */
}

.notification-item:last-child {
  margin-bottom: 0;
}

.notification-item:hover {
  background: #f0f6ff;
  box-shadow: 0 4px 12px rgba(33,53,71,0.13);
}

/* Estilo para el estado de la invitación */
.notification-item > div:nth-child(2) {
  background: #e0e7ff;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4f46e5;
  white-space: nowrap;
}

.notification-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1.2rem; /* Aumentado desde 0.9rem para más espacio entre avatar y texto */
}

.notification-org-avatar {
  width: 48px; /* Ligeramente más grande */
  height: 48px;
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
  margin-bottom: 0.35rem; /* Aumentado desde 0.18rem */
  color: #1a1a1a;
  font-size: 1.05rem; /* Ligeramente más grande */
}

.notification-subtitle {
  font-size: 0.96rem;
  color: #60697b;
  margin-bottom: 0.4rem; /* Aumentado desde 0.22rem */
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
  gap: 0.9rem; /* Aumentado desde 0.7rem */
  margin-left: 0.5rem; /* Añadido margen izquierdo */
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

/* Clases dinámicas para el estado de la invitación */
.invitation-status {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  text-align: center;
  white-space: nowrap;
}

.invitation-status.pending {
  background: #f59e0b;
}

.invitation-status.accepted {
  background: #17c964;
}

.invitation-status.rejected {
  background: #ef4444;
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
