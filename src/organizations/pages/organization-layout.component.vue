<script>
import {organizationMemberService} from "../services/organization-member.service.js";
import {OrganizationInvitationService} from "../services/organization-invitation.service.js";

export default {
  name: "organization-layout",
  data() {
    return {
      personId: null,
      organizationId: null,
      invitedPersonIds: [],
    }
  },
  methods: {
    async getMemberType() {
      const user = JSON.parse(localStorage.getItem("organization"))
      this.personId = user.personId
      this.organizationId = user.organizationId

      try {
        const res = await organizationMemberService.getByPersonAndOrgId({
          personId: this.personId,
          organizationId: this.organizationId
        })

        user.activeOrganizationRole = res.length > 0 ? res[0].type : null
        localStorage.setItem("user", JSON.stringify(user))
      } catch (err) {
        console.error("Error al obtener rol de organización:", err)
      }
    },

    async getInvitedPersonIds() {
      try {
        const res = await OrganizationInvitationService.getByOrganizationId({
          organizationId: this.organizationId
        })
        this.invitedPersonIds = res.map(inv => inv.personId)
      } catch (err) {
        console.error("Error al obtener invitados:", err)
      }
    }

  },
  async created() {
    await this.getMemberType()
    await this.getInvitedPersonIds()
  }
}
</script>

<template>
  <div class="organization-layout">
    <main class="organization-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>

</style>