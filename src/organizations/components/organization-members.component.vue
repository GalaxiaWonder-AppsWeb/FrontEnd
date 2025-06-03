<script>
import { useRoute } from 'vue-router';
import { organizationMemberService } from '../services/organization-member.service.js';
import { personService } from '../services/person.service.js';
import { OrganizationMemberType } from '../model/organization-member-type.js';
import InviteMember from './invite-member.component.vue';
import { authService } from '../../iam/services/auth.service.js';

export default {
  name: "OrganizationMembers",
  components: {
    InviteMember
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
    getInitials(firstName, lastName) {
      const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '?';
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    },
    
    getMemberRoleBadgeClass(type) {
      return {
        'contractor-badge': type === OrganizationMemberType.CONTRACTOR,
        'worker-badge': type === OrganizationMemberType.WORKER
      };
    },
    
    getMemberRoleIcon(type) {
      if (type === OrganizationMemberType.CONTRACTOR) {
        return 'pi pi-star';
      } else if (type === OrganizationMemberType.WORKER) {
        return 'pi pi-user';
      }
      return 'pi pi-user';
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
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    getMemberTypeClass(type) {
      return type === OrganizationMemberType.CONTRACTOR ? 'contractor' : 'worker';
    },    confirmRemoveMember(memberId, memberName) {
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
    </div>
      <div v-else class="members-grid">
      <div v-for="member in sortedMembers" :key="member.id" class="member-card">
        <div class="member-card-header">
          <div class="member-avatar" :class="getMemberTypeClass(member.type)">
            {{ getInitials(member.person?.name, member.person?.lastName) }}
          </div>
          <div class="member-info">
            <h3>{{ member.person?.name || 'Usuario' }} {{ member.person?.lastName || 'Desconocido' }}</h3>
            <p class="member-email" v-if="member.person?.email">
              <i class="pi pi-envelope"></i>
              {{ member.person?.email }}
            </p>
          </div>
          <pv-tag :class="getMemberTypeClass(member.type)" :value="member.type" />
        </div>
        
        <div class="member-card-content">
          <div class="joined-date">
            <i class="pi pi-calendar"></i>
            <span>{{ $t('organization.members.joined') }}: {{ formatDate(member.joinedAt) }}</span>
          </div>
          <div class="member-actions" v-if="isCreator && member.personId !== currentUserId">
            <pv-button 
              icon="pi pi-trash" 
              class="p-button-rounded p-button-danger p-button-outlined remove-button" 
              @click="confirmRemoveMember(member.id, `${member.person.name} ${member.person.lastName}`)" />
          </div>
        </div>
        
        <div class="member-role-badge" :class="getMemberRoleBadgeClass(member.type)">
          <i :class="getMemberRoleIcon(member.type)"></i>
        </div>
      </div>
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

.member-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--primary-color-rgb), 0.12);
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--primary-color-rgb), 0.3);
}

.member-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-600));
  opacity: 0.85;
}

.member-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  color: #2196f3;
  margin-right: 1rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  border: 2px solid rgba(33, 150, 243, 0.2);
}

.member-avatar:hover {
  transform: scale(1.05);
}

.member-avatar.contractor {
  background: linear-gradient(135deg, var(--blue-50), var(--blue-100));
  color: var(--blue-700);
  border-color: var(--blue-300);
}

.member-avatar.worker {
  background: linear-gradient(135deg, var(--green-50), var(--green-100));
  color: var(--green-700);
  border-color: var(--green-300);
}

.member-info {
  flex: 1;
}

.member-info h3 {
  margin: 0 0 0.35rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333333;
  letter-spacing: 0.01rem;
}

.member-email {
  margin: 0;
  color: #555555;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 500;
}

.member-email i {
  font-size: 0.95rem;
  color: var(--primary-color);
  opacity: 0.8;
}

.member-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: 0.25rem;
}

.joined-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #555555;
  font-size: 0.9rem;
  background-color: #f5f5f5;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
}

.joined-date i {
  color: var(--primary-color);
  font-size: 0.9rem;
}

.member-actions {
  display: flex;
  gap: 0.5rem;
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

.remove-button:hover {
  background-color: rgba(var(--red-500-rgb), 0.1);
  box-shadow: 0 3px 8px rgba(var(--red-500-rgb), 0.2);
}

.contractor {
  background: linear-gradient(135deg, #e1f5fe, #b3e5fc);
  color: #01579b;
  font-weight: 600;
  padding: 0.45rem 0.85rem;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(1, 87, 155, 0.18);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid #81d4fa;
  position: relative;
}

.contractor::before {
  content: '★';
  font-size: 0.8rem;
  margin-right: 0.1rem;
}

.contractor-badge {
  background: linear-gradient(135deg, #e1f5fe, #b3e5fc);
  border: 1px solid #81d4fa;
  color: #0277bd;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 10px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(2, 119, 189, 0.3);
}

.contractor-badge i {
  font-size: 0.8rem;
}

.worker {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
  font-weight: 500;
  padding: 0.45rem 0.85rem;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(46, 125, 50, 0.18);
  border: 1px solid #a5d6a7;
}

.worker-badge {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border: 1px solid #a5d6a7;
  color: #2e7d32;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 10px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(46, 125, 50, 0.3);
}

.worker-badge i {
  font-size: 0.8rem;
}
</style>
