<script>
import { useRoute } from 'vue-router';
import { organizationMemberService } from '../services/organization-member.service.js';
import { OrganizationMemberType } from '../model/organization-member-type.js';
import InviteMember from './invite-member.component.vue';
import OrganizationMemberCard from './organization-member-card.component.vue';
import { authService } from '../../iam/services/auth.service.js';
import {organizationService} from "../services/organization.service.js";

export default {
  name: "OrganizationMembers",
  components: {
    InviteMember,
    OrganizationMemberCard
  },
  data() {
    return {
      route: useRoute(),
      members: [],
      loading: false,
      error: null,
      currentUserId: null,
      isCreator: false,
      showInviteDialog: false
    }
  },
  computed: {
    organizationId() {
      return this.route.params.orgId;
    },
    sortedMembers() {
      return [...this.members].sort((a, b) => {
        // Ordena primero por tipo (contratista primero)
        if (a.type === OrganizationMemberType.CONTRACTOR && b.type !== OrganizationMemberType.CONTRACTOR) {
          return -1;
        }
        if (a.type !== OrganizationMemberType.CONTRACTOR && b.type === OrganizationMemberType.CONTRACTOR) {
          return 1;
        }
        
        // Luego por fecha de unión (más recientes primero)
        return new Date(b.joinedAt) - new Date(a.joinedAt);
      });
    }
  },
  mounted() {
    this.loadCurrentUser();
    this.loadMembers();
  },  methods: {
    
    async loadCurrentUser() {
      try {
        // Verificar si el usuario está autenticado
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          this.currentUserId = currentUser?.personId || null;
        } else {
          this.currentUserId = null;
        }
        this.checkIfCreator();
      } catch (error) {
        console.error("Error loading current user:", error);
        this.currentUserId = null;
      }
    },    async checkIfCreator() {
      try {
        // Si ya tenemos el rol de usuario desde localStorage, evitamos la petición
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.activeOrganizationRole === 'Contractor') {
            this.isCreator = true;
            return; // Evitamos la petición innecesaria
          }
        }
        
        // Si no tenemos el rol guardado, obtenemos la organización 
        // (ahora con caché gracias a las modificaciones en organization.service.js)
        const org = await import('../services/organization.service.js').then(m => m.organizationService.getById(this.organizationId));
        const createdBy = org?.createdBy || (org?.data && org.data.createdBy);
        this.isCreator = createdBy === this.currentUserId;
        console.log(`El usuario actual ${this.currentUserId} es creador: ${this.isCreator}`);
      } catch (error) {
        console.error("Error al verificar el creador de la organización:", error);
        this.isCreator = false;
      }
    },
    async loadMembers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await organizationService.getAllMembers(this.organizationId);
        const members = Array.isArray(response?.data) ? response.data : response;

        // Mapea y normaliza la respuesta según lo que espera el card
        this.members = members.map(m => ({
          id: m.id,
          personId: m.personId || m.id, // puedes ajustar según tu backend
          type: m.memberType,
          joinedAt: m.joinedAt,
          person: {
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            profilePicture: m.profilePicture
          }
        }));
      } catch (e) {
        console.error("Error al cargar miembros:", e);
        this.error = this.$t('organization.members.error_loading');
        this.members = [];
      } finally {
        this.loading = false;
      }
    },

    openInviteDialog() {
      this.showInviteDialog = true;
    },confirmRemoveMember(memberId, memberName) {
      if (!this.isCreator) {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('organization.members.no_permission'),
          detail: this.$t('organization.members.creator_only'),
          life: 3000
        });
        return;
      }
      
      // Usar el servicio de confirmación
      this.$confirm.require({
        message: this.$t('organization.members.confirm_remove_message', { name: memberName }),
        header: this.$t('organization.members.confirm_remove_title'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.$t('common.yes'),
        rejectLabel: this.$t('common.no'),
        accept: () => {
          this.removeMember(memberId);
        }
      });
    },
    
    async removeMember(memberId) {      
      try {
        this.loading = true;
        await organizationMemberService.delete(memberId);
        
        this.$toast.add({
          severity: 'success',
          summary: this.$t('organization.members.removed_title'),
          detail: this.$t('organization.members.removed_message'),
          life: 3000
        });
        
        // Actualizar la lista de miembros
        this.loadMembers();
      } catch (error) {
        console.error("Error al eliminar miembro:", error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('organization.members.error_title'),
          detail: this.$t('organization.members.error_remove'),
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<template>
  <div class="organization-members-container">
    <div class="members-header">
      <h2 class="members-title">{{ $t('organization.section.members') }}</h2>
      <pv-button 
        v-if="isCreator" 
        icon="pi pi-user-plus" 
        :label="$t('organization.members.invite')" 
        class="invite-button"
        @click="openInviteDialog" />
    </div>
    
    <div v-if="loading" class="loading-container">
      <pv-progress-spinner style="width:50px;height:50px" />
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else-if="members.length === 0" class="empty-message">
      {{ $t('organization.members.empty') }}
    </div>      <div v-else class="members-grid">
      <OrganizationMemberCard
          v-for="member in sortedMembers"
          :key="member.id"
          :member="member"
          :isCreator="isCreator"
          :currentUserId="currentUserId"
          @remove="confirmRemoveMember($event.id, $event.name)"
      />

    </div>
    
    <pv-dialog 
      v-model:visible="showInviteDialog" 
      :header="$t('organization.members.invite')" 
      :modal="true"
      :dismissable-mask="true"
      :style="{ width: '500px' }">
      <InviteMember @invitationSent="showInviteDialog = false; loadMembers()" />
    </pv-dialog>
  </div>
</template>

<style scoped>
.organization-members-container {
  padding: 1.5rem;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.members-title {
  color: black;
  font-size: 1.5rem;
}

.loading-container, .error-message, .empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
  color: black;
}

.error-message {
  color: var(--red-500);
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .members-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .member-card {
    padding: 1.25rem;
  }
}

@media screen and (max-width: 480px) {
  .members-grid {
    grid-template-columns: 1fr;
  }
}

.invite-button {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: 0 2px 5px rgba(var(--primary-color-rgb), 0.25);
}

.invite-button:hover {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
  box-shadow: 0 4px 10px rgba(var(--primary-color-rgb), 0.3);
}
</style>
