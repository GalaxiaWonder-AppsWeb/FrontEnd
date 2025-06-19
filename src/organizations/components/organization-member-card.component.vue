<script>
import { OrganizationMemberType } from '../model/organization-member-type.js';

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
      type: [String, Number],
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
      // Usado para clases de estilo dinámicas
      return type === OrganizationMemberType.CONTRACTOR ? 'contractor' : 'worker';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    handleProfileImageError(event) {
      event.target.style.display = 'none';
      const placeholder = event.target.parentElement.querySelector('.member-avatar-placeholder');
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
    },
    confirmRemove() {
      this.$emit('remove', {
        id: this.member.id,
        name: `${this.member.person?.firstName || 'Usuario'} ${this.member.person?.lastName || ''}`.trim()
      });
    }
  }
}
</script>

<template>
  <pv-card class="member-card" :class="getMemberTypeClass(member.type)">
    <template #title>
      <div class="member-card-header">
        <div class="member-avatar" :class="getMemberTypeClass(member.type)">
          <img v-if="member.person?.profilePicture"
               :src="member.person.profilePicture"
               @error="handleProfileImageError"
               alt="Profile Picture"
               class="member-avatar-image"
          />
          <div v-else class="member-avatar-placeholder">
            {{ getInitials(member.person?.firstName, member.person?.lastName) }}
          </div>
        </div>
        <div class="member-info">
          <h3>
            {{ member.person?.firstName || 'Usuario' }} {{ member.person?.lastName || 'Desconocido' }}
          </h3>
          <p class="member-email" v-if="member.person?.email">
            <i class="pi pi-envelope"></i>
            {{ member.person.email }}
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
.member-card.contractor {
  border-left: 4px solid #2196f3;
  background-color: rgba(33, 150, 243, 0.05);
}
.member-card.worker {
  border-left: 4px solid #4caf50;
  background-color: rgba(76, 175, 80, 0.05);
}
.contractor {
  color: #0277bd;
  font-weight: 600;
}
.worker {
  color: #2e7d32;
  font-weight: 500;
}
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
.member-card.contractor .member-info h3 {
  color: #0277bd;
}
</style>
