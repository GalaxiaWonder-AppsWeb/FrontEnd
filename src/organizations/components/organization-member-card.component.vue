<script>
import { OrganizationMemberType } from '../model/organization-member-type.js';

export default {
  name: "OrganizationMemberCard",
  props: {
    member: {
      type: Object,
      required: true
    },
    isCreator: {
      type: Boolean,
      default: false
    },
    currentUserId: {
      type: String,
      default: null
    }
  },
  methods: {
    getInitials(firstName, lastName) {
      const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '?';
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    },
    
    getMemberTypeClass(type) {
      return type === OrganizationMemberType.CONTRACTOR ? 'contractor' : 'worker';
    },
    
    getMemberRoleBadgeClass(type) {
      return {
        'contractor-badge': type === OrganizationMemberType.CONTRACTOR,
        'worker-badge': type === OrganizationMemberType.WORKER
      };
    },
    
    getMemberRoleIcon(type) {
      if (type === OrganizationMemberType.CONTRACTOR) {
        return 'pi pi-star';
      } else if (type === OrganizationMemberType.WORKER) {
        return 'pi pi-user';
      }
      return 'pi pi-user';
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    
    // Emite el evento para eliminar un miembro
    confirmRemove() {
      this.$emit('remove', {
        id: this.member.id,
        name: `${this.member.person.name} ${this.member.person.lastName}`
      });
    }
  }
}
</script>

<template>
  <pv-card class="member-card" :class="getMemberTypeClass(member.type)">
    <template #header>
      <!--<div class="member-role-badge" :class="getMemberRoleBadgeClass(member.type)">
        <i :class="getMemberRoleIcon(member.type)"></i>
      </div>-->
    </template>
    
    <template #title>
      <div class="member-card-header">
        <div class="member-avatar" :class="getMemberTypeClass(member.type)">
          {{ getInitials(member.person?.name, member.person?.lastName) }}
        </div>
        <div class="member-info">
          <h3>{{ member.person?.name || 'Usuario' }} {{ member.person?.lastName || 'Desconocido' }}</h3>
          <p class="member-email" v-if="member.person?.email">
            <i class="pi pi-envelope"></i>
            {{ member.person?.email }}
          </p>
        </div>
        <pv-tag :class="getMemberTypeClass(member.type)" :value="member.type" />
      </div>
    </template>
    
    <template #content>
      <div class="member-card-content">
        <div class="joined-date">
          <i class="pi pi-calendar"></i>
          <span>{{ $t('organization.members.joined') }}: {{ formatDate(member.joinedAt) }}</span>
        </div>
      </div>
    </template>
    
    <template #footer v-if="isCreator && member.personId !== currentUserId">
      <div class="member-actions">
        <pv-button 
          icon="pi pi-trash" 
          class="p-button-rounded p-button-danger p-button-outlined remove-button" 
          @click="confirmRemove" />
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.member-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--primary-color-rgb), 0.12);
  background-color: #ffffff;
  height: 100%;
}

/* Estilos específicos para miembros tipo Contractor */
.member-card.contractor {
  border-left: 4px solid var(--blue-500);
  background: linear-gradient(to right, rgba(var(--blue-50-rgb), 0.4), #ffffff 15%);
}

/* Estilos específicos para miembros tipo Worker */
.member-card.worker {
  border-left: 4px solid var(--green-500);
  background: linear-gradient(to right, rgba(var(--green-50-rgb), 0.3), #ffffff 15%);
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15) !important;
  border-color: rgba(var(--primary-color-rgb), 0.3);
}

/* Hover específico para Contractor */
.member-card.contractor:hover {
  box-shadow: 0 10px 25px rgba(var(--blue-700-rgb), 0.2) !important;
  border-color: var(--blue-400);
}

/* Hover específico para Worker */
.member-card.worker:hover {
  box-shadow: 0 10px 25px rgba(var(--green-700-rgb), 0.2) !important;
  border-color: var(--green-400);
}

/* Estilos para el encabezado de la tarjeta */
.member-card :deep(.p-card-header) {
  position: relative;
  padding: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-600));
  opacity: 0.85;
  transition: all 0.3s ease;
}

/* Barra superior para Contractor */
.member-card.contractor :deep(.p-card-header) {
  background: linear-gradient(90deg, var(--blue-500), var(--blue-700));
  height: 8px;
}

/* Barra superior para Worker */
.member-card.worker :deep(.p-card-header) {
  background: linear-gradient(90deg, var(--green-500), var(--green-700));
}

/* Efectos de hover en la barra superior */
.member-card:hover :deep(.p-card-header) {
  opacity: 1;
}

.member-card.contractor:hover :deep(.p-card-header) {
  background: linear-gradient(90deg, var(--blue-400), var(--blue-600));
}

.member-card.worker:hover :deep(.p-card-header) {
  background: linear-gradient(90deg, var(--green-400), var(--green-600));
}

.member-card :deep(.p-card-body) {
  padding: 1.25rem;
}

.member-card :deep(.p-card-title) {
  padding: 0;
  margin: 0;
}

.member-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  color: #2196f3;
  margin-right: 1rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid rgba(33, 150, 243, 0.2);
  position: relative;
}

.member-avatar::after {
  content: '';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: var(--primary-color);
  border: 2px solid #fff;
  transition: all 0.3s ease;
  transform: scale(0);
  opacity: 0;
}

.member-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
}

/* Estilos específicos para Contractor (creador de la organización) */
.member-avatar.contractor {
  background: linear-gradient(135deg, var(--blue-50), var(--blue-100));
  color: var(--blue-700);
  border-color: var(--blue-300);
  box-shadow: 0 3px 6px rgba(33, 150, 243, 0.2);
}

.member-avatar.contractor::after {
  background-color: var(--blue-600);
  content: '★';
  color: white;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1);
  opacity: 1;
}

.member-avatar.contractor:hover {
  border-color: var(--blue-400);
  box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
}

/* Estilos específicos para Worker (miembros invitados) */
.member-avatar.worker {
  background: linear-gradient(135deg, var(--green-50), var(--green-100));
  color: var(--green-700);
  border-color: var(--green-300);
  box-shadow: 0 3px 6px rgba(76, 175, 80, 0.2);
}

.member-avatar.worker::after {
  background-color: var(--green-600);
  content: '●';
  color: white;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1);
  opacity: 1;
}

.member-avatar.worker:hover {
  border-color: var(--green-400);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.member-info {
  flex: 1;
}

.member-info h3 {
  margin: 0 0 0.35rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333333;
  letter-spacing: 0.01rem;
  transition: all 0.3s ease;
}

/* Estilo específico para contratistas */
.member-card.contractor .member-info h3 {
  color: var(--blue-900);
  position: relative;
}

.member-card.contractor .member-info h3::after {
  content: '★';
  font-size: 0.7rem;
  color: var(--blue-500);
  margin-left: 0.3rem;
  vertical-align: super;
}

.member-email {
  margin: 0;
  color: #555555;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.member-email i {
  font-size: 0.95rem;
  color: var(--primary-color);
  opacity: 0.8;
  transition: transform 0.3s ease;
}

/* Hover effects */
.member-card:hover .member-info h3 {
  transform: translateY(-2px);
}

.member-card:hover .member-email {
  color: var(--primary-color);
}

.member-card:hover .member-email i {
  transform: scale(1.2);
  opacity: 1;
}

.member-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: 0.25rem;
  transition: all 0.3s ease;
}

.member-card :deep(.p-card-content) {
  padding: 0.5rem 0 0 0;
}

.member-card :deep(.p-card-footer) {
  padding: 1rem 0 0 0;
  display: flex;
  justify-content: flex-end;
}

/* Estilo específico para contratistas */
.member-card.contractor .member-card-content {
  border-top: 1px solid rgba(var(--blue-200-rgb), 0.5);
}

/* Estilo específico para workers */
.member-card.worker .member-card-content {
  border-top: 1px solid rgba(var(--green-200-rgb), 0.5);
}

.joined-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #555555;
  font-size: 0.9rem;
  background-color: #f5f5f5;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

/* Estilo específico para contratistas */
.member-card.contractor .joined-date {
  background-color: rgba(var(--blue-50-rgb), 0.7);
  border: 1px solid rgba(var(--blue-200-rgb), 0.4);
}

/* Estilo específico para workers */
.member-card.worker .joined-date {
  background-color: rgba(var(--green-50-rgb), 0.7);
  border: 1px solid rgba(var(--green-200-rgb), 0.4);
}

.joined-date i {
  color: var(--primary-color);
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

/* Iconos específicos por tipo */
.member-card.contractor .joined-date i {
  color: var(--blue-600);
}

.member-card.worker .joined-date i {
  color: var(--green-600);
}

.member-card:hover .joined-date {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

.member-card:hover .joined-date i {
  transform: rotate(15deg) scale(1.1);
}

.member-actions {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.remove-button {
  transition: all 0.3s ease;
  position: relative;
}

.remove-button::before {
  content: 'Remove';
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  background-color: rgba(var(--red-600-rgb), 0.9);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  opacity: 0;
  transition: all 0.25s ease;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
}

.remove-button:hover {
  background-color: rgba(var(--red-500-rgb), 0.1);
  box-shadow: 0 3px 8px rgba(var(--red-500-rgb), 0.2);
  transform: scale(1.1);
}

.remove-button:hover::before {
  transform: translateX(-50%) scale(1);
  opacity: 1;
  bottom: -25px;
}

.contractor {
  background: linear-gradient(135deg, #e1f5fe, #b3e5fc);
  color: #01579b;
  font-weight: 600;
  padding: 0.45rem 0.85rem;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(1, 87, 155, 0.18);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid #81d4fa;
  position: relative;
  transition: all 0.3s ease;
}

.contractor::before {
  content: '★';
  font-size: 0.8rem;
  margin-right: 0.1rem;
}

/* Añadir indicador de rol en el hover */
.contractor::after {
  content: 'Creator';
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  background-color: rgba(1, 87, 155, 0.9);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.contractor:hover {
  box-shadow: 0 5px 15px rgba(1, 87, 155, 0.25);
  background: linear-gradient(135deg, #b3e5fc, #81d4fa);
  transform: translateY(-2px);
}

.contractor:hover::after {
  transform: translateX(-50%) scale(1);
  opacity: 1;
  top: -20px;
}

.contractor-badge {
  background: linear-gradient(135deg, #e1f5fe, #b3e5fc);
  border: 1px solid #81d4fa;
  color: #0277bd;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 10px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(2, 119, 189, 0.3);
  transition: all 0.3s ease;
  z-index: 10;
}

.contractor-badge i {
  font-size: 0.8rem;
}

/* Efecto hover para el badge */
.member-card:hover .contractor-badge {
  transform: scale(1.15) rotate(20deg);
  box-shadow: 0 3px 8px rgba(2, 119, 189, 0.4);
}

.worker {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
  font-weight: 500;
  padding: 0.45rem 0.85rem;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(46, 125, 50, 0.18);
  border: 1px solid #a5d6a7;
  transition: all 0.3s ease;
}

/* Añadir indicador de rol en el hover */
.worker::after {
  content: 'Member';
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  background-color: rgba(46, 125, 50, 0.9);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.worker:hover {
  box-shadow: 0 5px 15px rgba(46, 125, 50, 0.25);
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
  transform: translateY(-2px);
}

.worker:hover::after {
  transform: translateX(-50%) scale(1);
  opacity: 1;
  top: -20px;
}

.worker-badge {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border: 1px solid #a5d6a7;
  color: #2e7d32;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 10px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(46, 125, 50, 0.3);
  transition: all 0.3s ease;
  z-index: 10;
}

.worker-badge i {
  font-size: 0.8rem;
}

/* Efecto hover para el badge */
.member-card:hover .worker-badge {
  transform: scale(1.15);
  box-shadow: 0 3px 8px rgba(46, 125, 50, 0.4);
}

/* Añadir animación de entrada para las tarjetas */
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.member-card {
  animation: cardEnter 0.5s ease forwards;
  animation-delay: calc(var(--card-index, 0) * 0.1s);
  opacity: 0;
}

/* Override de algunos estilos de PrimeVue para mejor integración */
.member-card:deep(.p-card) {
  box-shadow: none !important;
  background-color: transparent;
}

.member-card:deep(.p-card-body) {
  background-color: transparent;
}
</style>
