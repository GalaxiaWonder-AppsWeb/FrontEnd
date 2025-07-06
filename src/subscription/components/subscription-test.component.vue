<script>
import { subscriptionService } from '../services/subscription.service.js'
import { workspaceService } from '../services/workspace.service.js'
import { Subscription } from '../model/subscription.entity.js'
import { Workspace } from '../model/workspace.entity.js'
import { SubscriptionStatus } from '../model/subscription-status.js'

export default {
  name: 'SubscriptionWorkspaceTest',
  data() {
    return {
      personId: '',
      subscriptionId: '',
      organizationId: '',
      workspaceId: '',
      message: ''
    }
  },
  methods: {
    async createSubscription() {
      try {
        const subscription = new Subscription({
          personId: Number(this.personId),
          status: SubscriptionStatus.ACTIVE
        })

        const res = await subscriptionService.create(subscription.toJSON())
        this.subscriptionId = res.id
        this.message = `Subscription created with ID: ${res.id}`

      } catch (err) {
        this.message = err.message
      }
    },

    async createWorkspace() {
      try {
        const workspace = new Workspace({
          organizationId: Number(this.organizationId),
          createdBy: Number(this.personId),
          subscriptionId: Number(this.subscriptionId),
          maxMembers: 10,
          maxProjects: 5,
          maxStorageSizeInBytes: 5000000
        })
        const res = await workspaceService.create(workspace.toJSON())

        this.workspaceId = res.id
        this.message = `Workspace created with ID: ${res.id}`

      } catch (err) {
        this.message = err.message
      }
    },

    async getWorkspace() {
      try {
        const res = await workspaceService.getById(this.workspaceId)
        this.message = `Fetched workspace: ${res.id}`

      } catch (err) {
        this.message = err.message
      }
    }
  }
}
</script>

<template>
  <div class="sw-test">
    <h2>Subscription + Workspace Test</h2>

    <div class="form">
      <label>Person ID:</label>
      <input v-model="personId" type="text" placeholder="Enter person ID" />
      <label>Organization ID:</label>
      <input v-model="organizationId" type="text" placeholder="Enter organization ID" />
    </div>

    <div class="buttons">
      <button @click="createSubscription" :disabled="!personId">Create Subscription</button>
      <button @click="createWorkspace" :disabled="!organizationId || !subscriptionId">Create Workspace</button>
      <button @click="getWorkspace" :disabled="!workspaceId">Get Workspace</button>
    </div>

    <p v-if="message"><strong>{{ message }}</strong></p>
  </div>
</template>

<style scoped>
.sw-test {
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
