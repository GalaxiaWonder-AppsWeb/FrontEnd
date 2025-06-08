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

const routes = [
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
                    },{
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
                            {                        // Nueva vista de configuración del proyecto
                                path: 'settings',
                                name: 'project-settings',
                                component: ProjectSettings,
                                meta: { allowedRoles: ['Coordinator'] } // Solo el coordinador puede acceder
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
        ]    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Guardia de navegación para validar permisos basados en roles
router.beforeEach(async (to, from, next) => {
    console.log('Navegando a:', to.path, 'Meta:', to.meta);
    
    // Verificar si la ruta requiere autenticación
    if (to.meta.requiresAuth) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            // Si no hay usuario autenticado, redirigir al login
            console.warn('Se requiere autenticación para acceder a esta ruta');
            // Guardar la ruta a la que intentaba acceder para redirección después del login
            sessionStorage.setItem('redirectAfterLogin', to.fullPath);
            
            if (window.$toast) {
                window.$toast.add({
                    severity: 'warn',
                    summary: 'Acceso denegado',
                    detail: 'Debe iniciar sesión para acceder a esta página',
                    life: 3000
                });
            }
            
            return next('/login');
        }
    }
    
    // Si la ruta no requiere roles específicos, permitir acceso
    if (!to.meta.allowedRoles) {
        return next();
    }
    
    // Obtener el usuario actual
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        // Si no hay usuario autenticado, redirigir al login con mensaje
        // Guardar la ruta a la que intentaba acceder para redirección después del login
        sessionStorage.setItem('redirectAfterLogin', to.fullPath);
        return next('/login');
    }    // Si la ruta es parte de una organización, verificar si el usuario es el creador
    if (to.params.orgId && user.personId) {
        try {
            console.log(`Verificando si el usuario es creador de la organización ${to.params.orgId}...`);
            const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/organizations/${to.params.orgId}`);
            if (response.ok) {
                const organization = await response.json();
                if (organization && organization.createdBy === user.personId) {
                    console.log('Usuario es creador de la organización, asignando rol Contractor');
                    // Si es el creador, establecer el rol como Contractor
                    user.activeOrganizationRole = 'Contractor';
                    localStorage.setItem('user', JSON.stringify(user));
                }
            }
        } catch (error) {
            console.error('Error al verificar si el usuario es creador:', error);
        }
    }
      // Verificar si la ruta es de un proyecto
    const isProjectRoute = to.path.includes('/projects/') && to.params.projectId;
    
    // Determinar qué rol usar para la verificación
    let userRole;
    if (isProjectRoute) {
        // Si es contratista de la organización, asignar automáticamente rol de coordinador para el proyecto
        if (user.activeOrganizationRole === 'Contractor') {
            user.activeProjectRole = 'Coordinator';
            localStorage.setItem('user', JSON.stringify(user));
        }
        userRole = user.activeProjectRole;
    } else {
        userRole = user.activeOrganizationRole;
    }
    
    if (userRole && to.meta.allowedRoles.includes(userRole)) {
        // El usuario tiene el rol permitido, continuar
        return next();
    } else if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
        // El usuario no tiene permiso para acceder a esta ruta
        
        // Si intentaba acceder a configuraciones de organización, redirigir a información
        if (to.name === 'organization-settings') {
            console.warn('Acceso denegado: Solo el contratista puede acceder a la configuración');
            // Mostrar mensaje de acceso denegado (usando toast si está disponible en window)
            if (window.$toast) {
                window.$toast.add({
                    severity: 'warn',
                    summary: 'Acceso denegado',
                    detail: 'Solo el contratista puede acceder a la configuración',
                    life: 3000
                });
            }
            return next(`/organizations/${to.params.orgId}/information`);
        }
        
        // Si intentaba acceder a configuraciones de proyecto, redirigir a información del proyecto
        if (to.name === 'project-settings') {
            console.warn('Acceso denegado: Solo el coordinador puede acceder a la configuración del proyecto');
            if (window.$toast) {
                window.$toast.add({
                    severity: 'warn',
                    summary: 'Acceso denegado',
                    detail: 'Solo el coordinador puede acceder a la configuración del proyecto',
                    life: 3000
                });
            }
            return next(`/organizations/${to.params.orgId}/projects/${to.params.projectId}/information`);
        }
        
        // Para otras rutas protegidas, redirigir a la página anterior o a información
        console.warn(`Acceso denegado: El rol ${userRole} no tiene permiso para acceder a ${to.path}`);
        // Mostrar mensaje de acceso denegado (usando toast si está disponible)
        if (window.$toast) {
            window.$toast.add({
                severity: 'warn',
                summary: 'Acceso denegado',
                detail: `No tienes permiso para acceder a esta página`,
                life: 3000
            });        }
        
        // Si venía de una ruta válida, volver a ella, sino ir a información
        if (from.name) {
            return next(from.path);
        } else {
            // Redirigir según el contexto (proyecto u organización)
            if (isProjectRoute) {
                return next(`/organizations/${to.params.orgId}/projects/${to.params.projectId}/information`);
            } else {
                return next(`/organizations/${to.params.orgId}/information`);
            }
        }
    }
    
    // Por defecto, permitir el acceso
    next();
});

export default router
