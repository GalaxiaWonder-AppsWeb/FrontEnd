<script>
import {organizationService} from "../services/organization.service.js";
import {OrganizationAssembler} from "../services/organization.assembler.js";


export default {
  name: "OrganizationInformation",
  data() {
    return {
      organization: null,
      api: organizationService,
      orgId: ''
    }
  },
  methods: {
    loadInformation(){
      console.log("ORGANIZATION ID: ",this.orgId);
      this.api.getById({ id: this.orgId })
          .then(data => {
            this.organization = OrganizationAssembler.toEntityFromResource(data)
            console.log("ORGANIZATION:" ,this.organization)
          })
          .catch(error => {
            console.log(error)
            this.organization = null
          })
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('es-PE').format(date)
    }
  },
  created() {
    this.orgId = this.$route.params.orgId
    this.loadInformation();
  }
}

</script>

<template>
  <div class="organization-info-card" v-if="organization">
    <div class="info-block">
      <h3 class="label">Business Name</h3>
      <p class="value">{{ organization.legalName }}</p>
    </div>
    <div class="info-block">
      <h3 class="label">RUC</h3>
      <p class="value">{{ organization.ruc }}</p>
    </div>
    <div class="info-block">
      <h3 class="label">Creation date</h3>
      <p class="value">{{ formatDate(organization.createdAt) }}</p>
    </div>
    <div class="info-block">
      <h3 class="label">Contractor</h3>
      <p class="value">{{ organization.createdBy}}</p>
    </div>
  </div>
</template>

<style scoped>
.organization-info-card {
  background-color: #f8fbfa;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  width: fit-content;
  margin: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.info-block {
  margin-bottom: 1.5rem;
}

.label {
  font-weight: 700;
  color: #101020;
  margin: 0;
}

.value {
  font-weight: 400;
  font-size: 1rem;
  color: #1c1c1c;
  margin: 0.25rem 0 0;
}
</style>