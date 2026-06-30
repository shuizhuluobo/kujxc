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
                ? projectStageSummary
                : `${selectedProject.dailyPrice}元/天` }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <span v-if="selectedProject.members?.length" class="member-avatars">
            <template v-for="m in selectedProject.members.slice(0, 3)" :key="m.userId">
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
        <template v-if="selectedProject.calculationType === CalculationType.QUANTITY">
          <div
            v-for="stage in quantityStages"
            :key="stage.id"
            class="stat-card"
          >
            <span class="stat-value">{{ myStatsStageCount(stage.id) }}</span>
            <span class="stat-key">{{ stage.name }}(台)</span>
          </div>
        </template>
        <div class="stat-card" v-if="selectedProject.calculationType === CalculationType.DAILY">
          <span class="stat-value">{{ formatWorkHours(myStats.totalWorkDays * HOURS_PER_DAY) }}</span>
          <span class="stat-key">工作时长</span>
        </div>
        <div class="stat-card total" v-if="canViewAmount">
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
              <template #default="{ row }">{{ row.customer?.shortName || row.customer?.name || '-' }}</template>
            </el-table-column>
            <el-table-column label="设备名称" prop="deviceName" min-width="140" />
            <el-table-column label="应送" width="60" align="center">
              <template #default="{ row }">{{ row.expectedQuantity }}</template>
            </el-table-column>
            <el-table-column
              v-for="stage in deviceStages"
              :key="stage.id"
              :label="stage.name"
              width="80"
              align="right"
            >
              <template #default="{ row }">
                <span :class="{ done: stageProgress(row, stage.id) >= row.expectedQuantity }">
                  {{ stageProgress(row, stage.id) }}/{{ row.expectedQuantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="deviceCompleted(row) ? 'success' : 'warning'" size="small">
                  {{ deviceCompleted(row) ? '完成' : '进行中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <div class="row-actions">
                  <el-dropdown v-if="deviceStages.length > 0" trigger="click" @command="(cmd: string) => $emit('recordStage', row, cmd)">
                    <el-button size="small" link type="primary">记录<el-icon><ArrowDown /></el-icon></el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="stage in deviceStages"
                          :key="stage.id"
                          :command="stage.id"
                          :disabled="stageProgress(row, stage.id) >= row.expectedQuantity"
                        >
                          {{ stage.name }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <el-button size="small" link type="primary" @click="$emit('editDevice', row)">编辑</el-button>
                  <el-button size="small" link type="danger" @click="$emit('deleteDevice', row)" :disabled="deviceCompleted(row)">删除</el-button>
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
            <el-table-column width="120" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
              <template #header>
                <div class="th-filter">
                  <span>阶段</span>
                  <el-select
                    v-model="recordFilter.stageId"
                    size="small"
                    clearable
                    placeholder="全部"
                    class="th-filter-select"
                  >
                    <el-option v-for="stage in quantityStages" :key="stage.id" :label="stage.name" :value="stage.id" />
                  </el-select>
                </div>
              </template>
              <template #default="{ row }">
                <el-tag size="small" type="primary">
                  {{ getRecordStageName(row) || '-' }}
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
            :can-view-amount="canViewAmount"
            :stages="selectedProject.stages"
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
    <el-dialog v-model="showCreateProjectModalModel" title="新建项目" width="700px" destroy-on-close>
      <el-form :model="projectForm" label-width="100px">
        <el-form-item label="项目名称" required v-shake ref="projectNameItem">
          <el-input v-model="localProjectForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="计算方式" required>
          <el-radio-group v-model="localProjectForm.calculationType">
            <el-radio :value="CalculationType.QUANTITY">按数量计算</el-radio>
            <el-radio :value="CalculationType.DAILY">按工日计算</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设备总量" v-if="localProjectForm.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="localProjectForm.totalQuantity" :min="1" style="width: 200px" />
          <span class="unit"> 台</span>
        </el-form-item>
        <el-form-item label="阶段配置" v-if="localProjectForm.calculationType === CalculationType.QUANTITY">
          <el-table :data="localProjectForm.stages" border size="small" style="width: 100%">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="阶段名称" width="80">
              <template #default="{ row }">
                <el-input v-model="row.name" size="small" placeholder="如 送货" />
              </template>
            </el-table-column>
            <el-table-column label="编码" width="90">
              <template #default="{ row }">
                <el-input v-model="row.code" size="small" placeholder="如 delivery" />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="120" v-if="canViewAmount">
              <template #default="{ row }">
                <el-input-number v-model="row.unitPrice" :min="0" :precision="2" :controls="false" size="small" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="跟踪模式" width="120">
              <template #default="{ row }">
                <el-select v-model="row.trackingMode" size="small" style="width: 100%">
                  <el-option
                    v-for="(label, key) in STAGE_TRACKING_MODE_LABELS"
                    :key="key"
                    :label="label"
                    :value="key"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" align="center">
              <template #default="{ $index }">
                <el-button size="small" link type="danger" @click="removeStage($index)" :disabled="localProjectForm.stages.length <= 1">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button size="small" type="primary" link @click="addStage" style="margin-top: 8px">+ 添加阶段</el-button>
        </el-form-item>
        <el-form-item label="按工日单价" v-if="localProjectForm.calculationType === CalculationType.DAILY && canViewAmount">
          <el-input-number v-model="localProjectForm.dailyPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/天</span>
        </el-form-item>
        <el-form-item label="参与人员">
          <el-select v-model="localProjectForm.memberIds" multiple placeholder="选择参与人员" style="width: 100%" filterable>
            <el-option v-for="user in users.filter(u => u?.id)" :key="user.id" :label="user.name || '未知'" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="localProjectForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateProjectModalModel = false">取消</el-button>
        <el-button type="primary" @click="handleCreateProject">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑项目弹窗 -->
    <el-dialog v-model="showEditProjectModalModel" title="编辑项目" width="700px" destroy-on-close>
      <el-form :model="projectForm" label-width="100px">
        <el-form-item label="项目名称" required v-shake ref="editProjectNameItem">
          <el-input v-model="localProjectForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="设备总量" v-if="localProjectForm.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="localProjectForm.totalQuantity" :min="1" style="width: 200px" />
          <span class="unit"> 台</span>
        </el-form-item>
        <el-form-item label="阶段配置" v-if="localProjectForm.calculationType === CalculationType.QUANTITY">
          <el-table :data="localProjectForm.stages" border size="small" style="width: 100%">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="阶段名称" width="80">
              <template #default="{ row }">
                <el-input v-model="row.name" size="small" placeholder="如 送货" />
              </template>
            </el-table-column>
            <el-table-column label="编码" width="90">
              <template #default="{ row }">
                <el-input v-model="row.code" size="small" placeholder="如 delivery" />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="120" v-if="canViewAmount">
              <template #default="{ row }">
                <el-input-number v-model="row.unitPrice" :min="0" :precision="2" :controls="false" size="small" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="跟踪模式" width="120">
              <template #default="{ row }">
                <el-select v-model="row.trackingMode" size="small" style="width: 100%">
                  <el-option
                    v-for="(label, key) in STAGE_TRACKING_MODE_LABELS"
                    :key="key"
                    :label="label"
                    :value="key"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" align="center">
              <template #default="{ $index }">
                <el-button size="small" link type="danger" @click="removeStage($index)" :disabled="localProjectForm.stages.length <= 1">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button size="small" type="primary" link @click="addStage" style="margin-top: 8px">+ 添加阶段</el-button>
        </el-form-item>
        <el-form-item label="按工日单价" v-if="localProjectForm.calculationType === CalculationType.DAILY && canViewAmount">
          <el-input-number v-model="localProjectForm.dailyPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/天</span>
        </el-form-item>
        <el-form-item label="参与人员">
          <el-select v-model="localProjectForm.memberIds" multiple placeholder="选择参与人员" style="width: 100%" filterable>
            <el-option v-for="user in users.filter(u => u?.id)" :key="user.id" :label="user.name || '未知'" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="localProjectForm.remark" type="textarea" />
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
          <el-select v-model="localDeviceForm.customerId" placeholder="选择客户" filterable style="width: 100%">
            <el-option v-for="customer in customers.filter(c => c?.id)" :key="customer.id" :label="customer.name || '未知'" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required v-shake ref="deviceNameItem">
          <el-input v-model="localDeviceForm.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="预计数量" required>
          <el-input-number v-model="localDeviceForm.expectedQuantity" :min="1" style="width: 150px" />
          <span class="unit"> 台</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="localDeviceForm.remark" placeholder="可选备注" />
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
          <el-select v-model="localDeviceForm.customerId" placeholder="选择客户" filterable style="width: 100%" disabled>
            <el-option v-for="customer in customers.filter(c => c?.id)" :key="customer.id" :label="customer.name || '未知'" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required v-shake ref="editDeviceNameItem">
          <el-input v-model="localDeviceForm.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="预计数量" required>
          <el-input-number v-model="localDeviceForm.expectedQuantity" :min="1" style="width: 150px" />
          <span class="unit"> 台</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="localDeviceForm.remark" placeholder="可选备注" />
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
          <p v-if="currentStage">
            <strong>待{{ currentStage.name }}：</strong>{{ stageRemaining }} 台
          </p>
        </div>
        <el-form-item label="工作日期" required v-shake ref="stageDateItem">
          <el-date-picker v-model="localStageForm.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="数量" required>
          <el-input-number v-model="localStageForm.quantity" :min="1" :max="stageMaxQuantity" style="width: 160px" />
          <span class="unit">台</span>
        </el-form-item>
        <el-form-item label="协作人员">
          <el-select v-model="localStageForm.collaboratorIds" multiple placeholder="选择协作人员" style="width: 100%">
            <el-option v-for="user in collaboratorOptions" :key="user.id" :label="user.name || '未知'" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="包含记录人">
          <el-switch v-model="localStageForm.includeRecorder" />
          <span class="switch-hint">关闭后记录人不参与工作量分润</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="localStageForm.remark" placeholder="可选备注" />
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
          <el-date-picker v-model="localRecordForm.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="阶段" required v-shake ref="recordStageItem" v-if="selectedProject?.calculationType === CalculationType.QUANTITY">
          <el-select v-model="localRecordForm.stageId" placeholder="选择阶段" style="width: 100%" @change="onRecordStageChange">
            <el-option v-for="stage in quantityStages" :key="stage.id" :label="stage.name" :value="stage.id" />
          </el-select>
        </el-form-item>
        <template v-if="selectedProject?.calculationType === CalculationType.QUANTITY && currentSelectedStage?.trackingMode === StageTrackingMode.DEVICE">
          <el-form-item label="客户" required v-shake ref="recordCustomerItem">
            <el-select v-model="localRecordForm.customerId" placeholder="选择客户" clearable filterable style="width: 100%" @change="onRecordCustomerChange">
              <el-option v-for="customer in filteredCustomersForRecord" :key="customer.id" :label="customer.shortName ? `${customer.shortName} (${customer.name})` : customer.name" :value="customer.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联设备" required v-shake ref="recordDeviceItem">
            <el-select v-model="localRecordForm.deviceId" placeholder="先选择客户" filterable style="width: 100%" :disabled="!recordForm.customerId">
              <el-option v-for="d in filteredDevicesForRecord" :key="d.id" :label="`${d.customer?.shortName || d.customer?.name || '未知'} - ${d.deviceName || '未知'}`" :value="d.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="数量" required>
            <el-input-number v-model="localRecordForm.quantity" :min="1" :max="maxQuantityForRecord" style="width: 140px" />
            <span class="unit"> 台</span>
            <span v-if="maxQuantityForRecord < Infinity" class="max-hint">（剩余可填：{{ maxQuantityForRecord }} 台）</span>
          </el-form-item>
        </template>
        <template v-if="selectedProject?.calculationType === CalculationType.QUANTITY && currentSelectedStage?.trackingMode === StageTrackingMode.PROJECT">
          <el-form-item label="数量" required>
            <el-input-number v-model="localRecordForm.quantity" :min="1" style="width: 140px" />
            <span class="unit"> 台</span>
          </el-form-item>
        </template>
        <template v-if="selectedProject?.calculationType === CalculationType.DAILY">
          <el-form-item label="工作时长" required>
            <el-input-number v-model="localRecordForm.workDuration" :min="0.5" :step="0.5" style="width: 120px" />
            <el-select v-model="localRecordForm.workUnit" style="width: 80px; margin-left: 8px;">
              <el-option :value="WorkUnit.DAY" :label="'工日'" />
              <el-option :value="WorkUnit.HOUR" :label="'小时'" />
            </el-select>
          </el-form-item>
          <el-form-item label="工作描述">
            <el-input v-model="localRecordForm.description" type="textarea" :rows="3" placeholder="描述工作内容..." />
          </el-form-item>
        </template>
        <el-form-item label="协作人员">
          <el-select v-model="localRecordForm.collaboratorIds" multiple placeholder="选择协作人员" style="width: 100%">
            <el-option v-for="user in collaboratorOptions" :key="user.id" :label="user.name || '未知'" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="包含记录人">
          <el-switch v-model="localRecordForm.includeRecorder" />
          <span class="switch-hint">关闭后记录人不参与工作量分润</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="localRecordForm.remark" placeholder="可选备注" />
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
        :on-change="(file: UploadFile) => $emit('fileChange', file)"
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
                <el-select v-model="localImportCustomerMap[row.name].matchedId" placeholder="选择客户" filterable size="small" style="width: 100%">
                  <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="建议" width="200">
              <template #default="{ row }">
                <div v-if="row.suggestions.length > 0" class="suggestions">
                  <el-tag v-for="s in row.suggestions" :key="s.id" size="small" class="suggestion-tag" @click="localImportCustomerMap[row.name].matchedId = s.id">
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
import { Download, EditPen, Delete, UploadFilled, ArrowRight, ArrowDown } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus';
import StatsTable from './StatsTable.vue';
import {
  CalculationType,
  CALCULATION_TYPE_LABELS,
  StageTrackingMode,
  STAGE_TRACKING_MODE_LABELS,
  WorkUnit,
  HOURS_PER_DAY,
  formatWorkHours,
} from '@/types';
import type { Project, WorkRecord, User, Customer, CustomerDevice, PerformanceResult, MyPerformanceStats, ProjectStage, StageInput } from '@/types';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

interface ProjectForm {
  projectName: string;
  calculationType: CalculationType;
  totalQuantity: number;
  stages: StageInput[];
  dailyPrice: number;
  remark: string;
  memberIds: string[];
  editingId: string;
}

interface RecordForm {
  date: string;
  stageId: string;
  quantity: number;
  customerId: string;
  deviceId: string;
  workDuration: number;
  workUnit: WorkUnit;
  description: string;
  collaboratorIds: string[];
  includeRecorder: boolean;
  remark: string;
}

interface DeviceForm {
  customerId: string;
  deviceName: string;
  expectedQuantity: number;
  remark: string;
}

interface StageForm {
  date: string;
  quantity: number;
  collaboratorIds: string[];
  includeRecorder: boolean;
  remark: string;
}

interface ShakeableComponent {
  $el?: HTMLElement & { __shake?: () => void };
}

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
  canViewAmount: boolean;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  projectForm: ProjectForm;
  recordForm: RecordForm;
  editingRecord: WorkRecord | null;
  deviceForm: DeviceForm;
  editingDevice: CustomerDevice | null;
  currentStage: ProjectStage | undefined;
  stageForm: StageForm;
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
  recordStage: [device: CustomerDevice, stageId: string];
  submitStage: [];
  addStage: [];
  removeStage: [index: number];
  importDevice: [];
  downloadTemplate: [];
  fileChange: [file: UploadFile];
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

// Alias reactive props so v-model binds to local names (parent holds the same reactive objects by reference)
const localProjectForm = props.projectForm;
const localRecordForm = props.recordForm;
const localDeviceForm = props.deviceForm;
const localStageForm = props.stageForm;
const localImportCustomerMap = props.importCustomerMap;

// v-model 代理
const currentPageModel = computed({
  get: () => props.currentPage,
  set: (v: number) => emit('pageChange', v),
});

// 协作人候选列表：仅项目成员，排除当前用户（记录人本人）
const collaboratorOptions = computed(() => {
  const memberIds = props.selectedProject?.members?.map(m => m.userId) ?? [];
  return props.users.filter(u => u?.id && memberIds.includes(u.id) && u.id !== authStore.user?.id);
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
const recordDateItem = ref<ShakeableComponent | null>(null);
const recordStageItem = ref<ShakeableComponent | null>(null);
const recordCustomerItem = ref<ShakeableComponent | null>(null);
const recordDeviceItem = ref<ShakeableComponent | null>(null);

// 设备表单校验：摇晃提示
const deviceCustomerItem = ref<ShakeableComponent | null>(null);
const deviceNameItem = ref<ShakeableComponent | null>(null);
const editDeviceNameItem = ref<ShakeableComponent | null>(null);

// 阶段记录表单校验
const stageDateItem = ref<ShakeableComponent | null>(null);

// 项目表单校验
const projectNameItem = ref<ShakeableComponent | null>(null);
const editProjectNameItem = ref<ShakeableComponent | null>(null);

const shakeItem = (itemRef: ShakeableComponent | null | undefined) => {
  itemRef?.$el?.__shake?.();
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
  if (isQuantity && !form.stageId) {
    shakeItem(recordStageItem.value);
    invalid = true;
  }
  // DEVICE 模式阶段需要客户和设备
  const stage = currentSelectedStage.value;
  if (isQuantity && stage?.trackingMode === StageTrackingMode.DEVICE) {
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
const recordFilter = ref<{ customerId: string; stageId: string }>({
  customerId: '',
  stageId: '',
});

// 面板折叠状态
const devicePanelCollapsed = ref(false);
const recordPanelCollapsed = ref(false);
const statsPanelCollapsed = ref(false);

const filteredRecords = computed(() => {
  return props.records.filter((r) => {
    // 客户筛选
    if (recordFilter.value.customerId && r.customerId !== recordFilter.value.customerId) return false;
    // 阶段筛选
    if (recordFilter.value.stageId && r.stageId !== recordFilter.value.stageId) return false;
    return true;
  });
});

// 当前所选阶段对象
const currentSelectedStage = computed<ProjectStage | undefined>(() => {
  if (!props.recordForm.stageId) return undefined;
  return (props.selectedProject?.stages || []).find(s => s.id === props.recordForm.stageId);
});

// 更改阶段时清空客户和设备
const onRecordStageChange = () => {
  localRecordForm.customerId = '';
  localRecordForm.deviceId = '';
};

// 更改客户时清除关联设备
const onRecordCustomerChange = () => {
  localRecordForm.deviceId = '';
};

// 获取设备在指定阶段的已记录数量
const stageProgress = (d: CustomerDevice, stageId: string): number => {
  return d.stageProgress?.find(p => p.stageId === stageId)?.quantity || 0;
};

// 设备在某阶段是否已完成
const isDeviceStageComplete = (d: CustomerDevice, stageId: string): boolean => {
  return stageProgress(d, stageId) >= d.expectedQuantity;
};

// 设备是否所有 DEVICE 模式阶段都完成
const deviceCompleted = (d: CustomerDevice): boolean => {
  const deviceStages = (props.selectedProject?.stages || []).filter(s => s.trackingMode === StageTrackingMode.DEVICE);
  if (deviceStages.length === 0) return false;
  return deviceStages.every(s => isDeviceStageComplete(d, s.id));
};

// 过滤客户：至少有一个设备在所选阶段未完成（仅 DEVICE 模式阶段）
const filteredCustomersForRecord = computed(() => {
  const stage = currentSelectedStage.value;
  if (!stage || stage.trackingMode !== StageTrackingMode.DEVICE) return [];
  const validCustomerIds = new Set<string>();
  props.devices.forEach((d) => {
    if (!isDeviceStageComplete(d, stage.id)) validCustomerIds.add(d.customerId);
  });
  return props.customers.filter((c) => c?.id && validCustomerIds.has(c.id));
});

// 过滤设备：按客户 + 所选阶段未完成
const filteredDevicesForRecord = computed(() => {
  if (!props.recordForm.customerId) return [];
  const stage = currentSelectedStage.value;
  if (!stage || stage.trackingMode !== StageTrackingMode.DEVICE) return [];
  return props.devices.filter((d) => {
    if (d.customerId !== props.recordForm.customerId) return false;
    return !isDeviceStageComplete(d, stage.id);
  });
});

// 选中设备的剩余可填数量
const maxQuantityForRecord = computed(() => {
  if (!props.recordForm.deviceId) return Infinity;
  const device = props.devices.find((d) => d.id === props.recordForm.deviceId);
  if (!device) return Infinity;
  const stage = currentSelectedStage.value;
  if (!stage) return Infinity;
  return Math.max(0, device.expectedQuantity - stageProgress(device, stage.id));
});

// 项目的所有阶段（按 sortOrder 排序）
const quantityStages = computed<ProjectStage[]>(() => {
  if (props.selectedProject?.calculationType !== CalculationType.QUANTITY) return [];
  return (props.selectedProject?.stages || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
});

// 设备清单表格使用的 DEVICE 模式阶段
const deviceStages = computed<ProjectStage[]>(() => {
  return quantityStages.value.filter(s => s.trackingMode === StageTrackingMode.DEVICE);
});

// 阶段记录弹窗的剩余可填数量
const stageRemaining = computed(() => {
  if (!props.editingDevice || !props.currentStage) return 0;
  return Math.max(0, props.editingDevice.expectedQuantity - stageProgress(props.editingDevice, props.currentStage.id));
});

// 项目头部阶段汇总（送X/装Y/调Z 形式）
const projectStageSummary = computed(() => {
  const stages = quantityStages.value;
  if (stages.length === 0) return '';
  // 按阶段累计：仅 DEVICE 模式阶段按设备进度求和
  return stages.map(s => {
    const total = props.devices.reduce((sum, d) => sum + stageProgress(d, s.id), 0);
    return `${s.name}${total}`;
  }).join('/');
});

// 记录显示的阶段名称
const getRecordStageName = (record: WorkRecord): string => {
  if (record.stage?.name) return record.stage.name;
  if (record.stageId) {
    const s = (props.selectedProject?.stages || []).find(sg => sg.id === record.stageId);
    if (s) return s.name;
  }
  return '';
};

// 统计卡：某阶段我的记录数
const myStatsStageCount = (stageId: string): number => {
  if (!props.myStats) return 0;
  return props.myStats.stageStats[stageId]?.count || 0;
};

// 阶段配置操作
const addStage = () => emit('addStage');
const removeStage = (index: number) => emit('removeStage', index);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getDeviceRowClass = ({ row }: { row: CustomerDevice }) => {
  return deviceCompleted(row) ? 'completed-row' : '';
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


