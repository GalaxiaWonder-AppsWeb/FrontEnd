<template>
  <router-link :to="`/organizations/${organization.id}`" class="card-link">
    <pv-card class="organization-card">
      <template #content>
        <div class="organization-content">
          <span class="organization-name">{{ organization.legalName }}</span>
        </div>
      </template>
    </pv-card>
  </router-link>
</template>

<script>
import { Organization } from "../model/organization.entity.js";

export default {
  name: 'OrganizationItem',
  props: {
    organization: {
      type: Organization,
      required: true
    },
    personId: String
  },
  created() {
    console.log(this.organization)
  }
}
</script>

<style scoped>
.organization-card {
  border-radius: 16px;
  background-color: #f8fbfa;
  box-shadow: 0 4px 12px rgba(5, 0, 0, 0.40);
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.organization-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.organization-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #101020;
}

.card-link {
  text-decoration: none;
  display: block;
}

</style>
