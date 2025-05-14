<script>
import { organizationMemberService } from '../services/members.service.js';

export default {
  name: "OrganizationMembers",
  data() {
    return {
      organizationId: null,
      members: [],
      invitations: []
    }
  },
  async mounted() {

  },
  async created() {
    try {
      const raw = localStorage.getItem("organization")
      if (!raw) {
        console.warn("No hay 'organization' en localStorage")
        return
      }

      const organization = JSON.parse(raw)
      if (!organization?.id) {
        console.warn("El objeto 'organization' no tiene un 'id'")
        return
      }

      this.organizationId = organization.id
      console.log("orga:", this.organizationId)

      const members = await organizationMemberService.getByOrganizationId(this.organizationId);
      this.members = members;


    } catch (err) {
      console.error("Error al cargar miembros o invitaciones:", err)
    }
  }
}
</script>

<template>
  <pv-card class="organization-members-container">
    <template #content>
      <div class="section-title">{{ $t('organization.member.membersTitle') }}</div>

      <div v-if="members.length === 0" class="empty-state">
        {{ $t('organization.member.noMembers') }}
      </div>

      <div v-else class="members-grid">
        <div v-for="member in members"
             :key="member.id"
             class="member-card">
          <p><strong>{{ member.firstName }} {{ member.lastName }}</strong></p>
          <p>{{ member.email }}</p>
          <p>{{ $t('organization.member.role.title') }}: {{ $t('organization.member.role.' + member.type) }}</p>
          <p>{{ $t('organization.member.since') }}: {{ member.joinedAt }}</p>
        </div>
      </div>

      <div class="section-title">{{ $t('organization.member.invitationsTitle') }}</div>

      <div v-if="invitations.length === 0" class="empty-state">
        {{ $t('organization.member.noInvitations') }}
      </div>

      <div v-else class="invitations-list">
        <div v-for="inv in invitations" :key="inv.id" class="invitation-card">
          {{ $t('organization.member.invitationFor') }}: {{ inv.personId }}
        </div>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.organization-members-container {
  padding: 1rem;
  background: #f9fafe;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  color: black;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.empty-state {
  color: #7f8c8d;
  font-style: italic;
  margin-bottom: 1rem;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.member-card {
  background-color: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 0.75rem;
  padding: 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease;
}

.member-card:hover {
  transform: translateY(-4px);
}

.invitations-list {
  margin-top: 0.5rem;
}

.invitation-card {
  background-color: #e8f0fe;
  border: 1px dashed #90caf9;
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
