<template>
  <form @submit.prevent="handleRegister" class="p-fluid form-grid register-card">
    <div class="language-wrapper">
      <LanguageSwitcher />
    </div>


    <h2 class="form-title">{{ $t('register.title') }}</h2>

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
        <pv-input-text id="phoneNumber" v-model="phoneNumber" type="tel" required />
      </div>
      <div class="p-field">
        <label for="profession">{{ $t('register.profession') }}</label>
        <pv-input-text
            id="profession"
            v-model="profession"
            :disabled="role?.value === 'Client'"
            class="profession-input"
        />
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
      <pv-password id="password" v-model="password" toggleMask :feedback="false" required />
    </div>

    <!-- Rol -->
    <div class="p-field">
      <label>{{ $t('register.roles.title') }}</label>
      <SelectRole v-model="role" />
    </div>

    <pv-button class="p-button" :label="$t('register.submit')" icon="pi pi-user-plus" type="submit" />
  </form>

</template>

<script>
import { Credentials } from '../model/credentials.entity.js'
import { Person } from '../model/person.entity.js'
import { AuthService } from '../services/auth.service.js'
import SelectRole from './select-role.component.vue'
import LanguageSwitcher from '../../public/components/language-switcher.component.vue'

export default {
  name: 'RegisterForm',
  components: { LanguageSwitcher, SelectRole },
  data() {
    return {
      name: '',
      lastName: '',
      phoneNumber: '',
      profession: '',
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
        const person = new Person(
            this.name,
            this.lastName,
            this.email,
            this.phoneNumber,
            this.profession
        )

        const credentials = new Credentials(
            this.email,
            this.password,
            this.role
        )

        const result = await this.authService.register(credentials, person)

        this.message = `${result.email} ${this.$t('register.successful-register')}`
        this.messageType = 'success'

        this.name = ''
        this.lastName = ''
        this.phoneNumber = ''
        this.profession = ''
        this.email = ''
        this.password = ''
        this.role = ''
      } catch (error) {
        this.message = error.message
        this.messageType = 'error'
      }
    }
  },
  watch: {
    role(newRole) {
      if (newRole === 'Client' || newRole?.value === 'Client') {
        this.profession = '';
      }
    }
  }
}
</script>
<style scoped>
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
  font-size: 1.25rem;
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


.p-message {
  font-size: 0.95rem;
  padding: 1rem;
}

::v-deep(.profession-input:disabled) {
  color: #888888;             /* texto gris tenue */
  cursor: not-allowed;
  opacity: 1; /* evita que se vea deslavado si PrimeVue le baja la opacidad */
}


</style>