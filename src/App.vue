<script>
import {defineComponent} from "vue";
import LanguageSwitcher from "./public/components/language-switcher.component.vue";
import RegisterComponent from "./iam/components/register-form.component.vue"
import OrganizationTest from "./organizations/components/organization-test.component.vue";
import OrganizationInvitationTest from "./organizations/components/organization-invitation-test.component.vue";

export default defineComponent({
  components: {OrganizationInvitationTest, OrganizationTest, LanguageSwitcher, RegisterComponent},
})
</script>

<template>
  <OrganizationInvitationTest></OrganizationInvitationTest>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
