<script>
import {defineComponent} from "vue";
import LanguageSwitcher from "./public/components/language-switcher.component.vue";
import RegisterComponent from "./iam/components/register-form.component.vue"
//import OrganizationTest from "./organizations/components/organization-test.component.vue";
import BillingTest from "./billing/components/billing-test.component.vue";
import SubscriptionWorkspaceTest from "./subscription/components/subscription-test.component.vue";

export default defineComponent({
  components: {SubscriptionWorkspaceTest, BillingTest, LanguageSwitcher, RegisterComponent},
})
</script>

<template>
  <pv-toast />
  <pv-confirm-dialog></pv-confirm-dialog>
  <router-view/>
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
.pie-3d canvas,
canvas.pie-3d {
  background: #fff !important;
  color: #22223b !important;
  border-radius: 50% !important;
  box-shadow: 0 10px 28px -6px #818cf8, 0 2px 24px 0 #a7f3d0 !important;
  border: 2px solid #f3f4f6 !important;
}
</style>
