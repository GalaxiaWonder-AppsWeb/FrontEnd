<template>
  <div class="organization-layout">
    <ToolbarComponent />

    <main class="organization-main">
      <router-view />
    </main>
  </div>
</template>

<script>
import ToolbarComponent from '../../public/components/toolbar-content.component.vue'
import {organizationMemberService} from "../services/organization-member.service.js";

export default {
  name: 'OrganizationLayout',
  data(){
    return {
      personId: null,
      organizationId: null
    }
  },
  components: {
    ToolbarComponent
  },
  methods: {
    async GetMemberType() {
      try {
        const res = await organizationMemberService.getByPersonAndOrgId({
          personId: this.personId,
          organizationId: this.organizationId
        })
        const user = JSON.parse(localStorage.getItem("user"))
        console.log("RES:",res)
        user.activeOrganizationRole = res[0].type
        localStorage.setItem("user", JSON.stringify(user))
        console.log("CREDENCIALES DEL USUARIO DENTRO DE UNA ORGANIZACION:",user)
      } catch (err) {
        console.error("Error al obtener rol de organización:", err)
      }
    }
  },
  created() {
    this.GetMemberType()
  }
}



</script>

<style scoped>
.organization-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.organization-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
