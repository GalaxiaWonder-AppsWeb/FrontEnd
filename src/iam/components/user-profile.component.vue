<template>
  <div class="profile-container">
    <!-- Toast para mensajes -->
    <pv-toast />
    
    <div class="profile-header">
      <div class="header-left">
        <pv-button 
          icon="pi pi-arrow-left" 
          class="p-button-text p-button-rounded back-button" 
          @click="goBack"
          aria-label="Volver"
          v-tooltip="$t('navigation-toolbar.back')"
        />
        <h1>{{ $t('profile.title') }}</h1>
      </div>
      <div>
        <pv-button 
          v-if="!editMode" 
          icon="pi pi-pencil" 
          :label="$t('profile.edit')" 
          @click="startEdit" 
          class="p-button-outlined" 
        />
        <div v-else class="edit-actions">
          <pv-button 
            icon="pi pi-check" 
            :label="$t('profile.save')" 
            @click="saveProfile" 
            class="p-button-success"
            :disabled="saving"
          />
          <pv-button 
            icon="pi pi-times" 
            :label="$t('profile.cancel')" 
            @click="cancelEdit" 
            class="p-button-outlined p-button-secondary"
            :disabled="saving"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <pv-progress-spinner />
      <p>{{ $t('profile.loading') }}</p>
    </div>
    <div v-else-if="error" class="error-message">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--red-500);"></i>
      <p>{{ error }}</p>
    </div>

    <div v-else class="profile-content">
      <!-- Foto de perfil -->      <div class="profile-picture-container">
        <div class="profile-picture" :class="{ 'uploading': isUploadingImage }">
          <img 
            v-if="formData.profilePicture && !isUploadingImage" 
            :src="formData.profilePicture" 
            alt="Profile Picture" 
            class="profile-image" 
          />
          <div v-else-if="!isUploadingImage" class="profile-placeholder">
            {{ getInitials() }}
          </div>
          
          <div v-if="isUploadingImage" class="upload-progress">
            <pv-progress-spinner style="width: 50px; height: 50px" />
          </div>
          
          <div v-if="editMode && !isUploadingImage" class="picture-edit-overlay">
          </div>
        </div>
      </div>

      <pv-card class="profile-card">
        <template #title>
          {{ $t('profile.personal_information') }}
        </template>
        <template #content>
          <div class="profile-form">
            <!-- Campos de información personal -->
            <div class="form-field">
              <label for="name">{{ $t('profile.name') }}</label>
              <pv-input-text 
                id="name" 
                v-model="formData.firstName"
                :disabled="!editMode" 
                class="w-full"
              />
            </div>
            
            <div class="form-field">
              <label for="lastName">{{ $t('profile.lastName') }}</label>
              <pv-input-text 
                id="lastName" 
                v-model="formData.lastName"
                :disabled="!editMode" 
                class="w-full"
              />
            </div>
            
            <div class="form-field">
              <label for="email">{{ $t('profile.email') }}</label>
              <pv-input-text 
                id="email" 
                v-model="formData.email"
                :disabled="true" 
                class="w-full"
              />
              <small v-if="editMode">{{ $t('profile.email_note') }}</small>
            </div>
            
            <div class="form-field">
              <label for="phoneNumber">{{ $t('profile.phoneNumber') }}</label>
              <pv-input-text 
                id="phoneNumber" 
                v-model="formData.phoneNumber" 
                :disabled="!editMode"
                class="w-full"
              />
            </div>
          </div>
        </template>
      </pv-card>
      
      <pv-card class="profile-card">
        <template #title>
          {{ $t('profile.account_information') }}
        </template>
        <template #content>
          <div class="profile-form">
            <div class="form-field">
              <label for="userType">{{ $t('profile.userType') }}</label>
              <pv-input-text 
                id="userType" 
                v-model="formData.userType"
                :disabled="true"
                class="w-full"
              />
            </div>
            
            <div class="form-field">
              <label for="password">{{ $t('profile.password') }}</label>
              <div class="password-field">
                <pv-password 
                  v-if="editMode"
                  id="password" 
                  v-model="formData.password"
                  :placeholder="$t('profile.new_password')"
                  class="w-full"
                />
                <div v-else class="password-placeholder">
                  ••••••••
                  <pv-button
                    icon="pi pi-lock"
                    class="p-button-rounded p-button-text"
                    v-tooltip="$t('profile.change_password')"
                    @click="startEdit"
                  />
                </div>
              </div>
            </div>
            
            <div class="form-field" v-if="editMode && formData.password">
              <label for="confirmPassword">{{ $t('profile.confirm_password') }}</label>
              <pv-password 
                id="confirmPassword" 
                v-model="formData.confirmPassword"
                :placeholder="$t('profile.confirm_password')"
                class="w-full"
                :class="{'p-invalid': passwordError}"
              />
              <small class="p-error" v-if="passwordError">{{ passwordError }}</small>
            </div>
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script>
import { personService } from '../../shared/services/person.service';
import { authService } from '../services/auth.service.js';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

export default {
  name: 'UserProfile',
  setup() {
    // Inicializar el servicio de Toast
    const toast = useToast();
    const router = useRouter();
    return { toast, router };
  },  data() {
    return {
      loading: true,
      saving: false,
      error: null,
      editMode: false,
      passwordError: null,
      isUploadingImage: false,
      user: null,
      person: null,
      formData: {
        name: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        profession: '',
        userType: '',
        password: '',
        confirmPassword: ''
      },
      originalData: {}
    };
  },
  methods: {
    goBack() {
      // Intenta volver hacia atrás en el historial
      if (window.history.length > 2) {
        this.router.go(-1);
      } else {
        // Si no hay historial, ir a la vista de organizaciones
        this.router.push('/organizations');
      }
    },
    
    getInitials() {
      if (!this.formData.name) return '?';
      
      const firstName = this.formData.name.charAt(0);
      const lastName = this.formData.lastName ? this.formData.lastName.charAt(0) : '';
      
      return (firstName + lastName).toUpperCase();
    },

    
    async loadUserData() {
      this.loading = true;
      this.error = null;
        try {
        // Obtener datos del usuario actual desde localStorage o servicio
        const user = authService.getCurrentUser();
        if (!user || !user.personId) {
          throw new Error(this.$t('profile.error.user_not_found'));
        }
        
        this.user = user;
        
        // Cargar datos completos de la persona
        const personData = await personService.getById(user.personId);
        if (!personData) {
          throw new Error(this.$t('profile.error.person_not_found'));
        }
        
        this.person = personData;
        
        // Rellenar el formulario
        this.formData = {
          firstName: personData.firstName || '',
          lastName: personData.lastName || '',
          email: personData.email || user.email || '',
          phoneNumber: personData.phone || '',
          profession: personData.profession || '',
          userType: personData.userType || user.userType || '',
          password: '',
          confirmPassword: '',
        };
        
        // Guardar datos originales para cancelar cambios
        this.originalData = {...this.formData};
        
      } catch (error) {
        console.error('Error loading user profile:', error);
        this.error = error.message || this.$t('profile.error.loading');
      } finally {
        this.loading = false;
      }
    },
    
    startEdit() {
      this.editMode = true;
    },
    
    cancelEdit() {
      // Restaurar datos originales
      this.formData = {...this.originalData};
      this.formData.password = '';
      this.formData.confirmPassword = '';
      this.passwordError = null;
      this.editMode = false;
    },
    
    validateForm() {
      this.passwordError = null;
      
      // Validar que las contraseñas coinciden si se está cambiando
      if (this.formData.password) {
        if (this.formData.password !== this.formData.confirmPassword) {
          this.passwordError = this.$t('profile.error.password_mismatch');
          return false;
        }
        
        if (this.formData.password.length < 6) {
          this.passwordError = this.$t('profile.error.password_too_short');
          return false;
        }
      }
      
      return true;
    },
    
    async saveProfile() {
      if (!this.validateForm()) {
        return;
      }
      
      this.saving = true;
      
      try {
        // Crear objeto con datos actualizados para la persona
        const updatedPerson = {
          ...this.person,
          name: this.formData.name,
          lastName: this.formData.lastName,
          phoneNumber: this.formData.phoneNumber,
          profession: this.formData.profession
        };

        
        // Actualizar la persona en el backend
        await personService.update(String(updatedPerson.id), updatedPerson);
        
        // Si hay cambio de contraseña, actualizarla
        if (this.formData.password) {
          await authService.updatePassword(this.user.id, this.formData.password);
        }
        
        // Actualizar datos originales
        this.originalData = {...this.formData};
        this.originalData.password = '';
        this.originalData.confirmPassword = '';
        
        // Actualizar datos en localStorage
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          currentUser.name = updatedPerson.name;
          currentUser.lastName = updatedPerson.lastName;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
          // Notificar éxito
        this.toast.add({
          severity: 'success',
          summary: this.$t('profile.success.title'),
          detail: this.$t('profile.success.saved'),
          life: 3000
        });
        
        // Salir del modo edición
        this.editMode = false;
        
      } catch (error) {
        console.error('Error saving user profile:', error);
        this.toast.add({
          severity: 'error',
          summary: this.$t('profile.error.title'),
          detail: error.message || this.$t('profile.error.saving'),
          life: 5000
        });
      } finally {
        this.saving = false;
      }
    }
  },
  created() {
    this.loadUserData();
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-button {
  margin-right: 0.5rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.profile-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
}

.upload-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 2;
}

.profile-card {
  margin-bottom: 2rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 3rem 0;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 3rem 0;
  color: var(--red-700);
  text-align: center;
}

.password-placeholder {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--surface-300);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  background-color: var(--surface-50);
  color: var(--text-color-secondary);
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .profile-header h1 {
    margin-bottom: 0;
  }
}
</style>
