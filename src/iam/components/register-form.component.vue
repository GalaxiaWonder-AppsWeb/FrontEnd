<template>
  <div class="register-card">
    <language-switcher/>

    <h2>{{ $t('register.title') }}</h2>

    <form @submit.prevent="handleRegister" class="p-fluid">
      <div class="p-field">
        <label for="email">{{ $t('register.email') }}</label>
        <pv-input-text id="email" v-model="email" type="email" required />
      </div>

      <div class="p-field">
        <label for="password">{{ $t('register.password') }}</label>
        <pv-password id="password" v-model="password" toggleMask :feedback="false" required />
      </div>

      <div>
        <SelectRole v-model="role" />
      </div>

      <pv-button class="p-button" :label="$t('register.submit')" icon="pi pi-user-plus" type="submit" />
    </form>

    <pv-message class="p-message" v-if="message" :severity="messageType" :closable="false">
      {{ message }}
    </pv-message>
  </div>
</template>

<script>
import { Credentials } from '../model/credentials.entity.js'
import { AuthService } from '../services/auth.service.js'
import SelectRole from "./select-role.component.vue";
import LanguageSwitcher from "../../public/components/language-switcher.component.vue";

export default {
  name: 'RegisterForm',
  components: {LanguageSwitcher, SelectRole},
  data() {
    return {
      email: '',
      password: '',
      role: '',
      message: '',
      messageType: 'success',
      authService: new AuthService()
    }
  },
  methods: {
    async handleRegister() {
      this.message = ''
      try {
        const credentials = new Credentials(this.email, this.password)
        const result = await this.authService.register(credentials)
        this.message = `${result.email} ${this.$t('register.successful-register')}`
        this.messageType = 'success'
        this.email = ''
        this.password = ''
      } catch (error) {
        this.message = error.message
        this.messageType = 'error'
      }
    }
  }
}
</script>

<style scoped>
.register-card {
  max-width: 480px;
  margin: 3rem auto;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
  color: black;
}

.p-field {
  margin-bottom: 1.5rem;
  width: 100%;
}

label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
}

form {
  margin-bottom: 1.5rem;
}

.p-button {
  width: 100%;
}

.p-message {
  font-size: 0.95rem;
  padding: 1rem;
}
</style>
