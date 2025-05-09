<script>
import { organizationService } from '../services/organization.service.js'
import { Organization } from '../model/organization.entity.js'
import { PersonId } from '../../iam/model/person.entity.js'
import { Ruc } from '../model/ruc.js'
import { OrganizationStatus } from '../model/organization-status.js'

export default {
  name: 'OrganizationTest',
  data() {
    return {
      organizationId: '',
      personId: 'person-001', // para miembro o invitación
      message: ''
    }
  },
  methods: {
    async testCreate() {
      try {
        const org = new Organization({
          legalName: 'Test Org SAC',
          commercialName: 'TestOrg',
          ruc: new Ruc('20123456789'),
          createdBy: new PersonId(this.personId),
          status: OrganizationStatus.ACTIVE
        })

        const res = await organizationService.create(org.toJSON())
        this.organizationId = org.id
        this.message = `Created: ${res.legalName}`
        console.log("CREATED ORG ID: " + org.id)
        console.log("THIS ID: " + this.organizationId)
      } catch (err) {
        this.message = err.message
      }
    },

    async testGetAll() {
      try {
        const res = await organizationService.getAll()
        this.message = `Fetched ${res.length} organizations`
        console.log(res)
      } catch (err) {
        this.message = err.message
      }
    },

    async testGetById() {
      try {
        console.log(this.organizationId)
        const res = await organizationService.getById({id: this.organizationId})
        this.message = `Fetched: ${res.legalName}`
        console.log(res)
      } catch (err) {
        this.message = err.message
      }
    },

    async testUpdate() {
      try {
        const updatedOrg = new Organization({
          id: this.organizationId,
          legalName: 'Test Updated Org SAC',
          commercialName: 'TestOrg',
          ruc: new Ruc('20123456789'),
          createdBy: this.personId,
          status: OrganizationStatus.INACTIVE
        });

        console.log("ID DEL UPDATED:" + updatedOrg.id)
        const res = await organizationService.update(updatedOrg.toJSON())

        this.message = `Updated: ${res.legalName}`
        console.log(res)
      } catch (err) {
        this.message = err.message
      }
    },

    async testDelete() {
      try {
        await organizationService.delete({id: this.organizationId})
        this.message = `Deleted organization ${this.organizationId}`
        this.organizationId = ''
      } catch (err) {
        this.message = err.message
      }
    }
  }
}
</script>

<template>
  <div class="org-test">
    <h2>Organization Service Test</h2>
    <div class="buttons">
      <button @click="testCreate">Create</button>
      <button @click="testGetAll">Get All</button>
      <button @click="testGetById" :disabled="!organizationId">Get By ID</button>
      <button @click="testUpdate" :disabled="!organizationId">Update</button>
      <button @click="testDelete" :disabled="!organizationId">Delete</button>
    </div>

    <p v-if="message"><strong>{{ message }}</strong></p>
  </div>
</template>

<style scoped>
.org-test {
  padding: 1rem;
}

button {
  margin: 0.25rem;
  padding: 0.5rem 1rem;
}
</style>
