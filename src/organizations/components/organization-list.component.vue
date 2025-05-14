<script>
import OrganizationItem from "./organization-item.component.vue";
import {organizationService} from "../services/organization.service.js";
import {OrganizationAssembler} from "../services/organization.assembler.js";
import CreateOrganization from "./create-organization.component.vue";

export default {
  name: "OrganizationList",
  components: {CreateOrganization, OrganizationItem},
  data() {
    return {
      organizations: [],
      api: organizationService,
      owner: ''
    }
  },
  methods: {
    handleOrgCreated(orgId) {
      console.log('Organización creada con ID:', orgId)
      this.loadOrganizations()
    },
    loadOrganizations(){
      console.log("Owner: ", this.owner)
      this.api.getByCreatedBy({createdBy: this.owner.personId})
          .then(data => {
            console.log(data)
            this.organizations = OrganizationAssembler.toEntitiesFromResponse(data)
          })
      console.log("ORGANIZACIONES",this.organizations)
    }
  },
  created() {
    this.owner = JSON.parse(localStorage.getItem("user"))
    this.loadOrganizations();
  }
}
</script>

<template>
  <CreateOrganization @organization-created="handleOrgCreated" />
  <div class="organization-items" v-if="organizations.length">
    <OrganizationItem
        v-for="(item, index) in organizations"
        :key="index"
        :organization="item"
    />
  </div>
  <div v-else>
    <p>{{ $t('organization.no-organizations') }}</p>
  </div>

</template>

<style scoped>

</style>