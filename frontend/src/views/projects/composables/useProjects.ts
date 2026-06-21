import { ref, computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { performanceApi, customersApi, usersApi } from '@/api';
import { useAuthStore } from '@/stores/auth';
import { hasPermission } from '@/config/permissions';
import type { Project, User, Customer } from '@/types';
import { CalculationType, CALCULATION_TYPE_LABELS } from '@/types';

/**
 * 项目管理 composable
 * 统一桌面端与移动端共享的项目 CRUD、权限计算、用户/客户数据加载逻辑
 */
export function useProjects() {
  const authStore = useAuthStore();
  const isAdmin = computed(() => authStore.isAdmin);

  const projects = ref<Project[]>([]);
  const selectedProject = ref<Project | null>(null);
  const users = ref<User[]>([]);
  const customers = ref<Customer[]>([]);
  const loading = ref(false);

  // ============ 权限计算 ============
  const canCreateProject = computed(() =>
    hasPermission(authStore.user?.role?.permissions || [], 'fee:create_project') || isAdmin.value,
  );
  const canManageProject = computed(() =>
    isAdmin.value || (selectedProject.value?.creatorId === authStore.user?.id),
  );
  const canCreateRecord = computed(() => {
    if (isAdmin.value) return true;
    const p = selectedProject.value;
    if (!p) return false;
    if (p.creatorId === authStore.user?.id) return true;
    return (p.members || []).some(m => m.userId === authStore.user?.id);
  });
  const canManageDevice = computed(() =>
    isAdmin.value || (selectedProject.value?.creatorId === authStore.user?.id),
  );
  const canViewPerformance = computed(() =>
    hasPermission(authStore.user?.role?.permissions || [], 'fee:view_stats') || isAdmin.value,
  );
  const canViewAmount = computed(() =>
    hasPermission(authStore.user?.role?.permissions || [], 'fee:view_amount') || isAdmin.value,
  );

  // ============ 按区域分组的用户（用于快捷多选成员） ============
  const regionGroups = computed(() => {
    const map = new Map<string, { regionId: string; regionName: string; userIds: string[] }>();
    for (const u of users.value) {
      const rid = u.regionId;
      const rname = u.region?.name;
      if (!rid || !rname) continue;
      if (!map.has(rid)) map.set(rid, { regionId: rid, regionName: rname, userIds: [] });
      map.get(rid)!.userIds.push(u.id);
    }
    return Array.from(map.values()).sort((a, b) => a.regionName.localeCompare(b.regionName));
  });

  const addUsersByRegion = (regionId: string, memberIds: string[]) => {
    const group = regionGroups.value.find(g => g.regionId === regionId);
    if (!group) return;
    const existing = new Set(memberIds);
    for (const uid of group.userIds) {
      if (!existing.has(uid)) memberIds.push(uid);
    }
  };

  // ============ 项目表单 ============
  const projectForm = reactive({
    projectName: '',
    calculationType: CalculationType.QUANTITY as CalculationType,
    totalQuantity: 1,
    deliveryUnitPrice: 0,
    installUnitPrice: 0,
    debugUnitPrice: 0,
    dailyPrice: 0,
    remark: '',
    memberIds: [] as string[],
    editingId: '' as string,
  });

  const resetProjectForm = () => {
    projectForm.projectName = '';
    projectForm.calculationType = CalculationType.QUANTITY;
    projectForm.totalQuantity = 1;
    projectForm.deliveryUnitPrice = 0;
    projectForm.installUnitPrice = 0;
    projectForm.debugUnitPrice = 0;
    projectForm.dailyPrice = 0;
    projectForm.remark = '';
    projectForm.memberIds = [];
    projectForm.editingId = '';
  };

  const fillProjectFormForEdit = (project: Project) => {
    projectForm.projectName = project.projectName;
    projectForm.calculationType = project.calculationType;
    projectForm.totalQuantity = project.totalQuantity || 1;
    projectForm.deliveryUnitPrice = project.deliveryUnitPrice;
    projectForm.installUnitPrice = project.installUnitPrice;
    projectForm.debugUnitPrice = project.debugUnitPrice;
    projectForm.dailyPrice = project.dailyPrice;
    projectForm.remark = project.remark || '';
    projectForm.memberIds = (project.members || [])
      .filter(m => m.role !== 'OWNER')
      .map(m => m.userId);
    projectForm.editingId = project.id;
  };

  // ============ 项目 CRUD ============
  const loadProjects = async () => {
    loading.value = true;
    try {
      const response = await performanceApi.getProjects();
      projects.value = response.data;
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      loading.value = false;
    }
  };

  const selectProject = (project: Project | null) => {
    selectedProject.value = project;
  };

  const deselectProject = () => {
    selectedProject.value = null;
  };

  const createProject = async (data: Partial<typeof projectForm>) => {
    try {
      await performanceApi.createProject({
        projectName: data.projectName!,
        calculationType: data.calculationType as CalculationType,
        totalQuantity: data.calculationType === CalculationType.QUANTITY ? data.totalQuantity : undefined,
        deliveryUnitPrice: data.deliveryUnitPrice,
        installUnitPrice: data.installUnitPrice,
        debugUnitPrice: data.debugUnitPrice,
        dailyPrice: data.dailyPrice,
        remark: data.remark || undefined,
        memberIds: data.memberIds?.length ? data.memberIds : undefined,
      });
      ElMessage.success('创建成功');
      await loadProjects();
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '创建失败');
      throw e;
    }
  };

  const updateProject = async (data: Partial<typeof projectForm>) => {
    if (!data.editingId) return;
    try {
      await performanceApi.updateProject(data.editingId, {
        projectName: data.projectName,
        totalQuantity: data.calculationType === CalculationType.QUANTITY ? data.totalQuantity : undefined,
        deliveryUnitPrice: data.deliveryUnitPrice,
        installUnitPrice: data.installUnitPrice,
        debugUnitPrice: data.debugUnitPrice,
        dailyPrice: data.dailyPrice,
        remark: data.remark || undefined,
        memberIds: data.memberIds,
      });
      ElMessage.success('更新成功');
      await loadProjects();
      // 同步当前选中项目
      if (selectedProject.value?.id === data.editingId) {
        selectedProject.value = {
          ...selectedProject.value,
          projectName: data.projectName || selectedProject.value.projectName,
        };
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '更新失败');
      throw e;
    }
  };

  const deleteProject = async (project: Project) => {
    try {
      await ElMessageBox.confirm(`确定删除项目"${project.projectName}"吗？`, '提示', { type: 'warning' });
      await performanceApi.deleteProject(project.id);
      ElMessage.success('删除成功');
      if (selectedProject.value?.id === project.id) {
        deselectProject();
      }
      await loadProjects();
    } catch {
      // 用户取消
    }
  };

  // ============ 用户/客户数据 ============
  const loadUsersAndCustomers = async () => {
    try {
      const [usersRes, customersRes] = await Promise.all([
        usersApi.getAll({ page: 1, pageSize: 10000 }),
        customersApi.getAll({ page: 1, pageSize: 10000 }),
      ]);
      users.value = (usersRes.data?.data || usersRes.data || []).filter((u: User) => u?.id);
      customers.value = (customersRes.data?.data || customersRes.data || []).filter((c: Customer) => c?.id);
    } catch (e) {
      console.error('Failed to load users/customers:', e);
    }
  };

  // ============ 导出 ============
  const exportAllProjects = async () => {
    try {
      const res = await performanceApi.exportProjects();
      const blob = res.data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `项目数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export:', e);
    }
  };

  const exportProject = async (project: Project) => {
    try {
      const res = await performanceApi.exportProject(project.id);
      const blob = res.data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.projectName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export:', e);
    }
  };

  return {
    // 状态
    projects,
    selectedProject,
    users,
    customers,
    loading,
    projectForm,
    // 权限
    canCreateProject,
    canManageProject,
    canCreateRecord,
    canManageDevice,
    canViewPerformance,
    canViewAmount,
    // 区域分组
    regionGroups,
    addUsersByRegion,
    // 项目 CRUD
    loadProjects,
    selectProject,
    deselectProject,
    createProject,
    updateProject,
    deleteProject,
    resetProjectForm,
    fillProjectFormForEdit,
    // 用户/客户
    loadUsersAndCustomers,
    // 导出
    exportAllProjects,
    exportProject,
    // 常量
    CALCULATION_TYPE_LABELS,
  };
}
