import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import AuthLayoutComponent from '../iam/components/auth-layout.component.vue'

// Auth
import Login from '../iam/components/login-form.component.vue'
import Register from '../iam/components/register-form.component.vue'


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
    },/*
    {
        path: '/organizations',
        component: UserLayout,
        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] },
        children: [
            {
                path: '',
                name: 'organizations',
                component: OrganizationsList,
                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
            },
            {
                path: ':orgId',
                component: OrganizationLayout,
                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] },
                children: [
                    {
                        path: 'information',
                        name: 'organization-information',
                        component: OrganizationInformation,
                        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                    },
                    {
                        path: 'projects',
                        name: 'organization-projects',
                        component: OrganizationProjects,
                        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                    },
                    {
                        path: 'members',
                        name: 'organization-members',
                        component: OrganizationMembers,
                        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                    },
                    {
                        path: 'settings',
                        name: 'organization-settings',
                        component: OrganizationSettings,
                        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                    },
                    {
                        path: 'project/:projectId',
                        component: ProjectLayout,
                        meta: { requiresAuth: true, roles: ['contractor', 'specialist', 'client'] },
                        children: [
                            {
                                path: 'information',
                                name: 'project-information',
                                component: ProjectInformation,
                                meta: { requiresAuth: true, roles: ['contractor', 'specialist', 'client'] }
                            },
                            {
                                path: 'technical-file',
                                name: 'project-technical-file',
                                component: ProjectTechnicalFile,
                                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                            },
                            {
                                path: 'working-team',
                                name: 'project-working-team',
                                component: ProjectWorkingTeam,
                                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                            },
                            {
                                path: 'settings',
                                name: 'project-settings',
                                component: ProjectSettings,
                                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                            },
                            {
                                path: 'change-management',
                                name: 'project-change-management',
                                component: ProjectChangeManagement,
                                meta: { requiresAuth: true, roles: ['contractor', 'specialist', 'client'] }
                            },
                            {
                                path: 'schedule',
                                component: ProjectScheduleLayout,
                                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] },
                                children: [
                                    {
                                        path: '',
                                        name: 'project-schedule',
                                        component: ProjectSchedule,
                                        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                                    },
                                    {
                                        path: 'milestone/:milestoneId',
                                        component: MilestoneLayout,
                                        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] },
                                        children: [
                                            {
                                                path: 'information',
                                                name: 'milestone-information',
                                                component: MilestoneInformation,
                                                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                                            },
                                            {
                                                path: 'tasks',
                                                component: MilestoneTasksLayout,
                                                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] },
                                                children: [
                                                    {
                                                        path: '',
                                                        name: 'milestone-tasks',
                                                        component: MilestoneTaskList,
                                                        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                                                    },
                                                    {
                                                        path: 'task/:taskId',
                                                        name: 'milestone-task-details',
                                                        component: TaskDetails,
                                                        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                                                    }
                                                ]
                                            },
                                            {
                                                path: 'meetings',
                                                component: MilestoneMeetingsLayout,
                                                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] },
                                                children: [
                                                    {
                                                        path: '',
                                                        name: 'milestone-meetings',
                                                        component: MilestoneMeetingList,
                                                        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                                                    },
                                                    {
                                                        path: 'meeting/:meetingId',
                                                        name: 'milestone-meeting-details',
                                                        component: MeetingDetails,
                                                        meta: { requiresAuth: true, roles: ['contractor', 'specialist'] }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFound
    }
    */
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
