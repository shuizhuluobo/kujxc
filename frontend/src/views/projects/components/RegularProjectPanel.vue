<template>
  <div class="performance-stats">
    <!-- 左侧项目列表 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">项目列表</span>
        <div class="sidebar-actions">
          <el-button v-if="canCreateProject" type="primary" size="small" @click="$emit('createProject')">新增</el-button>
          <el-button v-if="canViewPerformance && projects.length > 0" size="small" @click="$emit('exportAll')">导出</el-button>
        </div>
      </div>
      <div class="project-list">
        <div
          v-for="project in projects"
          :key="project.id"
          class="project-card"
          :class="{ active: selectedProject?.id === project.id }"
          @click="$emit('selectProject', project)"
        >
          <div class="card-row card-row-top">
            <span class="card-name">{{ project.projectName }}</span>
            <el-tag size="small" :type="project.calculationType === CalculationType.QUANTITY ? 'primary' : 'success'">
              {{ CALCULATION_TYPE_LABELS[project.calculationType] }}
            </el-tag>
          </div>
          <div class="card-row card-row-bottom">
            <span class="card-date">{{ formatDate(project.createdAt) }}</span>
            <div class="card-actions" @click.stop v-if="canManageProject">
              <el-button size="small" text type="primary" @click="(e) => { e.stopPropagation(); $emit('editProject', project); }">
                <el-icon><EditPen /></el-icon>
              </el-button>
              <el-popconfirm title="确定删除该项目？" @confirm="$emit('deleteProject', project)" confirm-button-text="确定" cancel-button-text="取消">
                <template #reference>
                  <el-button size="small" text type="danger"><el-icon><Delete /></el-icon></el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
        <div v-if="projects.length === 0" class="empty-hint">
          <p>暂无项目</p>
        </div>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="main-content" v-if="selectedProject">
      <!-- 项目头部 -->
      <div class="project-header">
        <div class="header-left">
          <h2>{{ selectedProject.projectName }}</h2>
          <div class="header-tags">
            <el-tag size="small" :type="selectedProject.calculationType === CalculationType.QUANTITY ? 'primary' : 'success'">
              {{ CALCULATION_TYPE_LABELS[selectedProject.calculationType] }}
            </el-tag>
            <span v-if="selectedProject.calculationType === CalculationType.QUANTITY" class="header-meta">
              总量 {{ selectedProject.totalQuantity || 0 }} 台
            </span>
            <span v-if="canViewPerformance" class="header-meta">
              {{ selectedProject.calculationType === CalculationType.QUANTITY
                ? `送${stageTotals.delivery}/装${stageTotals.install}/调${stageTotals.debug}`
                : `${selectedProject.dailyPrice}元/天` }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <span v-if="selectedProject.members?.length" class="member-avatars">
            <template v-for="(m, i) in selectedProject.members.slice(0, 3)" :key="m.userId">
              <el-avatar :size="28" class="avatar-item">{{ (m.user?.name || '未')[0] }}</el-avatar>
            </template>
            <span v-if="selectedProject.members.length > 3" class="avatar-more">+{{ selectedProject.members.length - 3 }}</span>
          </span>
          <el-button v-if="canViewPerformance" size="small" @click="$emit('exportCurrent', selectedProject)">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards" v-if="myStats">
        <div class="stat-card" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
          <span class="stat-value">{{ myStats.deliveryCount }}</span>
          <span class="stat-key">送货(台)</span>
        </div>
        <div class="stat-card" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
          <span class="stat-value">{{ myStats.installCount }}</span>
          <span class="stat-key">安装(台)</span>
        </div>
        <div class="stat-card" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
          <span class="stat-value">{{ myStats.debugCount }}</span>
          <span class="stat-key">调试(台)</span>
        </div>
        <div class="stat-card" v-if="selectedProject.calculationType === CalculationType.DAILY">
          <span class="stat-value">{{ formatWorkHours(myStats.totalWorkDays * HOURS_PER_DAY) }}</span>
          <span class="stat-key">工作时长</span>
        </div>
        <div class="stat-card total">
          <span class="stat-value">¥{{ (myStats?.totalAmount || 0).toFixed(2) }}</span>
          <span class="stat-key">合计金额</span>
        </div>
      </div>

      <!-- 设备清单（仅按量） -->
      <section class="panel" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
        <div class="panel-header collapsible" @click="devicePanelCollapsed = !devicePanelCollapsed">
          <h3>客户设备清单 <el-icon class="collapse-icon" :class="{ collapsed: devicePanelCollapsed }"><ArrowRight /></el-icon></h3>
          <div class="panel-actions" @click.stop>
            <el-button size="small" type="primary" @click="$emit('createDevice')">+ 新增</el-button>
            <el-button size="small" @click="$emit('importDevice')">导入</el-button>
          </div>
        </div>
        <div class="panel-body" v-show="!devicePanelCollapsed">
          <el-table
            v-if="devices.length > 0"
            :data="devices"
            stripe
            size="small"
            :row-class-name="getDeviceRowClass"
          >
            <el-table-column label="#" type="index" width="45" />
            <el-table-column label="客户" min-width="100">
              <template #default="{ row }">{{ row.customer?.name || '-' }}</template>
            </el-table-column>
            <el-table-column label="设备名称" prop="deviceName" min-width="140" />
            <el-table-column label="应送" width="60" align="center">
              <template #default="{ row }">{{ row.expectedQuantity }}</template>
            </el-table-column>
            <el-table-column label="送货" width="70" align="right">
              <template #default="{ row }">
                <span :class="{ done: row.deliveryQuantity >= row.expectedQuantity }">
                  {{ row.deliveryQuantity }}/{{ row.expectedQuantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="安装" width="70" align="right">
              <template #default="{ row }">
                <span :class="{ done: row.installQuantity >= row.deliveryQuantity && row.deliveryQuantity > 0 }">
                  {{ row.installQuantity }}/{{ row.deliveryQuantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="调试" width="70" align="right">
              <template #default="{ row }">
                <span :class="{ done: row.debugQuantity >= row.installQuantity && row.installQuantity > 0 }">
                  {{ row.debugQuantity }}/{{ row.installQuantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isCompleted ? 'success' : 'warning'" size="small">
                  {{ row.isCompleted ? '完成' : '进行中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <div class="row-actions">
                  <el-button size="small" link type="primary" @click="$emit('editDevice', row)">编辑</el-button>
                  <el-button size="small" link type="danger" @click="$emit('deleteDevice', row)" :disabled="row.isCompleted">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="empty-tip">
            <p>暂无设备，点击「新增」或「导入」添加</p>
          </div>
        </div>
      </section>

      <!-- 工作记录 -->
      <section class="panel">
        <div class="panel-header collapsible" @click="recordPanelCollapsed = !recordPanelCollapsed">
          <h3>工作记录 <el-icon class="collapse-icon" :class="{ collapsed: recordPanelCollapsed }"><ArrowRight /></el-icon></h3>
          <div class="panel-actions" @click.stop>
            <el-button size="small" type="primary" @click="$emit('createRecord')">+ 新增记录</el-button>
          </div>
        </div>
        <div class="panel-body" v-show="!recordPanelCollapsed">
          <el-table class="records-table" :data="paginatedRecords" stripe size="small">
            <el-table-column width="105" sortable prop="date">
              <template #header>
                <div class="th-filter"><span>日期</span></div>
              </template>
              <template #default="{ row }">{{ formatDate(row.date) }}</template>
            </el-table-column>
            <el-table-column width="120">
              <template #header>
                <div class="th-filter">
                  <span>类型</span>
                  <el-select
                    v-model="recordFilter.recordType"
                    size="small"
                    clearable
                    placeholder="全部"
                    class="th-filter-select"
                  >
                    <el-option v-for="(label, key) in RECORD_TYPE_LABELS" :key="key" :label="label" :value="key" />
                  </el-select>
                </div>
              </template>
              <template #default="{ row }">
                <el-tag size="small" :type="getRecordTypeTag(row.recordType)">
                  {{ RECORD_TYPE_LABELS[(row.recordType || '') as RecordType] || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column width="95">
              <template #header>
                <div class="th-filter"><span>数量/时长</span></div>
              </template>
              <template #default="{ row }">
                <span v-if="selectedProject!.calculationType === CalculationType.QUANTITY">{{ row.quantity || 0 }} 台</span>
                <span v-else>{{ formatWorkHours(row.workHours || 0) }}</span>
              </template>
            </el-table-column>
            <el-table-column min-width="140" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
              <template #header>
                <div class="th-filter">
                  <span>客户</span>
                  <el-select
                    v-model="recordFilter.customerId"
                    size="small"
                    clearable
                    filterable
                    placeholder="全部"
                    class="th-filter-select"
                  >
                    <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
                  </el-select>
                </div>
              </template>
              <template #default="{ row }">{{ row.customer?.name || '-' }}</template>
            </el-table-column>
            <el-table-column min-width="140">
              <template #header>
                <div class="th-filter"><span>协作人</span></div>
              </template>
              <template #default="{ row }">
                <span v-for="(c, i) in row.collaborators" :key="c.id">
                  {{ i ? '、' : '' }}{{ c.name }}
                </span>
                <span v-if="row.includeRecorder && row.creator">{{ row.collaborators?.length ? '、' : '' }}{{ row.creator.name }}(记)</span>
              </template>
            </el-table-column>
            <el-table-column min-width="120" show-overflow-tooltip v-if="selectedProject.calculationType === CalculationType.DAILY">
              <template #header>
                <div class="th-filter"><span>描述</span></div>
              </template>
              <template #default="{ row }">{{ row.description || '-' }}</template>
            </el-table-column>
            <el-table-column width="90" v-if="canManageProject" fixed="right">
              <template #header>
                <div class="th-filter"><span>操作</span></div>
              </template>
              <template #default="{ row }">
                <el-button size="small" link type="primary" @click="$emit('editRecord', row)">编辑</el-button>
                <el-button size="small" link type="danger" @click="$emit('deleteRecord', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="filteredRecords.length > pageSize" class="pagination-wrap">
            <el-pagination v-model:current-page="currentPageModel" :page-size="pageSize" :total="filteredRecords.length" layout="prev, pager, next" small />
          </div>
          <div v-if="filteredRecords.length === 0" class="empty-tip">
            <p>{{ records.length === 0 ? '暂无工作记录' : '没有符合筛选条件的记录' }}</p>
          </div>
        </div>
      </section>

      <!-- 工作量汇总 -->
      <section class="panel" v-if="canViewPerformance">
        <div class="panel-header collapsible" @click="statsPanelCollapsed = !statsPanelCollapsed">
          <h3>工作量汇总 <el-icon class="collapse-icon" :class="{ collapsed: statsPanelCollapsed }"><ArrowRight /></el-icon></h3>
          <div class="panel-actions" @click.stop>
            <el-button size="small" @click="$emit('refreshStats')">刷新</el-button>
          </div>
        </div>
        <div class="panel-body" v-show="!statsPanelCollapsed">
          <StatsTable
            v-if="selectedProject"
            :data="stats"
            :calculation-type="selectedProject.calculationType"
          />
          <div v-if="stats.length === 0" class="empty-tip">
            <p>暂无汇总数据</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 空状态 -->
    <main class="main-content empty" v-else>
      <div class="empty-placeholder">
        <p>← 从左侧选择一个项目</p>
      </div>
    </main>

    <!-- 新建项目弹窗 -->
    <el-dialog v-model="showCreateProjectModalModel" title="新建项目" width="520px" destroy-on-close>
      <el-form :model="projectForm" label-width="100px">
        <el-form-item label="项目名称" required v-shake ref="projectNameItem">
          <el-input v-model="projectForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="计算方式" required>
          <el-radio-group v-model="projectForm.calculationType">
            <el-radio :value="CalculationType.QUANTITY">按数量计算</el-radio>
            <el-radio :value="CalculationType.DAILY">按工日计算</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设备总量" v-if="projectForm.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="projectForm.totalQuantity" :min="1" style="width: 200px" />
          <span class="unit"> 台</span>
        </el-form-item>
        <el-form-item label="送货单价" v-if="projectForm.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="projectForm.deliveryUnitPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/台</span>
        </el-form-item>
        <el-form-item label="安装单价" v-if="projectForm.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="projectForm.installUnitPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/台</span>
        </el-form-item>
        <el-form-item label="调试单价" v-if="projectForm.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="projectForm.debugUnitPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/台</span>
        </el-form-item>
        <el-form-item label="按工日单价" v-if="projectForm.calculationType === CalculationType.DAILY">
          <el-input-number v-model="projectForm.dailyPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/天</span>
        </el-form-item>
        <el-form-item label="参与人员">
          <el-select v-model="projectForm.memberIds" multiple placeholder="选择参与人员" style="width: 100%" filterable>
            <el-option v-for="user in users.filter(u => u?.id)" :key="user.id" :label="user.name || '未知'" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="projectForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateProjectModalModel = false">取消</el-button>
        <el-button type="primary" @click="handleCreateProject">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑项目弹窗 -->
    <el-dialog v-model="showEditProjectModalModel" title="编辑项目" width="520px" destroy-on-close>
      <el-form :model="projectForm" label-width="100px">
        <el-form-item label="项目名称" required v-shake ref="editProjectNameItem">
          <el-input v-model="projectForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="设备总量" v-if="projectForm.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="projectForm.totalQuantity" :min="1" style="width: 200px" />
          <span class="unit"> 台</span>
        </el-form-item>
        <el-form-item label="送货单价" v-if="projectForm.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="projectForm.deliveryUnitPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/台</span>
        </el-form-item>
        <el-form-item label="安装单价" v-if="projectForm.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="projectForm.installUnitPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/台</span>
        </el-form-item>
        <el-form-item label="调试单价" v-if="projectForm.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="projectForm.debugUnitPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/台</span>
        </el-form-item>
        <el-form-item label="按工日单价" v-if="projectForm.calculationType === CalculationType.DAILY">
          <el-input-number v-model="projectForm.dailyPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/天</span>
        </el-form-item>
        <el-form-item label="参与人员">
          <el-select v-model="projectForm.memberIds" multiple placeholder="选择参与人员" style="width: 100%" filterable>
            <el-option v-for="user in users.filter(u => u?.id)" :key="user.id" :label="user.name || '未知'" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="projectForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditProjectModalModel = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProject">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑设备弹窗 -->
    <el-dialog v-model="showCreateDeviceModalModel" title="新增设备" width="500px" destroy-on-close>
      <el-form :model="deviceForm" label-width="80px">
        <el-form-item label="客户" required v-shake ref="deviceCustomerItem">
          <el-select v-model="deviceForm.customerId" placeholder="选择客户" filterable style="width: 100%">
            <el-option v-for="customer in customers.filter(c => c?.id)" :key="customer.id" :label="customer.name || '未知'" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required v-shake ref="deviceNameItem">
          <el-input v-model="deviceForm.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="预计数量" required>
          <el-input-number v-model="deviceForm.expectedQuantity" :min="1" style="width: 150px" />
          <span class="unit"> 台</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="deviceForm.remark" placeholder="可选备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDeviceModalModel = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDeviceClick">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDeviceModalModel" title="编辑设备" width="500px" destroy-on-close>
      <el-form :model="deviceForm" label-width="80px">
        <el-form-item label="客户" required>
          <el-select v-model="deviceForm.customerId" placeholder="选择客户" filterable style="width: 100%" disabled>
            <el-option v-for="customer in customers.filter(c => c?.id)" :key="customer.id" :label="customer.name || '未知'" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required v-shake ref="editDeviceNameItem">
          <el-input v-model="deviceForm.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="预计数量" required>
          <el-input-number v-model="deviceForm.expectedQuantity" :min="1" style="width: 150px" />
          <span class="unit"> 台</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="deviceForm.remark" placeholder="可选备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDeviceModalModel = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDeviceClick">确定</el-button>
      </template>
    </el-dialog>

    <!-- 阶段记录弹窗 -->
    <el-dialog v-model="showStageModalModel" :title="stageModalTitle" width="480px" destroy-on-close>
      <el-form :model="stageForm" label-width="90px">
        <div class="confirm-info">
          <p><strong>客户：</strong>{{ editingDevice?.customer?.name }}</p>
          <p><strong>设备：</strong>{{ editingDevice?.deviceName }}</p>
          <p v-if="currentStage === 'delivery'"><strong>待送货：</strong>{{ (editingDevice?.expectedQuantity || 0) - (editingDevice?.deliveryQuantity || 0) }} 台</p>
          <p v-else-if="currentStage === 'install'"><strong>待安装：</strong>{{ (editingDevice?.deliveryQuantity || 0) - (editingDevice?.installQuantity || 0) }} 台</p>
          <p v-else-if="currentStage === 'debug'"><strong>待调试：</strong>{{ (editingDevice?.installQuantity || 0) - (editingDevice?.debugQuantity || 0) }} 台</p>
        </div>
        <el-form-item label="工作日期" required v-shake ref="stageDateItem">
          <el-date-picker v-model="stageForm.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="数量" required>
          <el-input-number v-model="stageForm.quantity" :min="1" :max="stageMaxQuantity" style="width: 160px" />
          <span class="unit">台</span>
        </el-form-item>
        <el-form-item label="协作人员">
          <el-select v-model="stageForm.collaboratorIds" multiple placeholder="选择协作人员" style="width: 100%">
            <el-option v-for="user in users.filter(u => u?.id)" :key="user.id" :label="user.name || '未知'" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="包含记录人">
          <el-switch v-model="stageForm.includeRecorder" />
          <span class="switch-hint">关闭后记录人不参与工作量分润</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="stageForm.remark" placeholder="可选备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStageModalModel = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitStageClick">确定</el-button>
      </template>
    </el-dialog>

    <!-- 工作记录弹窗 -->
    <el-dialog v-model="showRecordModalModel" :title="editingRecord ? '编辑工作记录' : '新增工作记录'" width="540px" destroy-on-close>
      <el-form :model="recordForm" label-width="90px">
        <el-form-item label="日期" required v-shake ref="recordDateItem">
          <el-date-picker v-model="recordForm.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="工作类型" required v-shake ref="recordTypeItem">
          <el-checkbox-group v-model="recordForm.recordTypes">
            <el-checkbox :value="RecordType.DELIVERY" :disabled="selectedProject?.calculationType !== CalculationType.QUANTITY">送货</el-checkbox>
            <el-checkbox :value="RecordType.INSTALL" :disabled="selectedProject?.calculationType !== CalculationType.QUANTITY">安装</el-checkbox>
            <el-checkbox :value="RecordType.DEBUG" :disabled="selectedProject?.calculationType !== CalculationType.QUANTITY">调试</el-checkbox>
            <el-checkbox :value="RecordType.CONSTRUCTION" :disabled="selectedProject?.calculationType !== CalculationType.DAILY">施工</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <template v-if="selectedProject?.calculationType === CalculationType.QUANTITY">
          <el-form-item label="客户" required v-shake ref="recordCustomerItem">
            <el-select v-model="recordForm.customerId" placeholder="先选择工作类型" clearable filterable style="width: 100%" :disabled="!hasSelectedRecordType" @change="onRecordCustomerChange">
              <el-option v-for="customer in filteredCustomersForRecord" :key="customer.id" :label="customer.shortName ? `${customer.shortName} (${customer.name})` : customer.name" :value="customer.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联设备" required v-shake ref="recordDeviceItem">
            <el-select v-model="recordForm.deviceId" placeholder="先选择客户" filterable style="width: 100%" :disabled="!recordForm.customerId">
              <el-option v-for="d in filteredDevicesForRecord" :key="d.id" :label="`${d.customer?.shortName || d.customer?.name || '未知'} - ${d.deviceName || '未知'}`" :value="d.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="数量" required>
            <el-input-number v-model="recordForm.quantity" :min="1" :max="maxQuantityForRecord" style="width: 140px" />
            <span class="unit"> 台</span>
            <span v-if="maxQuantityForRecord < Infinity" class="max-hint">（剩余可填：{{ maxQuantityForRecord }} 台）</span>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="工作时长" required>
            <el-input-number v-model="recordForm.workDuration" :min="0.5" :step="0.5" style="width: 120px" />
            <el-select v-model="recordForm.workUnit" style="width: 80px; margin-left: 8px;">
              <el-option :value="WorkUnit.DAY" :label="'工日'" />
              <el-option :value="WorkUnit.HOUR" :label="'小时'" />
            </el-select>
          </el-form-item>
          <el-form-item label="工作描述">
            <el-input v-model="recordForm.description" type="textarea" :rows="3" placeholder="描述工作内容..." />
          </el-form-item>
        </template>
        <el-form-item label="协作人员">
          <el-select v-model="recordForm.collaboratorIds" multiple placeholder="选择协作人员" style="width: 100%">
            <el-option v-for="user in users.filter(u => u?.id)" :key="user.id" :label="user.name || '未知'" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="包含记录人">
          <el-switch v-model="recordForm.includeRecorder" />
          <span class="switch-hint">关闭后记录人不参与工作量分润</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="recordForm.remark" placeholder="可选备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRecordModalModel = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRecordClick">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导入设备弹窗 -->
    <el-dialog v-model="showImportModalModel" title="导入设备" width="600px" destroy-on-close>
      <div class="import-header">
        <el-button type="primary" link :icon="Download" @click="$emit('downloadTemplate')">下载导入模板</el-button>
        <span class="import-tip">请按模板格式填写后上传</span>
      </div>
      <el-upload
        ref="uploadRef"
        drag
        accept=".xlsx,.xls,.csv"
        :auto-upload="false"
        :limit="1"
        :on-change="(file: any) => $emit('fileChange', file)"
        :on-remove="() => { /* 父组件处理 */ }"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">支持 .xlsx, .xls, .csv 文件</div>
        </template>
      </el-upload>
      <div v-if="importData.length > 0" class="import-preview">
        <h4>预览数据 (共 {{ importData.length }} 条)</h4>
        <el-table :data="previewData" border size="small" max-height="250">
          <el-table-column label="客户名称">
            <template #default="{ row }">
              <span :class="{ 'matched-name': row.matched, 'original-name': !row.matched }">{{ row.resolvedName }}</span>
              <el-tag v-if="row.matched && row.resolvedName !== row.customerName" size="small" type="warning" class="corrected-tag">已更正</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deviceName" label="设备名称" />
          <el-table-column prop="expectedQuantity" label="数量" width="80" />
          <el-table-column prop="remark" label="备注" />
        </el-table>
        <p v-if="importData.length > 10" class="preview-more">...还有 {{ importData.length - 10 }} 条数据</p>

        <!-- 客户匹配面板 -->
        <div v-if="unmatchedCount > 0" class="customer-match-panel">
          <div class="match-header">
            <h4>客户匹配（{{ unmatchedCount }} 个未匹配）</h4>
            <div class="match-actions">
              <el-button size="small" type="warning" @click="$emit('applyAllSuggestions')">全部更正</el-button>
              <el-button size="small" type="success" @click="$emit('createAllUnmatched')">全部新建</el-button>
            </div>
          </div>
          <el-table :data="Object.entries(importCustomerMap).filter(([, v]) => !v.matchedId).map(([name, v]) => ({ name, ...v }))" border size="small" max-height="200">
            <el-table-column prop="name" label="导入客户名" width="180" />
            <el-table-column label="选择已有客户">
              <template #default="{ row }">
                <el-select v-model="importCustomerMap[row.name].matchedId" placeholder="选择客户" filterable size="small" style="width: 100%">
                  <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="建议" width="200">
              <template #default="{ row }">
                <div v-if="row.suggestions.length > 0" class="suggestions">
                  <el-tag v-for="s in row.suggestions" :key="s.id" size="small" class="suggestion-tag" @click="importCustomerMap[row.name].matchedId = s.id">
                    {{ s.name }}
                  </el-tag>
                </div>
                <span v-else class="no-suggestion">无相似客户</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else-if="importData.length > 0 && Object.keys(importCustomerMap).length > 0" class="match-done">
          <el-alert title="所有客户已匹配" type="success" :closable="false" show-icon />
        </div>
      </div>
      <template #footer>
        <el-button @click="showImportModalModel = false">取消</el-button>
        <el-button type="primary" @click="$emit('confirmImport')" :disabled="importData.length === 0 || unmatchedCount > 0">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Download, EditPen, Delete, UploadFilled, ArrowRight } from '@element-plus/icons-vue';
import StatsTable from './StatsTable.vue';
import {
  CalculationType,
  CALCULATION_TYPE_LABELS,
  RecordType,
  RECORD_TYPE_LABELS,
  WorkUnit,
  HOURS_PER_DAY,
  formatWorkHours,
} from '@/types';
import type { Project, WorkRecord, User, Customer, CustomerDevice, PerformanceResult, MyPerformanceStats } from '@/types';

const props = defineProps<{
  projects: Project[];
  selectedProject: Project | null;
  records: WorkRecord[];
  stats: PerformanceResult[];
  myStats: MyPerformanceStats | null;
  devices: CustomerDevice[];
  users: User[];
  customers: Customer[];
  canCreateProject: boolean;
  canManageProject: boolean;
  canCreateRecord: boolean;
  canViewPerformance: boolean;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  projectForm: any;
  recordForm: any;
  editingRecord: WorkRecord | null;
  deviceForm: any;
  editingDevice: CustomerDevice | null;
  currentStage: 'delivery' | 'install' | 'debug';
  stageForm: any;
  stageMaxQuantity: number;
  stageModalTitle: string;
  importData: Array<{ customerName: string; deviceName: string; expectedQuantity: number; remark?: string }>;
  importCustomerMap: Record<string, { matchedId: string | null; suggestions: Customer[] }>;
  unmatchedCount: number;
  showCreateProjectModal: boolean;
  showEditProjectModal: boolean;
  showRecordModal: boolean;
  showCreateDeviceModal: boolean;
  showEditDeviceModal: boolean;
  showStageModal: boolean;
  showImportModal: boolean;
}>();

const emit = defineEmits<{
  selectProject: [project: Project];
  createProject: [];
  editProject: [project: Project];
  deleteProject: [project: Project];
  exportAll: [];
  exportCurrent: [project: Project];
  createRecord: [];
  editRecord: [record: WorkRecord];
  saveRecord: [];
  deleteRecord: [record: WorkRecord];
  refreshStats: [];
  createDevice: [];
  editDevice: [device: CustomerDevice];
  saveDevice: [];
  deleteDevice: [device: CustomerDevice];
  recordStage: [device: CustomerDevice, stage: 'delivery' | 'install' | 'debug'];
  submitStage: [];
  importDevice: [];
  downloadTemplate: [];
  fileChange: [file: any];
  confirmImport: [];
  createAllUnmatched: [];
  applyAllSuggestions: [];
  pageChange: [page: number];
  createProjectSubmit: [];
  updateProjectSubmit: [];
  updateShowCreateProjectModal: [value: boolean];
  updateShowEditProjectModal: [value: boolean];
  updateShowRecordModal: [value: boolean];
  updateShowCreateDeviceModal: [value: boolean];
  updateShowEditDeviceModal: [value: boolean];
  updateShowStageModal: [value: boolean];
  updateShowImportModal: [value: boolean];
}>();

// v-model 代理
const currentPageModel = computed({
  get: () => props.currentPage,
  set: (v: number) => emit('pageChange', v),
});

// 预览数据：显示匹配后的客户名
const previewData = computed(() => {
  return props.importData.slice(0, 10).map(item => {
    const match = props.importCustomerMap[item.customerName];
    let resolvedName = item.customerName;
    let matched = false;
    if (match?.matchedId) {
      const c = props.customers.find(cu => cu.id === match.matchedId);
      if (c) {
        resolvedName = c.name;
        matched = true;
      }
    }
    return { ...item, resolvedName, matched };
  });
});

// 记录表单校验：摇晃提示
const recordDateItem = ref<any>(null);
const recordTypeItem = ref<any>(null);
const recordCustomerItem = ref<any>(null);
const recordDeviceItem = ref<any>(null);

// 设备表单校验：摇晃提示
const deviceCustomerItem = ref<any>(null);
const deviceNameItem = ref<any>(null);
const editDeviceNameItem = ref<any>(null);

// 阶段记录表单校验
const stageDateItem = ref<any>(null);

// 项目表单校验
const projectNameItem = ref<any>(null);
const editProjectNameItem = ref<any>(null);

const shakeItem = (itemRef: any) => {
  const el = itemRef?.$el || itemRef;
  el?.__shake?.();
};

const handleCreateProject = () => {
  if (!props.projectForm.projectName?.trim()) {
    shakeItem(projectNameItem.value);
    return;
  }
  emit('createProjectSubmit');
};

const handleUpdateProject = () => {
  if (!props.projectForm.projectName?.trim()) {
    shakeItem(editProjectNameItem.value);
    return;
  }
  emit('updateProjectSubmit');
};

const handleSubmitStageClick = () => {
  if (!props.stageForm.date) {
    shakeItem(stageDateItem.value);
    return;
  }
  emit('submitStage');
};

const handleSaveDeviceClick = () => {
  const form = props.deviceForm;
  let invalid = false;
  // 编辑模式下客户不可改，无需校验
  if (!props.showEditDeviceModal && !form.customerId) {
    shakeItem(deviceCustomerItem.value);
    invalid = true;
  }
  if (!form.deviceName?.trim()) {
    shakeItem(props.showEditDeviceModal ? editDeviceNameItem.value : deviceNameItem.value);
    invalid = true;
  }
  if (invalid) return;
  emit('saveDevice');
};

const handleSaveRecordClick = () => {
  const form = props.recordForm;
  const isQuantity = props.selectedProject?.calculationType === CalculationType.QUANTITY;
  let invalid = false;

  if (!form.date) {
    shakeItem(recordDateItem.value);
    invalid = true;
  }
  const recordType = form.recordType || form.recordTypes?.[0];
  if (!recordType) {
    shakeItem(recordTypeItem.value);
    invalid = true;
  }
  if (isQuantity) {
    if (!form.customerId) {
      shakeItem(recordCustomerItem.value);
      invalid = true;
    }
    if (!form.deviceId) {
      shakeItem(recordDeviceItem.value);
      invalid = true;
    }
  }
  if (invalid) return;
  emit('saveRecord');
};
const showCreateProjectModalModel = computed({
  get: () => props.showCreateProjectModal,
  set: (v: boolean) => emit('updateShowCreateProjectModal', v),
});
const showEditProjectModalModel = computed({
  get: () => props.showEditProjectModal,
  set: (v: boolean) => emit('updateShowEditProjectModal', v),
});
const showRecordModalModel = computed({
  get: () => props.showRecordModal,
  set: (v: boolean) => emit('updateShowRecordModal', v),
});
const showCreateDeviceModalModel = computed({
  get: () => props.showCreateDeviceModal,
  set: (v: boolean) => emit('updateShowCreateDeviceModal', v),
});
const showEditDeviceModalModel = computed({
  get: () => props.showEditDeviceModal,
  set: (v: boolean) => emit('updateShowEditDeviceModal', v),
});
const showStageModalModel = computed({
  get: () => props.showStageModal,
  set: (v: boolean) => emit('updateShowStageModal', v),
});
const showImportModalModel = computed({
  get: () => props.showImportModal,
  set: (v: boolean) => emit('updateShowImportModal', v),
});

const paginatedRecords = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize;
  return filteredRecords.value.slice(start, start + props.pageSize);
});

// 工作记录筛选
const recordFilter = ref<{ customerId: string; recordType: string }>({
  customerId: '',
  recordType: '',
});

// 面板折叠状态
const devicePanelCollapsed = ref(false);
const recordPanelCollapsed = ref(false);
const statsPanelCollapsed = ref(false);

const filteredRecords = computed(() => {
  return props.records.filter((r) => {
    // 客户筛选
    if (recordFilter.value.customerId && r.customerId !== recordFilter.value.customerId) return false;
    // 类型筛选
    if (recordFilter.value.recordType && r.recordType !== recordFilter.value.recordType) return false;
    return true;
  });
});

const resetRecordFilter = () => {
  recordFilter.value = { customerId: '', recordType: '' };
};

// 是否已选择工作类型
const hasSelectedRecordType = computed(() => {
  const types = props.recordForm.recordTypes || props.recordForm.recordType;
  return Array.isArray(types) ? types.length > 0 : !!types;
});

// 更改客户时清除关联设备
const onRecordCustomerChange = () => {
  props.recordForm.deviceId = '';
};

// 按选中类型判断设备是否已完成该类型
const isDeviceTypeDone = (d: CustomerDevice, type: string) => {
  if (type === RecordType.DELIVERY) return d.deliveryQuantity >= d.expectedQuantity;
  if (type === RecordType.INSTALL) return d.installQuantity >= d.expectedQuantity;
  if (type === RecordType.DEBUG) return d.debugQuantity >= d.expectedQuantity;
  return false;
};

// 过滤客户：至少有一个设备在选中类型上未完成
const filteredCustomersForRecord = computed(() => {
  if (!hasSelectedRecordType.value) return [];
  const types = props.recordForm.recordTypes || (props.recordForm.recordType ? [props.recordForm.recordType] : []);
  const validCustomerIds = new Set<string>();
  props.devices.forEach((d) => {
    // 设备至少有一个选中类型未完成
    const hasUnfinished = types.some((t: string) => !isDeviceTypeDone(d, t));
    if (hasUnfinished) validCustomerIds.add(d.customerId);
  });
  return props.customers.filter((c) => c?.id && validCustomerIds.has(c.id));
});

// 过滤设备：按客户 + 选中类型未完成
const filteredDevicesForRecord = computed(() => {
  if (!props.recordForm.customerId) return [];
  const types = props.recordForm.recordTypes || (props.recordForm.recordType ? [props.recordForm.recordType] : []);
  return props.devices.filter((d) => {
    if (d.customerId !== props.recordForm.customerId) return false;
    // 至少有一个选中类型未完成
    return types.some((t: string) => !isDeviceTypeDone(d, t));
  });
});

// 选中设备的剩余可填数量：取选中类型中最小的剩余值
const maxQuantityForRecord = computed(() => {
  if (!props.recordForm.deviceId) return Infinity;
  const device = props.devices.find((d) => d.id === props.recordForm.deviceId);
  if (!device) return Infinity;
  const types = props.recordForm.recordTypes || (props.recordForm.recordType ? [props.recordForm.recordType] : []);
  if (types.length === 0) return Infinity;
  const remainings = types.map((t: string) => {
    if (t === RecordType.DELIVERY) return device.expectedQuantity - device.deliveryQuantity;
    if (t === RecordType.INSTALL) return device.deliveryQuantity - device.installQuantity;
    if (t === RecordType.DEBUG) return device.installQuantity - device.debugQuantity;
    return Infinity;
  });
  return Math.max(0, Math.min(...remainings));
});

// 按数量计算项目：送/装/调累计数量（来自所有设备求和）
const stageTotals = computed(() => {
  const totals = { delivery: 0, install: 0, debug: 0 };
  for (const d of props.devices) {
    totals.delivery += d.deliveryQuantity || 0;
    totals.install += d.installQuantity || 0;
    totals.debug += d.debugQuantity || 0;
  }
  return totals;
});

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getRecordTypeTag = (type?: RecordType): '' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const map: Record<string, '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    DELIVERY: 'primary',
    INSTALL: 'success',
    DEBUG: 'warning',
    CONSTRUCTION: 'info',
  };
  return map[type || ''] || '';
};

const getDeviceRowClass = ({ row }: { row: CustomerDevice }) => {
  return row.isCompleted ? 'completed-row' : '';
};
</script>

<style scoped>
.performance-stats {
  display: flex;
  min-height: calc(100vh - 120px);
  gap: 0;
  background: #f5f7fa;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e8ecf0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: sticky;
  top: 0;
  height: calc(100vh - 120px);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f2f5;
  background: #fafbfc;
}

.sidebar-title { font-size: 15px; font-weight: 600; color: #1a1a1a; }
.sidebar-actions { display: flex; gap: 8px; }
.project-list { flex: 1; overflow-y: auto; padding: 12px; }

.project-card {
  padding: 10px 14px;
  margin-bottom: 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid transparent;
  background: #fff;
}

.project-card:hover { background: #f8fafc; border-color: #e2e8f0; }
.project-card.active { background: linear-gradient(135deg, #eff6ff, #f0fdf4); border-color: #3b82f6; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08); }

.card-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.card-row-top { margin-bottom: 6px; }
.card-row-bottom { font-size: 12px; }
.card-name { font-size: 14px; font-weight: 500; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }
.card-date { font-size: 12px; color: #94a3b8; }
.card-actions { opacity: 0; transition: opacity 0.2s; flex-shrink: 0; display: flex; gap: 2px; }
.project-card:hover .card-actions { opacity: 1; }
.empty-hint { text-align: center; padding: 48px 20px; color: #94a3b8; font-size: 13px; }

.main-content { flex: 1; padding: 24px 28px; background: #f5f7fa; }
.main-content.empty { display: flex; align-items: center; justify-content: center; color: #94a3b8; background: transparent; }
.empty-placeholder p { font-size: 15px; }

.project-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px; padding: 20px 24px; background: #fff;
  border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-left { flex: 1; min-width: 0; }
.header-left h2 { margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #0f172a; }
.header-tags { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.header-meta { font-size: 13px; color: #64748b; font-weight: 500; }
.header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; margin-left: 20px; }
.member-avatars { display: flex; align-items: center; }
.avatar-item { border: 2px solid #fff; margin-left: -8px; font-size: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }
.avatar-item:first-child { margin-left: 0; }
.avatar-more { margin-left: 6px; font-size: 12px; color: #64748b; font-weight: 500; }

.stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
.stat-card { background: #fff; padding: 16px 18px; border-radius: 10px; text-align: center; transition: all 0.2s ease; border: 1px solid #f1f5f9; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); }
.stat-value { display: block; font-size: 24px; font-weight: 700; color: #1e293b; line-height: 1.2; margin-bottom: 4px; }
.stat-key { font-size: 12px; color: #94a3b8; font-weight: 500; }
.stat-card.total { background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; }
.stat-card.total .stat-value { color: #fff; font-size: 26px; }
.stat-card.total .stat-key { color: rgba(255, 255, 255, 0.85); }

.panel { background: #fff; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); overflow: hidden; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }
.panel-header.collapsible { cursor: pointer; user-select: none; }
.panel-header.collapsible:hover { background: #f1f5f9; }
.panel-header h3 { margin: 0; font-size: 15px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 6px; }
.collapse-icon { transition: transform 0.2s; font-size: 14px; color: #64748b; }
.collapse-icon.collapsed { transform: rotate(-90deg); }
.panel-actions { display: flex; gap: 8px; }
.panel-body { padding: 16px 20px; }
.empty-tip { text-align: center; padding: 32px 20px; color: #94a3b8; font-size: 13px; }
.row-actions { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }

.th-filter { display: flex; flex-direction: row; align-items: center; gap: 6px; padding: 0; height: 100%; }
.th-filter > span { font-size: 12px; color: #909399; font-weight: 600; flex-shrink: 0; }
.th-filter-select { flex: 1; min-width: 0; }
.records-table :deep(.el-table__header th) { vertical-align: middle; }
.records-table :deep(.el-table__header th .cell) { width: 100%; display: flex; align-items: center; }
.done { color: #10b981; font-weight: 600; }
.amount { color: #94a3b8; font-size: 11px; }
.pagination-wrap { display: flex; justify-content: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; }

.unit { margin-left: 8px; color: #64748b; font-size: 13px; }
.max-hint { margin-left: 6px; color: #f59e0b; font-size: 12px; }
.switch-hint { margin-left: 10px; font-size: 12px; color: #94a3b8; }
.confirm-info { background: #f8fafc; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; font-size: 13px; border: 1px solid #e2e8f0; }
.confirm-info p { margin: 4px 0; color: #475569; }
.completed-row { background-color: #f0fdf4 !important; }
.completed-row:hover > td { background-color: #dcfce7 !important; }

.import-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.import-header .import-tip { font-size: 12px; color: var(--text-secondary, #999); }
.import-preview h4 { margin: 14px 0 10px; font-size: 13px; color: #374151; }
.preview-more { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 6px; }
.customer-match-panel { margin-top: 16px; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; background: #fffbeb; }
.match-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.match-header h4 { margin: 0; font-size: 13px; color: #b45309; }
.match-actions { display: flex; gap: 8px; }
.suggestions { display: flex; flex-wrap: wrap; gap: 4px; }
.suggestion-tag { cursor: pointer; }
.no-suggestion { font-size: 12px; color: #94a3b8; }
.match-done { margin-top: 12px; }
.matched-name { color: #16a34a; font-weight: 500; }
.original-name { color: #dc2626; }
.corrected-tag { margin-left: 6px; }
</style>


