import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import AuthLayoutComponent from '../iam/components/auth-layout.component.vue'
import UserLayout from '../organizations/components/user-layout.component.vue'
import OrganizationLayout from '../organizations/components/organization-layout.component.vue'

// Auth
import LoginPage from "../iam/pages/login-page.component.vue";
import RegisterPage from "../iam/pages/register-page.component.vue";

// Organizations
import OrganizationList from '../organizations/components/organization-list.component.vue'
import OrganizationInformation from '../organizations/components/organization-information.component.vue'
import OrganizationProjects from '../organizations/components/organization-projects.component.vue'
import OrganizationMembers from '../organizations/components/organization-members.component.vue'
import OrganizationSettings from '../organizations/components/organization-setting.component.vue'
import OrganizationInvitations from "../organizations/components/organization-invitations.component.vue";

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: LoginPage
    },
    {
        path: '/register',
        component: RegisterPage
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
                    },
                    {
                        path: 'information',
                        name: 'organization-information',
                        component: OrganizationInformation
                    },
                    {
                        path: 'projects',
                        name: 'organization-projects',
                        component: OrganizationProjects
                    },
                    {
                        path: 'members',
                        name: 'organization-members',
                        component: OrganizationMembers
                    },
                    {
                        path: 'settings',
                        name: 'organization-settings',
                        component: OrganizationSettings
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

export default router
