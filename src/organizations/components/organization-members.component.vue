<script>
import { organizationMemberService } from '../services/organization-member.service.js'

export default {
  name: "OrganizationMembers",
  data() {
    return {
      organizationId: null,
      members: [],
    }
  },
  async created() {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      this.organizationId = user.organizationId

      const membersRes = await organizationMemberService.getByOrgId({
        organizationId: this.organizationId
      })
      this.members = membersRes
    } catch (err) {
      console.error("Error al cargar miembros:", err)
    }
  }
}
</script>

<template>
  <div>
    <div class="section-title">
      Miembros actuales
    </div>

    <div v-if="members.length === 0">
      No hay miembros registrados.
    </div>

    <div v-else>
      <button
          v-for="member in members"
          :key="member.id"
          class="member-button"
      >
        {{ member.name }}
      </button>
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
}

.member-button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
}
</style>