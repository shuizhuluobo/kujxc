import { ref, computed } from 'vue';
import { performanceApi } from '@/api';
import type {
    Project,
    WorkRecord,
    PerformanceResult,
    MyPerformanceStats,
    CreateProjectDto,
    UpdateProjectDto,
    CreateWorkRecordDto,
    UpdateWorkRecordDto,
} from '@/types';

export function usePerformance() {
    const projects = ref<Project[]>([]);
    const selectedProject = ref<Project | null>(null);
    const records = ref<WorkRecord[]>([]);
    const stats = ref<PerformanceResult[]>([]);
    const myStats = ref<MyPerformanceStats | null>(null);
    const loading = ref(false);

    const loadProjects = async () => {
        loading.value = true;
        try {
            const response = await performanceApi.getProjects();
            projects.value = response.data;
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            loading.value = false;
        }
    };

    const selectProject = async (project: Project | null) => {
        selectedProject.value = project;
        if (project) {
            await Promise.all([
                loadRecords(project.id),
                loadStats(project.id),
                loadMyStats(project.id),
            ]);
        } else {
            records.value = [];
            stats.value = [];
            myStats.value = null;
        }
    };

    const loadRecords = async (projectId: string) => {
        try {
            const response = await performanceApi.getRecords(projectId);
            records.value = response.data;
        } catch (error) {
            console.error('Failed to load records:', error);
        }
    };

    const loadStats = async (projectId: string) => {
        try {
            const response = await performanceApi.getStats(projectId);
            stats.value = response.data;
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadMyStats = async (projectId: string) => {
        try {
            const response = await performanceApi.getMyStats(projectId);
            myStats.value = response.data;
        } catch (error) {
            console.error('Failed to load my stats:', error);
        }
    };

    const createProject = async (data: CreateProjectDto) => {
        loading.value = true;
        try {
            const response = await performanceApi.createProject(data);
            projects.value.unshift(response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const updateProject = async (id: string, data: UpdateProjectDto) => {
        loading.value = true;
        try {
            const response = await performanceApi.updateProject(id, data);
            const index = projects.value.findIndex(p => p.id === id);
            if (index !== -1) {
                projects.value[index] = response.data;
            }
            if (selectedProject.value?.id === id) {
                selectedProject.value = response.data;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to update project:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const deleteProject = async (id: string) => {
        loading.value = true;
        try {
            await performanceApi.deleteProject(id);
            projects.value = projects.value.filter(p => p.id !== id);
            if (selectedProject.value?.id === id) {
                selectedProject.value = null;
                records.value = [];
                stats.value = [];
                myStats.value = null;
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const createRecord = async (projectId: string, data: CreateWorkRecordDto) => {
        loading.value = true;
        try {
            const response = await performanceApi.createRecord(projectId, data);
            records.value.unshift(response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to create record:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const updateRecord = async (projectId: string, recordId: string, data: UpdateWorkRecordDto) => {
        loading.value = true;
        try {
            const response = await performanceApi.updateRecord(projectId, recordId, data);
            const index = records.value.findIndex(r => r.id === recordId);
            if (index !== -1) {
                records.value[index] = response.data;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to update record:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const deleteRecord = async (projectId: string, recordId: string) => {
        loading.value = true;
        try {
            await performanceApi.deleteRecord(projectId, recordId);
            records.value = records.value.filter(r => r.id !== recordId);
        } catch (error) {
            console.error('Failed to delete record:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const init = async () => {
        await loadProjects();
    };

    return {
        projects,
        selectedProject,
        records,
        stats,
        myStats,
        loading,
        loadProjects,
        selectProject,
        loadRecords,
        loadStats,
        loadMyStats,
        createProject,
        updateProject,
        deleteProject,
        createRecord,
        updateRecord,
        deleteRecord,
        formatDate,
        init,
    };
}
