<template>
  <form @submit.prevent="handleRegister" class="p-fluid form-grid register-card">
    <div class="language-wrapper">
      <LanguageSwitcher />
    </div>


    <h1 class="form-title">{{ $t('register.title') }}</h1>
    <p v-if="message" :class="['message', messageType]">{{ message }}</p>


    <!-- Name and Lastname -->
    <div class="field-row">
      <div class="p-field">
        <label for="name">{{ $t('register.name') }}</label>
        <pv-input-text id="name" v-model="name" required />
      </div>
      <div class="p-field">
        <label for="lastName">{{ $t('register.last-name') }}</label>
        <pv-input-text id="lastName" v-model="lastName" required />
      </div>
    </div>

    <!-- Phone and Profession -->
    <div class="field-row">
      <div class="p-field">
        <label for="phoneNumber">{{ $t('register.phone') }}</label>
        <div class="input-wrapper">
          <span class="flag-prefix-inside">
            <svg width="22" height="14" viewBox="0 0 24 16">
              <rect width="8" height="16" fill="#D91023"/>
              <rect x="8" width="8" height="16" fill="#fff"/>
              <rect x="16" width="8" height="16" fill="#D91023"/>
            </svg>
            <span class="prefix">+51</span>
          </span>
          <pv-input-text
              class="phone-input"
              id="phoneNumber"
              v-model="phoneDigits"
              type="tel"
              inputmode="numeric"
              pattern="^[0-9]{9}$"
              maxlength="9"
              required
              style="padding-left: 55px;"
          />
        </div>

      </div>

    </div>

    <!-- Email -->
    <div class="p-field">
      <label for="email">{{ $t('register.email') }}</label>
      <pv-input-text id="email" v-model="email" type="email" required />
    </div>

    <!-- Password -->
    <div class="p-field">
      <label for="password">{{ $t('register.password') }}</label>
      <pv-password id="password" v-model="password"   :feedback="false" toggleMask :mask="true" required />
    </div>

    <!-- Rol -->
    <div class="p-field">
      <label>{{ $t('register.roles.title') }}</label>
      <SelectRole v-model="role" required/>
    </div>

    <pv-button
        class="p-button"
        :label="$t('register.submit')"
        icon="pi pi-user-plus"
        type="submit"
        :disabled="!role || (['Contractor', 'Specialist'].includes(role) )"
    />

    <!-- Enlace al login debajo del botón -->
    <div class="login-link">
      <router-link to="/login">
        {{ $t('register.go-to-login') || "¿Ya tienes cuenta? Inicia sesión aquí" }}
      </router-link>
    </div>
  </form>

</template>

<script>
import { Credentials } from '../model/credentials.entity.js'
import { Person } from '../model/person.entity.js'
import { AuthService } from '../services/auth.service.js'
import SelectRole from './select-role.component.vue'
import LanguageSwitcher from '../../public/components/language-switcher.component.vue'
import {UserType} from "../model/user-type.js";
import {UserAccount} from "../model/user-account.entity.js";

export default {
  name: 'RegisterForm',
  components: { LanguageSwitcher, SelectRole },
  data() {
    return {
      name: '',
      lastName: '',
      phoneDigits: '',
      email: '',
      password: '',
      role: '', // If u want an empty field use it like this, but always use enum values later for security
      message: '',
      messageType: 'success',
      authService: new AuthService(),
    }
  },
  methods: {
    async handleRegister() {


      this.message = ''

      const fullPhone = '+51' + this.phoneDigits;
      const phoneRegex = /^\+51[0-9]{9}$/;

      if (!phoneRegex.test(fullPhone)) {
        this.message = this.$t('register.errors.invalid-phone');
        this.messageType = 'error';
        return;
      }


      if (!this.role) {
        this.message = this.$t('register.errors.missing-role');
        this.messageType = 'error';
        return;
      }



      try {
        const person = new Person(
            this.name,
            this.lastName,
            this.email,
            fullPhone,
        )

        const credentials = new Credentials(
            this.email,
            this.password
        )

        const account = new UserAccount({
          credentials,
          userType: this.role
        })

        const result = await this.authService.register(account, person)

        this.message = `${result.email} ${this.$t('register.successful-register')}`
        this.messageType = 'success'


        this.name = ''
        this.lastName = ''
        this.phoneDigits = ''
        this.email = ''
        this.password = ''
        this.role = ''

        this.$router.push('/login')
      } catch (error) {

          if (error?.message?.includes('already taken')) {
            this.message = this.$t('register.errors.email-taken');
          } else {
            this.message = error?.message || 'Unexpected error';
          }

          this.messageType = 'error';
      }
    }
  },
  watch: {
  }
}
</script>
<style scoped>
.message {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  padding: 0.5rem;
  border-radius: 6px;
}

.message.success {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.message.error {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.register-card {
  max-width: 540px;
  margin: 3rem auto;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.15);
  color: black;
  background-color: white;
}

.language-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}


.form-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-row {
  display: flex;
  gap: 1rem;
}

.p-field {
  display: flex;
  flex-direction: column;
  flex: 1;
}

label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
  font-size: 0.95rem;
  min-height: 1.5rem;
}

.p-button {
  width: 100%;
}

::v-deep(.p-password-input) {
  width: 100% !important;
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
}
.login-link a {
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  width: 100%;
}
.flag-prefix-inside {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 2;
}
.flag-prefix-inside svg {
  vertical-align: middle;
}
.prefix {
  margin-left: 0.25em;
  font-weight: 500;
  color: #fffdfd;
}
.phone-input, .input-wrapper .p-inputtext {
  width: 100%;
  box-sizing: border-box;
  padding-left: 80px; /* <--- AJUSTA aquí según tu UI */
}

.phone-input {
  padding-left: 80px!important; /* Ajusta el padding para que no se superponga con el prefijo */
}

</style>