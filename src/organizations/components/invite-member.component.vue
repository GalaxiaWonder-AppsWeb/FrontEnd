<template>
  <div class="invite-member-container">
    <h3>{{ $t('organization.invite.title') }}</h3>
    <form @submit.prevent="inviteUser">
      <span class="p-input-icon-left">
        <pv-input-text
            v-model="email"
            :placeholder="$t('organization.invite.email_placeholder')"
            :class="{ 'p-invalid': !!error }"
            class="w-full"
            required
        />
      </span>
      <small v-if="error" class="p-error">{{ error }}</small>
      <pv-button style="margin-left: 10px"
          type="submit"
          icon="pi pi-user-plus"
          :label="$t('organization.invite.button')"
          :loading="loading"
          class="mt-3"
      />
    </form>
    <div v-if="successMsg" class="success-message">{{ successMsg }}</div>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import { organizationInvitationService } from "../services/organization-invitation.service.js";

export default {
  name: "InviteMember",
  data() {
    return {
      route: useRoute(),
      email: "",
      error: "",
      loading: false,
      successMsg: ""
    };
  },
  computed: {
    organizationId() {
      return this.route.params.orgId;
    }
  },
  methods: {
    async inviteUser() {
      this.error = "";
      this.successMsg = "";
      if (!this.email.trim()) {
        this.error = this.$t('organization.invite.invalid_email');
        return;
      }
      // Validación básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.error = this.$t('organization.invite.invalid_email');
        return;
      }

      this.loading = true;
      try {
        await organizationInvitationService.invite({
          organizationId: Number(this.organizationId),
          email: this.email.trim()
        });

        this.successMsg = this.$t('organization.invite.success_title', { email: this.email });
        this.email = "";
        if (this.$toast) {
          this.$toast.add({
            severity: 'success',
            summary: this.$t('organization.invite.success_title'),
            detail: this.$t('organization.invite.success_message', { name: this.name }),
            life: 3000
          });
        }
        this.$emit('invitationSent'); // notifica a padre si es necesario
      } catch (err) {
        this.error = this.$t('organization.invite.error_message');
        console.error("Error invitando:", err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.invite-member-container {
  padding: 1.5rem;
  max-width: 380px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

form {
  margin-bottom: 1rem;
}
.mt-3 { margin-top: 1rem; }
.p-error { color: #e63946; }
.success-message { color: #119822; padding-top: .5rem; }
</style>
