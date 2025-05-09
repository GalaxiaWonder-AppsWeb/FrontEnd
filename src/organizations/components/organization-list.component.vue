<script>
import OrganizationItem from "./organization-item.component.vue";
import {organizationService} from "../services/organization.service.js";
import {OrganizationAssembler} from "../services/organization.assembler.js";

export default {
  name: "OrganizationList",
  components: {OrganizationItem},
  data() {
    return {
      organizations: [],
      api: organizationService,
      owner: ''
    }
  },
  methods: {
    loadOrganizations(){
      console.log("Owner: ", this.owner)
      this.api.getByCreatedBy({createdBy: this.owner.personId})
          .then(data => {
            this.organizations = OrganizationAssembler.toEntitiesFromResponse(data);
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