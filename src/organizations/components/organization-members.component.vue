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
  <div class="organization-members-container">
    <!-- Members -->
    <div class="section-title">Miembros actuales</div>

    <div v-if="members.length === 0" class="empty-text">
      No hay miembros registrados.
    </div>

    <div v-for="member in members"
         :key="member.id"
         class="member-card">
      <p class="member-line">{{ member.firstName }}</p>
      <p class="member-line">{{ member.lastName }}</p>
      <p class="member-line">{{ member.email }}</p>
      <p class="member-line">{{ member.type }}</p>
      <p class="member-line">{{ member.joinedAt }}</p>
    </div>

    <!-- Invitations -->
    <div class="section-title invitations">Invitaciones</div>

    <div v-if="invitations.length === 0" class="empty-text">
      No hay invitaciones registradas.
    </div>

    <div v-else class="invitation-list">
      <div v-for="inv in invitations" :key="inv.id" class="invitation-card">
        {{ inv.personId }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.organization-members-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.section-title {
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
  padding-left: 4px;
}

.empty-text {
  color: #888;
  padding: 0.5rem 0;
}

.member-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 5px;
  width: 100%;
  max-width: 375px;
  padding: 10px;
  border-radius: 10px;
  background: var(--nutral-f-6-faf-9, #F6FAF9);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.member-line {
  font-size: 0.95rem;
  color: black;
  margin: 0;
}

.invitation-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.invitation-card {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background: #EAF4FF;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.15);
  max-width: 375px;
  width: 100%;
  color: #333;
}
</style>
