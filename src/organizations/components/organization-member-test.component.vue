<script>
import { organizationMemberService } from '../services/organization-member.service.js'
import { OrganizationMember } from '../model/organization-member.entity.js'
import { PersonId } from '../../iam/model/person.entity.js'
import { OrganizationId } from '../model/organization.entity.js'
import { OrganizationMemberType } from '../model/organization-member-type.js'

export default {
  name: 'OrganizationMemberTest',
  data() {
    return {
      organizationId: '',
      personId: '',
      members: [],
      createdMemberId: '',
      message: ''
    }
  },
  methods: {
    async testCreateMember() {
      try {
        const person = new PersonId()
        person.value = this.personId

        const organization = new OrganizationId()
        organization.value = this.organizationId

        const member = new OrganizationMember({
          personId: person,
          organizationId: organization,
          type: OrganizationMemberType.WORKER
        })

        const res = await organizationMemberService.create(member.toJSON())
        this.createdMemberId = res.id
        this.message = `Member created for person ${res.personId}`
        console.log(res)
      } catch (err) {
        this.message = err.message
      }
    },

    async testGetByOrgId() {
      try {
        const res = await organizationMemberService.getByOrgId({
          organizationId: this.organizationId
        })
        this.members = res
        this.message = `Fetched ${res.length} members`
        console.log(res)
      } catch (err) {
        this.message = err.message
      }
    },

    async testDeleteMember() {
      try {
        if (!this.createdMemberId) {
          this.message = 'No member to delete'
          return
        }

        await organizationMemberService.delete({ id: this.createdMemberId })
        this.message = `Deleted member ${this.createdMemberId}`
        this.createdMemberId = ''
      } catch (err) {
        this.message = err.message
      }
    }
  }
}
</script>

<template>
  <div class="member-test">
    <h2>Organization Members Test</h2>

    <div class="form">
      <label>Organization ID:</label>
      <input v-model="organizationId" type="text" placeholder="Enter Org ID" />
      <label>Person ID:</label>
      <input v-model="personId" type="text" placeholder="Enter Person ID" />
    </div>

    <div class="buttons">
      <button @click="testCreateMember" :disabled="!organizationId || !personId">Add Member</button>
      <button @click="testGetByOrgId" :disabled="!organizationId">Get Members</button>
      <button @click="testDeleteMember" :disabled="!createdMemberId">Delete Last Created</button>
    </div>

    <p v-if="message"><strong>{{ message }}</strong></p>

    <ul v-if="members.length">
      <li v-for="m in members" :key="m.id">
        {{ m.personId }} - {{ m.type }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.member-test {
  padding: 1rem;
}
input {
  display: block;
  margin: 0.25rem 0;
  padding: 4px;
  width: 300px;
}
button {
  margin: 0.25rem;
  padding: 0.5rem 1rem;
}
</style>
