<template>
  <form @submit.prevent="handleLogin" class="p-fluid form-grid login-card">
    <!-- Selector de idioma -->
    <div class="language-wrapper">
      <LanguageSwitcher />
    </div>

    <!-- Título -->
    <h1 class="form-title">{{ $t('login.title') }}</h1>

    <!-- Mensaje de error -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Campo: Email -->
    <div class="p-field">
      <label for="email">{{ $t('login.email') }}</label>
      <pv-input-text id="email" v-model="form.email" type="email" required />
    </div>

    <!-- Campo: Password -->
    <div class="p-field">
      <label for="password">{{ $t('login.password') }}</label>
      <pv-password id="password" v-model="form.password" toggleMask :feedback="false" required />
    </div>

    <!-- Enlace a registro -->
    <div class="p-field">
      <p class="register-link">
        {{ $t('login.no-account') }}
        <router-link to="/register">{{ $t('login.go-register') }}</router-link>
      </p>
    </div>

    <!-- Botón -->
    <pv-button
        class="p-button"
        :label="$t('login.submit')"
        icon="pi pi-sign-in"
        type="submit"
        :loading="loading"
    />
  </form>
</template>


<script>

import LanguageSwitcher from '../../public/components/language-switcher.component.vue'
import {AuthService} from '../services/auth.service.js'
import {Credentials} from '../model/credentials.entity.js'
import { useRouter } from 'vue-router'

export default {
  name: 'login-form',
  components: {
    LanguageSwitcher
  },
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      errorMessage: '',
      router: null,
      authService: null
    }
  },
  created() {
    localStorage.clear()
    this.router = useRouter()
    this.authService = new AuthService()
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.errorMessage = ''
      try {
        const credentials = new Credentials(this.form.email, this.form.password)
        const user = await this.authService.login(credentials)

        if (user) {
          this.router.push('/organizations') // Redirige tras login
        }
      } catch (error) {
        this.errorMessage = error.message || 'Login failed'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>


<style scoped>
.login-card {
  max-width: 460px;
  margin: auto;
  padding: 2.5rem;
  border-radius: 1rem;
  background-color: white;
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  color: black;
}

.language-wrapper {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.form-title {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: bold;
}

.p-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-field label {
  font-weight: 500;
}

.p-field .p-inputtext,
.p-field .p-password {
  width: 100%;
}

.p-button {
  width: 100%;
}

.error-message {
  background-color: #ffdede;
  color: #c00000;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.95rem;
}

.register-link a {
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

::v-deep(.p-password-input) {
  width: 100% !important;
}

</style>
