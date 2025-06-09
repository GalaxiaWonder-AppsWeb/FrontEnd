<script>
import { OrganizationMemberType } from '../model/organization-member-type.js';
import { fileUploadService } from '../../shared/services/file-upload.service';

export default {
  name: "OrganizationMemberCard",
  props: {
    member: {
      type: Object,
      required: true
    },
    isCreator: {
      type: Boolean,
      default: false
    },
    currentUserId: {
      type: String,
      default: null
    }
  },
  methods: {
    getInitials(firstName, lastName) {
      const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '?';
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    },
    
    getMemberTypeClass(type) {
      return type === OrganizationMemberType.CONTRACTOR ? 'contractor' : 'worker';
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
      formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    
    handleProfileImageError(event) {
      // Ocultar la imagen si no puede cargarse
      event.target.style.display = 'none';
      // Mostrar el contenedor de iniciales
      const placeholder = event.target.parentElement.querySelector('.member-avatar-placeholder');
      if (placeholder) {
        placeholder.style.display = 'flex';
      } else {
        // Si no existe el placeholder, lo creamos dinámicamente
        const div = document.createElement('div');
        div.className = 'member-avatar-placeholder';
        div.textContent = this.getInitials(this.member.person?.name, this.member.person?.lastName);
        event.target.parentElement.appendChild(div);
      }
    },
    
    // Emite el evento para eliminar un miembro
    confirmRemove() {
      this.$emit('remove', {
        id: this.member.id,
        name: `${this.member.person.name} ${this.member.person.lastName}`
      });
    }
  }
}
</script>

<template>
  <pv-card class="member-card" :class="getMemberTypeClass(member.type)">
    <template #header>
      <!--<div class="member-role-badge" :class="getMemberRoleBadgeClass(member.type)">
        <i :class="getMemberRoleIcon(member.type)"></i>
      </div>-->
    </template>
    
    <template #title>      <div class="member-card-header">        <div class="member-avatar" :class="getMemberTypeClass(member.type)">
          <img v-if="member.person?.profilePicture" 
               :src="member.person.profilePicture" 
               @error="handleProfileImageError"
               alt="Profile Picture" 
               class="member-avatar-image" 
          />
          <div v-else class="member-avatar-placeholder">
            {{ getInitials(member.person?.name, member.person?.lastName) }}
          </div>
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
    </template>
    
    <template #content>
      <div class="member-card-content">
        <div class="joined-date">
          <i class="pi pi-calendar"></i>
          <span>{{ $t('organization.members.joined') }}: {{ formatDate(member.joinedAt) }}</span>
        </div>
      </div>
    </template>
    
    <template #footer v-if="isCreator && member.personId !== currentUserId">
      <div class="member-actions">
        <pv-button 
          icon="pi pi-trash" 
          class="p-button-rounded p-button-danger p-button-outlined remove-button" 
          @click="confirmRemove" />
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.member-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--primary-color-rgb), 0.12);
  background-color: #393939;
  height: 100%;
}

/* Estilos específicos para Contractor */
.member-card.contractor {
  border-left: 4px solid #2196f3; /* Azul */
  background-color: rgba(33, 150, 243, 0.05);
}

.contractor {
  color: #0277bd;
  font-weight: 600;
}

/* Estilos específicos para Worker */
.member-card.worker {
  border-left: 4px solid #4caf50; /* Verde */
  background-color: rgba(76, 175, 80, 0.05);
}

.worker {
  color: #2e7d32;
  font-weight: 500;
}

/* Estilo para el avatar por tipo */
.member-avatar.contractor {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 2px solid #bbdefb;
}

.member-avatar.worker {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 2px solid #c8e6c9;
}

/* Estilo para el badge por tipo */
.member-card.contractor .member-info h3 {
  color: #0277bd;
}

</style>
