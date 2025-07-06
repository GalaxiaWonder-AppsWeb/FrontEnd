import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import AuthLayoutComponent from '../iam/components/auth-layout.component.vue'
import UserLayout from '../organizations/components/user-layout.component.vue'
import OrganizationLayout from '../organizations/components/organization-layout.component.vue'
import ProjectLayout from '../projects/components/project-layout.component.vue'

// Auth
import Login from '../iam/components/login-form.component.vue'
import Register from '../iam/components/register-form.component.vue'
import UserProfile from '../iam/components/user-profile.component.vue'

// Organizations
import OrganizationList from '../organizations/components/organization-list.component.vue'
import OrganizationInformation from '../organizations/components/organization-information.component.vue'
import OrganizationProjects from '../organizations/components/organization-projects.component.vue'
import OrganizationMembers from '../organizations/components/organization-members.component.vue'
import OrganizationSettings from '../organizations/components/organization-setting.component.vue'
import OrganizationInvitations from "../organizations/components/organization-invitations.component.vue";

// Projects
import ProjectList from '../projects/components/project-list.component.vue'
import ProjectInformation from '../projects/components/project-information.component.vue'
import ProjectMembers from '../projects/components/project-members.component.vue'
import ProjectSettings from '../projects/components/project-setting.component.vue'
import Schedule from '../projects/components/schedule.component.vue'

// Client
import ClientLayout from '../public/components/client-layout.component.vue'
import ClientProjects from '../public/components/clients-projects.component.vue'

// Change Process
import ChangeProcess from '../projects/components/change-management.component.vue'

const routes = [
    {
        path: "/client",
        component: ClientLayout,
        meta: { requiresAuth: true, allowedUserTypes: ['TYPE_CLIENT']},
        children: [
            {
                path: 'projects',
                name: 'client-projects',
                component: ClientProjects,
                meta: { requiresAuth: true, allowedUserTypes: ['TYPE_CLIENT'] }
            },
            {
                path: 'projects/:projectId/information',
                name: 'client-project-information',
                component: ProjectInformation,
                meta: { requiresAuth: true }
            },
            {
                path: 'projects/:projectId/client-change-management',
                name: 'client-change-management',
                component: ChangeProcess,
                meta: { requiresAuth: true }
            }
        ]
    },
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', name: 'login', component: Login },
            { path: 'register', name: 'register', component: Register }
        ]
    },
    {
        path: '/profile',
        component: UserLayout,
        children: [
            {
                path: '',
                name: 'user-profile',
                component: UserProfile,
                meta: { requiresAuth: true }
            }
        ]
    },
    {
        path: '/organizations',
        component: UserLayout,
        children: [
            {
                path: '',
                name: 'organizations',
                component: OrganizationList
            },
            {
              path: '/invitations',
                name: 'invitations',
                component: OrganizationInvitations
            },
            {
                path: ':orgId',
                component: OrganizationLayout,
                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] },
                children: [
                    {
                        path: '',
                        redirect: to => ({
                            name: 'organization-information',
                            params: { orgId: to.params.orgId }
                        })
                    },                    {
                        path: 'information',
                        name: 'organization-information',
                        component: OrganizationInformation,
                        meta: { allowedRoles: ['Contractor', 'Worker'] } // Todos pueden acceder
                    },
                    {
                        // Vista de lista de proyectos
                        path: 'projects',
                        name: 'organization-projects',
                        component: OrganizationProjects,
                        meta: { allowedRoles: ['Contractor', 'Worker'] } // Todos pueden acceder, pero se filtrará en el componente
                    },
                    {
                        // Vista de detalle de un proyecto específico
                        path: 'projects/:projectId',
                        component: ProjectLayout,
                        meta: { allowedRoles: ['Contractor', 'Worker'] }, // Todos pueden acceder, pero se filtrará en el componente
                        children: [
                            {
                                // Redirección predeterminada
                                path: '',
                                redirect: to => ({
                                    name: 'project-information',
                                    params: { orgId: to.params.orgId, projectId: to.params.projectId }
                                })
                            },                            {
                                // Vista principal de información del proyecto
                                path: 'information',
                                name: 'project-information',
                                component: ProjectInformation,
                                meta: { allowedRoles: ['Coordinator', 'Specialist'] } // Todos pueden acceder
                            },
                            {
                                // Vista de calendarios del proyecto
                                path: 'schedule',
                                name: 'schedule',
                                component: Schedule,
                                meta: { allowedRoles: ['Coordinator', 'Specialist'] } // Todos pueden acceder

                            },
                            {
                                // Vista de miembros del proyecto
                                path: 'working-team',
                                name: 'project-members',
                                component: ProjectMembers,
                                meta: { allowedRoles: ['Coordinator', 'Specialist'] } // Todos pueden acceder

                            },
                            {
                                // Vista de gestión de cambios del proyecto
                                path: 'change-management',
                                name: 'change-management',
                                component: ChangeProcess,
                                meta: { allowedRoles: ['Contractor', 'COORDINATOR', 'Coordinator'] } // Todos pueden acceder
                            },
                            {                        // Nueva vista de configuración del proyecto
                                path: 'settings',
                                name: 'project-settings',
                                component: ProjectSettings,
                                meta: { allowedRoles: ['Coordinator', 'Contractor'] } // Solo el coordinador puede acceder
                            }
                        ]
                    },
                    {
                        path: 'members',
                        name: 'organization-members',
                        component: OrganizationMembers,
                        meta: { allowedRoles: ['Contractor', 'Worker'] } // Todos pueden acceder
                    },
                    {
                        path: 'settings',
                        name: 'organization-settings',
                        component: OrganizationSettings,
                        meta: { allowedRoles: ['Contractor'] } // Solo el contratista puede acceder
                    },

                ]
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// BEFORE EACH GUARD PARA CONTROL DE ACCESO POR TIPO DE USUARIO
router.beforeEach((to, from, next) => {
    const publicPages = ['/login', '/register'];
    const authRequired = to.matched.some(record => record.meta.requiresAuth);
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Si no requiere auth, continuar
    if (!authRequired) return next();

    // Si no hay usuario autenticado, redirigir a login
    if (!user) return next({ name: 'login' });

    // --- PROTECCIÓN POR TIPO DE USUARIO ---
    const allowedUserTypes = to.matched
        .map(record => record.meta?.allowedUserTypes ?? [])
        .filter(Boolean)
        .flat();

    if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.userType)) {
        // Si intenta entrar a ruta exclusiva de otro tipo, redirigir a su dashboard
        if (user.userType === 'TYPE_CLIENT') {
            return next({ name: 'client-projects' });
        } else {
            // Aquí puedes personalizar a dónde lo llevas si es otro tipo
            return next({ name: 'organizations' });
        }
    }

    // Si es TYPE_CLIENT, forzar navegación SOLO por /client/...
    if (user.userType === 'TYPE_CLIENT' && !to.path.startsWith('/client')) {
        return next({ name: 'client-projects' });
    }

    // Si NO es TYPE_CLIENT y trata de ir a /client, lo bloqueas
    if (user.userType !== 'TYPE_CLIENT' && to.path.startsWith('/client')) {
        return next({ name: 'organizations' });
    }

    // Si todo bien, dejar pasar
    next();
});

export default router
