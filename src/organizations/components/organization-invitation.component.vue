<script>
import { OrganizationInvitationService } from '../services/organization-invitation.service.js'

export default {
  name: "organization-invitation.component.vue",
  data() {
    return {
      organizationId: null,
      invitations: []
    }
  },
  async created() {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      this.organizationId = user.organizationId

      const invitationsRes = await OrganizationInvitationService.getByOrganizationId({
        organizationId: this.organizationId
      })
      this.invitations = invitationsRes

    } catch (err) {
      console.error("Error al cargar invitaciones:", err)
    }
  }
}

</script>

<template>
  <div>
    <div class="section-title">
      Invitaciones
    </div>

    <div v-if="invitations.length === 0">
      No hay invitaciones registradas.
    </div>
  </div>
</template>

<style scoped>
.section-title {
  color: #2c3e50;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background-color: #f0f8ff;
}

section > .empty-state {
  font-style: italic;
  color: #777;
  padding: 0.75rem 1rem;
}

.invitation-list > div {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: #eaf4ff;
  border-radius: 6px;
  text-align: left;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
</style>