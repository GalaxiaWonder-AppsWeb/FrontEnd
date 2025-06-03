<script>
import { useRoute } from 'vue-router';
import { organizationMemberService } from '../services/organization-member.service.js';
import { personService } from '../services/person.service.js';
import { OrganizationMemberType } from '../model/organization-member-type.js';
import InviteMember from './invite-member.component.vue';
import OrganizationMemberCard from './organization-member-card.component.vue';
import { authService } from '../../iam/services/auth.service.js';

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
    },
    async checkIfCreator() {
      try {
        // Obtener la organización y comparar el creador
        const org = await import('../services/organization.service.js').then(m => m.organizationService.getById(this.organizationId));
        const createdBy = org?.createdBy || (org?.data && org.data.createdBy);
        this.isCreator = createdBy === this.currentUserId;
      } catch (error) {
        console.error("Error al verificar el creador de la organización:", error);
        this.isCreator = false;
      }
    },    async loadMembers() {
      try {
        this.loading = true;
        this.error = null;
        
        console.log(`Cargando miembros para organización ${this.organizationId}`);
        
        // Obtener los miembros de la organización
        const response = await organizationMemberService.getByOrgId(this.organizationId);
        const members = response?.data || response;
        
        if (!members || !Array.isArray(members)) {
          console.error("La respuesta no contiene un array de miembros:", response);
          throw new Error("No se pudieron cargar los miembros");
        }
        
        console.log(`Se encontraron ${members.length} miembros`);
        
        // Para cada miembro, obtener información detallada de la persona usando fetch directamente
        const membersWithDetails = await Promise.all(
          members.map(async member => {
            try {
              // Usando fetch para mayor control
              const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/persons/${member.personId}`);
              let person = null;
              
              if (response.ok) {
                person = await response.json();
                console.log(`Persona obtenida para miembro ${member.id}:`, person);
              } else {
                console.warn(`No se pudo obtener la persona para el miembro ${member.id}`);
              }
              
              return {
                ...member,
                person: person || { 
                  name: 'Usuario', 
                  lastName: 'Desconocido', 
                  email: 'email@desconocido.com' 
                }
              };
            } catch (error) {
              console.error(`Error al obtener persona para miembro ${member.id}:`, error);
              return {
                ...member,
                person: { 
                  name: 'Usuario', 
                  lastName: 'Desconocido', 
                  email: 'email@desconocido.com' 
                }
              };
            }
          })
        );
        
        console.log("Miembros con detalles:", membersWithDetails);
        this.members = membersWithDetails;
      } catch (error) {
        console.error("Error al cargar miembros:", error);
        this.error = this.$t('organization.members.error_loading');
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
      <h2>{{ $t('organization.section.members') }}</h2>
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
          v-for="(member, index) in sortedMembers" 
          :key="member.id"
          :member="member"
          :isCreator="isCreator"
          :currentUserId="currentUserId"
          @remove="confirmRemoveMember($event.id, $event.name)"
          :style="{'--card-index': index}"
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

.loading-container, .error-message, .empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
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