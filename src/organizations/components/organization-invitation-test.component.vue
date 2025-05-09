<script>
import { OrganizationInvitationService } from '../services/organization-invitation.service.js'
import {PersonId} from "../../iam/model/person.entity.js";
import {OrganizationInvitationStatus} from "../model/organization-invitation-status.js";
import {OrganizationId} from "../model/organization.entity.js";
import {OrganizationInvitation} from "../model/organization-invitation.entity.js";

export default {
  name: 'OrganizationInvitationTest',
  data() {
    return {
      organizationId: '',
      personId: '006b0403-ab9e-4f78-9288-cd3570fb1c0d',
      personId2: '644c5132-03ef-46bb-bc25-a69e6b05fb80',
      invitations: [],
      message: ''
    }
  },
  methods: {
    async testInvitePerson() {
      try {
        const person1 = new PersonId()
        person1.value = this.personId
        const person2 = new PersonId()
        person2.value = this.personId2
        const org = new OrganizationId()
        org.value = this.organizationId

        const invitation = new OrganizationInvitation({
          organizationId: org,
          personId: person1,
          invitedBy: person2,
        })

        const res = await OrganizationInvitationService.invitePerson(invitation);

        this.message = `Invitation sent to ${res.personId}`;
        console.log(res);
      } catch (err) {
        this.message = err.message;
      }
    },

    async testGetInvitations() {
      try {
        const res = await OrganizationInvitationService.getByOrganizationId({
          organizationId: this.organizationId
        });
        this.invitations = res;
        this.message = `Fetched ${res.length} invitations`;
        console.log(res);
      } catch (err) {
        this.message = err.message;
      }
    }
  }
}
</script>

<template>
  <div class="inv-test">
    <h2>Organization Invitations Test</h2>

    <div class="form">
      <label>Organization ID:</label>
      <input v-model="organizationId" type="text" placeholder="Enter Org ID" />
    </div>

    <div class="buttons">
      <button @click="testInvitePerson" :disabled="!organizationId">Invite Person</button>
      <button @click="testGetInvitations" :disabled="!organizationId">Get Invitations</button>
    </div>

    <p v-if="message"><strong>{{ message }}</strong></p>

    <ul v-if="invitations.length">
      <li v-for="inv in invitations" :key="inv.id">
        {{ inv.personId }} - {{ inv.status }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.inv-test {
  padding: 1rem;
}
input {
  margin: 0.25rem 0;
  padding: 4px;
  width: 300px;
}
button {
  margin: 0.25rem;
  padding: 0.5rem 1rem;
}
</style>
