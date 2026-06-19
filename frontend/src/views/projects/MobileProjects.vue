<template>
  <div class="mobile-projects">
    <!-- 项目列表 -->
    <div class="project-list" v-if="!selectedProject">
      <div class="list-header">
        <div class="title-group">
          <h2>项目列表</h2>
          <el-button
            size="small"
            :type="warehouseOnly ? 'warning' : 'default'"
            @click="warehouseOnly = !warehouseOnly"
          >公物仓</el-button>
        </div>
        <el-button v-if="canCreateProject" type="primary" size="small" @click="openCreateProjectDrawer">新增</el-button>
      </div>

      <div class="search-bar" v-if="projects.length > 5">
        <el-input v-model="searchText" placeholder="搜索项目" clearable prefix-icon="Search" size="default" />
      </div>

      <div class="cards">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @click="handleSelectProject(project)"
        >
          <div class="card-top">
            <span class="card-name">{{ project.projectName }}</span>
            <el-tag size="small" :type="getCalcTagType(project.calculationType)">
              {{ CALCULATION_TYPE_LABELS[project.calculationType] }}
            </el-tag>
          </div>
          <div class="card-info">
            <span v-if="project.calculationType === CalculationType.QUANTITY" class="info-item">
              总量 {{ project.totalQuantity || 0 }} 台
            </span>
            <span v-if="project.calculationType === CalculationType.DAILY" class="info-item">
              {{ project.dailyPrice }}元/天
            </span>
            <span v-if="project.calculationType === CalculationType.WAREHOUSE" class="info-item">
              公物仓计费
            </span>
            <span class="info-item date">{{ formatDate(project.createdAt) }}</span>
          </div>
          <div class="card-members" v-if="project.members?.length">
            <div class="avatar-group">
              <span
                v-for="(m, i) in project.members.slice(0, 4)"
                :key="m.userId"
                class="avatar"
                :style="{ background: avatarColors[i % avatarColors.length] }"
              >{{ (m.user?.name || '?')[0] }}</span>
              <span v-if="project.members.length > 4" class="avatar-more">+{{ project.members.length - 4 }}</span>
            </div>
          </div>
        </div>

        <div v-if="filteredProjects.length === 0" class="empty-state">
          <p>{{ searchText ? '没有匹配的项目' : '暂无项目' }}</p>
        </div>
      </div>
    </div>

    <!-- 项目详情 -->
    <div class="project-detail" v-else>
      <div class="detail-header">
        <el-button text @click="handleDeselectProject" class="back-btn">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
        <div class="header-actions" v-if="canManageProject || canCreateProject">
          <el-button v-if="canManageProject" size="small" text type="primary" @click="openEditProjectDrawer(selectedProject)">
            <el-icon><EditPen /></el-icon>
          </el-button>
          <el-popconfirm v-if="canManageProject" title="确定删除该项目？" @confirm="handleDeleteProject(selectedProject)" confirm-button-text="确定" cancel-button-text="取消">
            <template #reference>
              <el-button size="small" text type="danger"><el-icon><Delete /></el-icon></el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>

      <div class="detail-title">
        <h2>{{ selectedProject.projectName }}</h2>
        <el-tag size="small" :type="getCalcTagType(selectedProject.calculationType)">
          {{ CALCULATION_TYPE_LABELS[selectedProject.calculationType] }}
        </el-tag>
      </div>

      <!-- 公物仓费用计算 -->
      <div class="section" v-if="selectedProject.calculationType === CalculationType.WAREHOUSE">
        <div class="section-header">
          <h3>费用计算</h3>
          <el-button v-if="canManageProject" size="small" @click="showFeeSettings = true">设置</el-button>
        </div>
        <MobileFeeCalculator :project-id="selectedProject.id" :customers="customers" />
      </div>

      <!-- 公物仓历史记录 -->
      <div class="section" v-if="selectedProject.calculationType === CalculationType.WAREHOUSE && feeRecords.length > 0">
        <div class="section-header">
          <h3>费用记录</h3>
        </div>
        <div class="fee-record-list">
          <div v-for="record in visibleFeeRecords" :key="record.id" class="fee-record-card">
            <div class="record-top">
              <span class="record-time">{{ formatFeeDate(record.createdAt) }}</span>
              <span class="record-amount">¥{{ record.actualAmount.toFixed(2) }}</span>
            </div>
            <div class="record-items">
              <span v-for="(item, idx) in (record.items as any[]).slice(0, 3)" :key="idx" class="record-item-tag">
                {{ item.item }}×{{ item.quantity }}
              </span>
              <span v-if="(record.items as any[]).length > 3" class="record-item-more">
                ...等{{ (record.items as any[]).length }}项
              </span>
            </div>
            <div class="record-bottom" v-if="record.customer || record.remark || record.creator">
              <span class="record-customer" v-if="record.customer">{{ record.customer.name }}</span>
              <span class="record-remark" v-if="record.remark">{{ record.remark }}</span>
              <span class="record-creator" v-if="record.creator">{{ record.creator.name }}</span>
            </div>
          </div>
          <div class="load-more" v-if="hasMoreFee" @click="loadMoreFee">
            <span>加载更多（{{ feeRecords.length - feeDisplayCount }} 条）</span>
          </div>
        </div>
      </div>

      <!-- 设备清单（按量）- 默认折叠 -->
      <div class="section" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
        <div class="section-header collapsible" @click="deviceExpanded = !deviceExpanded">
          <h3>设备清单 <span class="device-summary">{{ deviceSummaryText }}</span></h3>
          <div class="section-actions" @click.stop>
            <el-button v-if="canManageDevice" size="small" type="primary" @click="openCreateDeviceDrawer">新增</el-button>
            <el-icon class="expand-icon" :class="{ expanded: deviceExpanded }"><ArrowRight /></el-icon>
          </div>
        </div>
        <template v-if="deviceExpanded">
          <div class="device-list" v-if="devices.length > 0">
            <div v-for="device in devices" :key="device.id" class="device-card" :class="{ completed: device.isCompleted }">
              <div class="device-top">
                <span class="device-name">{{ device.deviceName }}</span>
                <el-tag :type="device.isCompleted ? 'success' : 'warning'" size="small">
                  {{ device.isCompleted ? '完成' : '进行中' }}
                </el-tag>
              </div>
              <div class="device-customer">{{ device.customer?.name || '-' }}</div>
              <div class="device-progress">
                <div class="progress-step" :class="{ done: device.deliveryQuantity >= device.expectedQuantity }">
                  <span class="step-label">送</span>
                  <span class="step-val">{{ device.deliveryQuantity }}/{{ device.expectedQuantity }}</span>
                </div>
                <div class="progress-arrow" v-if="device.deliveryQuantity > 0">→</div>
                <div class="progress-step" :class="{ done: device.installQuantity >= device.deliveryQuantity && device.deliveryQuantity > 0 }" v-if="device.deliveryQuantity > 0">
                  <span class="step-label">装</span>
                  <span class="step-val">{{ device.installQuantity }}/{{ device.deliveryQuantity }}</span>
                </div>
                <div class="progress-arrow" v-if="device.installQuantity > 0">→</div>
                <div class="progress-step" :class="{ done: device.debugQuantity >= device.installQuantity && device.installQuantity > 0 }" v-if="device.installQuantity > 0">
                  <span class="step-label">调</span>
                  <span class="step-val">{{ device.debugQuantity }}/{{ device.installQuantity }}</span>
                </div>
              </div>
              <div class="device-actions" v-if="canManageDevice">
                <el-button size="small" type="primary" @click="openStageDrawer(device, 'delivery')" :disabled="device.deliveryQuantity >= device.expectedQuantity">送货</el-button>
                <el-button size="small" type="success" @click="openStageDrawer(device, 'install')" :disabled="device.installQuantity >= device.deliveryQuantity || device.deliveryQuantity === 0">安装</el-button>
                <el-button size="small" type="warning" @click="openStageDrawer(device, 'debug')" :disabled="device.debugQuantity >= device.installQuantity || device.installQuantity === 0">调试</el-button>
              </div>
            </div>
          </div>
          <div v-else class="empty-hint">暂无设备</div>
        </template>
      </div>

      <!-- 工作记录 -->
      <div class="section" v-if="selectedProject.calculationType !== CalculationType.WAREHOUSE">
        <div class="section-header">
          <h3>工作记录</h3>
          <el-button size="small" type="primary" @click="openCreateRecordDrawer">新增</el-button>
        </div>
        <div class="work-record-list" v-if="records.length > 0">
          <div
            v-for="record in visibleWorkRecords"
            :key="record.id"
            class="work-record-card"
            :class="{ expanded: expandedRecordIds.has(record.id) }"
            @click="toggleRecordExpand(record.id)"
          >
            <div class="record-summary">
              <span class="record-date">{{ formatDate(record.date) }}</span>
              <el-tag size="small" :type="getRecordTypeTag(record.recordType)">
                {{ RECORD_TYPE_LABELS[(record.recordType || '') as RecordType] || '-' }}
              </el-tag>
              <span class="record-qty">
                <template v-if="selectedProject.calculationType === CalculationType.QUANTITY">{{ record.quantity || 0 }}台</template>
                <template v-else>{{ formatWorkHours(record.workHours || 0) }}</template>
              </span>
              <span class="record-customer" v-if="record.customer">{{ record.customer.name }}</span>
              <el-icon class="expand-icon" :class="{ expanded: expandedRecordIds.has(record.id) }"><ArrowRight /></el-icon>
            </div>
            <template v-if="expandedRecordIds.has(record.id)">
              <div class="record-collaborators" v-if="record.collaborators?.length || record.includeRecorder">
                <span class="collab-label">协作：</span>
                <span v-for="(c, i) in record.collaborators" :key="c.id">{{ i ? '、' : '' }}{{ c.name }}</span>
                <span v-if="record.includeRecorder && record.creator">、{{ record.creator.name }}(记)</span>
              </div>
              <div class="record-remark" v-if="record.remark">备注：{{ record.remark }}</div>
              <div class="record-actions" v-if="canCreateRecord || canManageProject" @click.stop>
                <el-button v-if="canCreateRecord" size="small" text type="primary" @click="openEditRecordDrawer(record)">编辑</el-button>
                <el-button v-if="canManageProject" size="small" text type="danger" @click="handleDeleteRecord(record)">删除</el-button>
              </div>
            </template>
          </div>
          <div class="load-more" v-if="hasMoreWork" @click="loadMoreWork">
            <span>加载更多（{{ records.length - workDisplayCount }} 条）</span>
          </div>
        </div>
        <div v-else class="empty-hint">暂无工作记录</div>
      </div>

      <!-- 工作量汇总 -->
      <div class="section" v-if="canViewPerformance && stats.length > 0 && selectedProject.calculationType !== CalculationType.WAREHOUSE">
        <div class="section-header">
          <h3>工作量汇总 <span class="my-stats-mini" v-if="myStats">
            我的：
            <template v-if="selectedProject.calculationType === CalculationType.QUANTITY">
              送{{ myStats.deliveryCount }} 装{{ myStats.installCount }} 调{{ myStats.debugCount }}
            </template>
            <template v-else>{{ formatWorkHours(myStats.totalWorkDays * HOURS_PER_DAY) }}</template>
            ¥{{ (myStats.totalAmount || 0).toFixed(0) }}
          </span></h3>
        </div>
        <div class="stats-list">
          <div v-for="stat in stats" :key="stat.userId" class="stat-row">
            <span class="stat-name">{{ stat.userName }}</span>
            <div class="stat-detail">
              <template v-if="selectedProject.calculationType === CalculationType.QUANTITY">
                <span>送{{ stat.deliveryCount || 0 }}</span>
                <span>装{{ stat.installCount || 0 }}</span>
                <span>调{{ stat.debugCount || 0 }}</span>
              </template>
              <template v-else>
                <span>{{ formatWorkHours((stat.totalWorkDays || 0) * HOURS_PER_DAY) }}</span>
              </template>
            </div>
            <span class="stat-amount">¥{{ (stat.totalAmount || 0).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑项目抽屉 -->
    <el-drawer
      v-model="showProjectDrawer"
      :title="projectForm.editingId ? '编辑项目' : '新建项目'"
      direction="btt"
      size="60%"
    >
      <el-form :model="projectForm" label-position="top">
        <el-form-item label="项目名称" required>
          <el-input v-model="projectForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目类型" required>
          <div class="type-chips">
            <div
              v-for="(label, key) in CALCULATION_TYPE_LABELS"
              :key="key"
              class="type-chip"
              :class="{ active: projectForm.calculationType === key }"
              @click="projectForm.calculationType = key as CalculationType"
            >
              {{ label }}
            </div>
          </div>
        </el-form-item>
        <el-form-item label="项目成员">
          <div class="region-quick-pick" v-if="regionGroups.length">
            <span class="region-quick-label">按区域添加：</span>
            <el-tag
              v-for="rg in regionGroups"
              :key="rg.regionId"
              size="small"
              class="region-tag"
              @click="addUsersByRegion(rg.regionId)"
            >
              {{ rg.regionName }} ({{ rg.userIds.length }})
            </el-tag>
          </div>
          <el-select v-model="projectForm.memberIds" multiple filterable placeholder="选择成员" style="width: 100%">
            <el-option v-for="u in users.filter(u => u?.id)" :key="u.id" :label="u.name + (u.region?.name ? `（${u.region.name}）` : '')" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProjectDrawer = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProject" :disabled="!projectForm.projectName.trim()">{{ projectForm.editingId ? '保存' : '创建' }}</el-button>
      </template>
    </el-drawer>

    <!-- 新增/编辑记录抽屉 -->
    <el-drawer
      v-model="showRecordDrawer"
      :title="editingRecord ? '编辑记录' : '新增记录'"
      direction="btt"
      size="85%"
      :close-on-click-modal="false"
    >
      <el-form :model="recordForm" label-position="top" class="record-form">
        <el-form-item label="日期" required>
          <el-date-picker v-model="recordForm.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="工作类型" required>
          <div class="type-chips">
            <div
              v-for="opt in recordTypeOptions"
              :key="opt.value"
              class="type-chip"
              :class="{ active: recordForm.recordType === opt.value, disabled: opt.disabled }"
              @click="!opt.disabled && (recordForm.recordType = opt.value)"
            >
              {{ opt.label }}
            </div>
          </div>
        </el-form-item>
        <template v-if="selectedProject?.calculationType === CalculationType.QUANTITY">
          <el-form-item label="客户" required>
            <el-select v-model="recordForm.customerId" placeholder="选择客户" clearable filterable style="width: 100%">
              <el-option v-for="c in customers.filter(c => c?.id)" :key="c.id" :label="c.name || '未知'" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联设备">
            <el-select v-model="recordForm.deviceId" placeholder="选择设备（可选）" clearable filterable style="width: 100%">
              <el-option v-for="d in filteredDevicesForRecord.filter(d => d?.id)" :key="d.id" :label="`${d.customer?.name || ''} - ${d.deviceName}`" :value="d.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="数量" required>
            <div class="qty-row">
              <el-button :icon="Minus" circle size="small" @click="recordForm.quantity = Math.max(1, recordForm.quantity - 1)" />
              <span class="qty-val">{{ recordForm.quantity }}</span>
              <el-button :icon="Plus" circle size="small" @click="recordForm.quantity++" />
              <span class="qty-unit">台</span>
            </div>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="工作时长" required>
            <div class="qty-row">
              <el-button :icon="Minus" circle size="small" @click="recordForm.workDuration = Math.max(0.5, recordForm.workDuration - 0.5)" />
              <span class="qty-val">{{ recordForm.workDuration }}</span>
              <el-button :icon="Plus" circle size="small" @click="recordForm.workDuration += 0.5" />
              <el-segmented v-model="recordForm.workUnit" :options="[{ value: WorkUnit.DAY, label: '天' }, { value: WorkUnit.HOUR, label: '小时' }]" size="small" />
            </div>
          </el-form-item>
          <el-form-item label="工作描述">
            <el-input v-model="recordForm.description" type="textarea" :rows="3" placeholder="描述工作内容..." />
          </el-form-item>
        </template>
        <el-form-item label="协作人员">
          <el-select v-model="recordForm.collaboratorIds" multiple placeholder="选择协作人员" style="width: 100%">
            <el-option v-for="u in users.filter(u => u?.id)" :key="u.id" :label="u.name || '未知'" :value="u.id" />
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
        <el-button @click="showRecordDrawer = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRecord" :disabled="!canSaveRecord">保存</el-button>
      </template>
    </el-drawer>

    <!-- 设备阶段记录抽屉 -->
    <el-drawer
      v-model="stageDrawerVisible"
      :title="stageDrawerTitle"
      direction="btt"
      size="70%"
    >
      <el-form :model="mobileStageForm" label-position="top" class="stage-form">
        <el-form-item label="数量" v-if="mobileStageForm.maxQty > 0">
          <el-input-number v-model="mobileStageForm.quantity" :min="1" :max="mobileStageForm.maxQty" style="width: 100%" />
          <div class="form-tip">最多 {{ mobileStageForm.maxQty }} {{ mobileStageForm.unit }}</div>
        </el-form-item>
        <el-alert v-else type="warning" :closable="false" style="margin-bottom: 12px">
          该阶段已达上限，无需继续记录
        </el-alert>
        <el-form-item label="日期">
          <el-date-picker v-model="mobileStageForm.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="协作人">
          <el-select v-model="mobileStageForm.collaboratorIds" multiple filterable placeholder="选择协作人" style="width: 100%">
            <el-option v-for="u in users.filter(u => u?.id)" :key="u.id" :label="u.name || '未知'" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="包含记录人">
          <el-switch v-model="mobileStageForm.includeRecorder" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="mobileStageForm.remark" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
        <el-button type="primary" style="width: 100%; margin-top: 8px" :loading="stageSaving" :disabled="stageSaving || mobileStageForm.maxQty <= 0" @click="handleSubmitStage">确认记录</el-button>
      </el-form>
    </el-drawer>

    <!-- 新增设备抽屉 -->
    <el-drawer
      v-model="deviceDrawerVisible"
      title="新增设备"
      direction="btt"
      size="70%"
    >
      <el-form :model="deviceForm" label-position="top" class="stage-form">
        <el-form-item label="客户" required>
          <el-select v-model="deviceForm.customerId" filterable placeholder="选择客户" style="width: 100%">
            <el-option v-for="c in customers.filter(c => c?.id)" :key="c.id" :label="c.name || '未知'" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required>
          <el-input v-model="deviceForm.deviceName" placeholder="如：复印机" />
        </el-form-item>
        <el-form-item label="应送数量" required>
          <el-input-number v-model="deviceForm.expectedQuantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="deviceForm.remark" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
        <el-button type="primary" style="width: 100%; margin-top: 8px" :loading="deviceSaving" @click="handleSubmitDevice">确认新增</el-button>
      </el-form>
    </el-drawer>

    <!-- 费用设置弹窗（公物仓项目专用） -->
    <el-dialog v-model="showFeeSettings" title="费用设置" width="92%" top="5vh" destroy-on-close>
      <div class="settings-panel">
        <p class="settings-tip">单价修改后自动保存，关闭弹窗即生效。</p>
        <el-tabs v-model="activeSettingsCategory" type="border-card">
          <el-tab-pane
            v-for="group in settingsByGroup"
            :key="group.name"
            :label="group.name"
            :name="group.name"
          >
            <div class="settings-columns">
              <div class="settings-column">
                <h5 class="settings-column-title">单项服务</h5>
                <div v-for="category in group.single" :key="category.name" class="settings-group">
                  <div class="settings-group-title">{{ category.name }}</div>
                  <el-table :data="category.items" stripe size="small" empty-text="暂无项目">
                    <el-table-column prop="item" label="项目" min-width="120" />
                    <el-table-column prop="unit" label="单位" width="50" />
                    <el-table-column label="价格" width="110">
                      <template #default="{ row }">
                        <el-input-number v-model="row.price" :min="0" :precision="2" size="small" @change="feeUpdateSetting(row)" />
                      </template>
                    </el-table-column>
                    <el-table-column label="启用" width="60" align="center">
                      <template #default="{ row }">
                        <el-switch v-model="row.isActive" @change="feeUpdateSetting(row)" />
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
              <div class="settings-column">
                <h5 class="settings-column-title">组合 / 全流程</h5>
                <div v-for="category in group.combo" :key="category.name" class="settings-group">
                  <div class="settings-group-title">{{ category.name }}</div>
                  <el-table :data="category.items" stripe size="small" empty-text="暂无项目">
                    <el-table-column prop="item" label="项目" min-width="120" />
                    <el-table-column prop="unit" label="单位" width="50" />
                    <el-table-column label="价格" width="110">
                      <template #default="{ row }">
                        <el-input-number v-model="row.price" :min="0" :precision="2" size="small" @change="feeUpdateSetting(row)" />
                      </template>
                    </el-table-column>
                    <el-table-column label="启用" width="60" align="center">
                      <template #default="{ row }">
                        <el-switch v-model="row.isActive" @change="feeUpdateSetting(row)" />
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                <div v-if="group.combo.length === 0" class="settings-empty">暂无组合服务</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ArrowLeft, ArrowRight, EditPen, Delete, Minus, Plus } from '@element-plus/icons-vue';
import { useProjects } from './composables/useProjects';
import { useWorkRecords } from './composables/useWorkRecords';
import { useDevices } from './composables/useDevices';
import { useFeeCalculator } from './composables/useFeeCalculator';
import { useFeeRecords } from './composables/useFeeRecords';
import {
  CalculationType,
  CALCULATION_TYPE_LABELS,
  RecordType,
  RECORD_TYPE_LABELS,
  WorkUnit,
  HOURS_PER_DAY,
  formatWorkHours,
} from '@/types';
import type { Project, WorkRecord, CustomerDevice } from '@/types';
import type { FeeSetting } from '@/api';
import MobileFeeCalculator from './components/MobileFeeCalculator.vue';

// ============ Composables ============
const {
  projects,
  selectedProject,
  users,
  customers,
  loading,
  projectForm,
  canCreateProject,
  canManageProject,
  canCreateRecord,
  canManageDevice,
  canViewPerformance,
  regionGroups,
  addUsersByRegion,
  loadProjects,
  selectProject,
  deselectProject,
  createProject,
  updateProject,
  deleteProject,
  resetProjectForm,
  fillProjectFormForEdit,
  loadUsersAndCustomers,
} = useProjects();

const {
  records,
  stats,
  myStats,
  recordForm,
  editingRecord,
  canSaveRecord,
  loadRecords,
  loadStats,
  loadMyStats,
  prepareNewRecord,
  fillRecordFormForEdit,
  recordTypeOptions,
  saveRecord,
  deleteRecord,
} = useWorkRecords();

const {
  devices,
  deviceForm,
  mobileStageForm,
  loadDevices,
  prepareMobileStageModal,
  createDevice,
  submitMobileStage,
} = useDevices();

const {
  allSettings: feeAllSettings,
  updateSetting: feeUpdateSetting,
  loadSettings: feeLoadSettings,
} = useFeeCalculator();

const {
  feeRecords,
  loadProjectFeeRecords,
  formatFeeDate,
} = useFeeRecords();

// ============ 本地状态 ============
const searchText = ref('');
const warehouseOnly = ref(false);
const deviceExpanded = ref(false);
const expandedRecordIds = ref<Set<string>>(new Set());
const showProjectDrawer = ref(false);
const showRecordDrawer = ref(false);
const stageDrawerVisible = ref(false);
const stageSaving = ref(false);
const deviceDrawerVisible = ref(false);
const deviceSaving = ref(false);
const showFeeSettings = ref(false);
const activeSettingsCategory = ref<string>('');

// ============ 列表过滤 ============
const filteredProjects = computed(() => {
  let list = projects.value;
  if (warehouseOnly.value) {
    list = list.filter(p => p.calculationType === CalculationType.WAREHOUSE);
  }
  if (!searchText.value) return list;
  const kw = searchText.value.toLowerCase();
  return list.filter(p => p.projectName.toLowerCase().includes(kw));
});

// ============ 分页展示 ============
const FEE_PAGE = 10;
const WORK_PAGE = 10;
const feeDisplayCount = ref(FEE_PAGE);
const workDisplayCount = ref(WORK_PAGE);
const visibleFeeRecords = computed(() => feeRecords.value.slice(0, feeDisplayCount.value));
const visibleWorkRecords = computed(() => records.value.slice(0, workDisplayCount.value));
const hasMoreFee = computed(() => feeDisplayCount.value < feeRecords.value.length);
const hasMoreWork = computed(() => workDisplayCount.value < records.value.length);
const loadMoreFee = () => { feeDisplayCount.value += FEE_PAGE; };
const loadMoreWork = () => { workDisplayCount.value += WORK_PAGE; };

watch(() => selectedProject.value?.id, () => {
  feeDisplayCount.value = FEE_PAGE;
  workDisplayCount.value = WORK_PAGE;
});

// ============ 设备汇总 ============
const deviceSummaryText = computed(() => {
  const totalQty = devices.value.reduce((s, d) => s + (d.expectedQuantity || 0), 0);
  if (totalQty === 0) return '';
  const doneQty = devices.value.filter(d => d.isCompleted).reduce((s, d) => s + (d.expectedQuantity || 0), 0);
  return `${totalQty}台 · ${doneQty}台完成 · ${totalQty - doneQty}台进行中`;
});

// ============ 关联设备过滤 ============
const filteredDevicesForRecord = computed(() => {
  if (!recordForm.customerId) return devices.value;
  return devices.value.filter(d => d.customerId === recordForm.customerId);
});

// ============ 费用设置分组 ============
const settingsByGroup = computed(() => {
  const categoryMap = new Map<string, FeeSetting[]>();
  feeAllSettings.value.forEach(setting => {
    const category = setting.category || '未分类';
    if (!categoryMap.has(category)) categoryMap.set(category, []);
    categoryMap.get(category)!.push(setting);
  });
  const categories = Array.from(categoryMap.entries()).map(([name, items]) => ({
    name,
    items: items.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
  const isComputer = (name: string) => name.includes('计算机') || name === '脱密入库';
  const isCombo = (name: string) => name.includes('组合') || name.includes('全流程');
  const buildGroup = (name: string, groupCategories: typeof categories) => ({
    name,
    single: groupCategories.filter(c => !isCombo(c.name)),
    combo: groupCategories.filter(c => isCombo(c.name)),
  });
  const computerCategories = categories.filter(c => isComputer(c.name));
  const peripheralCategories = categories.filter(c => !isComputer(c.name));
  const groups: { name: string; single: typeof categories; combo: typeof categories }[] = [];
  if (computerCategories.length > 0) groups.push(buildGroup('计算机服务', computerCategories));
  if (peripheralCategories.length > 0) groups.push(buildGroup('外设服务', peripheralCategories));
  return groups;
});

watch(settingsByGroup, (groups) => {
  if (!activeSettingsCategory.value && groups.length > 0) {
    activeSettingsCategory.value = groups[0].name;
  }
}, { immediate: true });

watch(showFeeSettings, async (val) => {
  if (val) await feeLoadSettings();
});

// ============ 工具方法 ============
const avatarColors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const getCalcTagType = (type: CalculationType) => {
  const map: Record<string, '' | 'primary' | 'success' | 'warning'> = {
    [CalculationType.QUANTITY]: 'primary',
    [CalculationType.DAILY]: 'success',
    [CalculationType.WAREHOUSE]: 'warning',
  };
  return map[type] || '';
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

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toggleRecordExpand = (id: string) => {
  const next = new Set(expandedRecordIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedRecordIds.value = next;
};

// ============ 项目操作 ============
const handleSelectProject = async (project: Project) => {
  selectProject(project);
  if (project.calculationType === CalculationType.WAREHOUSE) {
    await loadProjectFeeRecords(project.id);
  } else {
    await Promise.all([
      loadRecords(project.id),
      loadStats(project.id),
      loadMyStats(project.id),
      loadDevices(project.id),
    ]);
  }
};

const handleDeselectProject = () => {
  deselectProject();
};

const openCreateProjectDrawer = () => {
  resetProjectForm();
  showProjectDrawer.value = true;
};

const openEditProjectDrawer = (project: Project) => {
  fillProjectFormForEdit(project);
  showProjectDrawer.value = true;
};

const handleSaveProject = async () => {
  if (!projectForm.projectName.trim()) return;
  try {
    if (projectForm.editingId) {
      await updateProject(projectForm);
    } else {
      await createProject(projectForm);
    }
    showProjectDrawer.value = false;
  } catch {
    // 错误已在 composable 中处理
  }
};

const handleDeleteProject = async (project: Project) => {
  await deleteProject(project);
};

// ============ 工作记录操作 ============
const openCreateRecordDrawer = () => {
  prepareNewRecord();
  showRecordDrawer.value = true;
};

const openEditRecordDrawer = (record: WorkRecord) => {
  fillRecordFormForEdit(record);
  showRecordDrawer.value = true;
};

const handleSaveRecord = async () => {
  if (!selectedProject.value || !canSaveRecord.value) return;
  const ok = await saveRecord(selectedProject.value);
  if (ok) {
    showRecordDrawer.value = false;
    await Promise.all([
      loadRecords(selectedProject.value.id),
      loadMyStats(selectedProject.value.id),
      loadStats(selectedProject.value.id),
    ]);
  }
};

const handleDeleteRecord = async (record: WorkRecord) => {
  if (!selectedProject.value) return;
  const ok = await deleteRecord(selectedProject.value, record);
  if (ok) {
    await Promise.all([
      loadRecords(selectedProject.value.id),
      loadMyStats(selectedProject.value.id),
      loadStats(selectedProject.value.id),
    ]);
  }
};

// ============ 设备操作 ============
const openCreateDeviceDrawer = () => {
  deviceForm.customerId = '';
  deviceForm.deviceName = '';
  deviceForm.expectedQuantity = 1;
  deviceForm.remark = '';
  deviceDrawerVisible.value = true;
};

const handleSubmitDevice = async () => {
  if (!selectedProject.value) return;
  deviceSaving.value = true;
  try {
    const ok = await createDevice(selectedProject.value.id);
    if (ok) {
      deviceDrawerVisible.value = false;
    }
  } finally {
    deviceSaving.value = false;
  }
};

const openStageDrawer = (device: CustomerDevice, stage: 'delivery' | 'install' | 'debug') => {
  prepareMobileStageModal(device, stage);
  stageDrawerVisible.value = true;
};

const stageDrawerTitle = computed(() => {
  const stageLabel = { delivery: '送货', install: '安装', debug: '调试' }[mobileStageForm.stage];
  return `记录${stageLabel}`;
});

const handleSubmitStage = async () => {
  if (!selectedProject.value) return;
  stageSaving.value = true;
  try {
    const ok = await submitMobileStage(selectedProject.value.id);
    if (ok) {
      stageDrawerVisible.value = false;
    }
  } finally {
    stageSaving.value = false;
  }
};

// ============ 生命周期 ============
onMounted(async () => {
  await Promise.all([loadProjects(), loadUsersAndCustomers(), feeLoadSettings()]);
});
</script>

<style scoped>
.mobile-projects {
  padding-bottom: 16px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
  margin-bottom: 12px;
}

.list-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
.title-group { display: flex; align-items: center; gap: 8px; }
.search-bar { margin-bottom: 12px; }
.cards { display: flex; flex-direction: column; gap: 10px; }

.project-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  border: 1px solid var(--border-color-lighter, #f0f0f0);
}

.project-card:active { transform: scale(0.98); }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.card-name { font-size: 15px; font-weight: 600; color: var(--text-primary, #1a1a1a); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-right: 8px; }
.card-info { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--text-secondary, #999); }
.info-item.date { margin-left: auto; }
.card-members { margin-top: 8px; }
.avatar-group { display: flex; align-items: center; }
.avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; margin-left: -6px; border: 2px solid #fff; }
.avatar:first-child { margin-left: 0; }
.avatar-more { font-size: 11px; color: var(--text-secondary, #999); margin-left: 4px; }
.empty-state { text-align: center; padding: 48px 20px; color: var(--text-secondary, #999); font-size: 14px; }

.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.back-btn { padding: 0; }
.header-actions { display: flex; gap: 4px; }
.detail-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.detail-title h2 { margin: 0; font-size: 18px; font-weight: 600; }

.section { background: var(--card-bg, #fff); border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.section-header h3 { margin: 0; font-size: 15px; font-weight: 600; }
.section-header.collapsible { cursor: pointer; }
.section-actions { display: flex; align-items: center; gap: 8px; }
.expand-icon { transition: transform 0.2s; }
.expand-icon.expanded { transform: rotate(90deg); }
.device-summary { font-size: 12px; color: var(--text-secondary, #999); font-weight: 400; margin-left: 8px; }
.empty-hint { text-align: center; padding: 24px 0; color: var(--text-secondary, #999); font-size: 13px; }

.device-list { display: flex; flex-direction: column; gap: 10px; }
.device-card { padding: 12px; background: var(--bg-color, #f5f7fa); border-radius: 8px; }
.device-card.completed { background: #f0fdf4; }
.device-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.device-name { font-size: 14px; font-weight: 600; }
.device-customer { font-size: 12px; color: var(--text-secondary, #999); margin-bottom: 8px; }
.device-progress { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.progress-step { display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #fff; border-radius: 4px; font-size: 12px; }
.progress-step.done { background: #dcfce7; color: #16a34a; }
.step-label { font-weight: 600; }
.progress-arrow { color: var(--text-secondary, #999); }
.device-actions { display: flex; gap: 6px; margin-top: 8px; }

.work-record-list { display: flex; flex-direction: column; gap: 8px; }
.work-record-card { padding: 12px; background: var(--bg-color, #f5f7fa); border-radius: 8px; cursor: pointer; }
.work-record-card.expanded { background: #fff; border: 1px solid var(--el-color-primary-light-7); }
.record-summary { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.record-date { font-weight: 600; min-width: 80px; }
.record-qty { color: var(--text-secondary, #999); }
.record-customer { color: var(--text-secondary, #999); margin-left: auto; font-size: 12px; }
.record-collaborators { margin-top: 8px; font-size: 12px; color: var(--text-secondary, #999); }
.collab-label { font-weight: 600; }
.record-remark { margin-top: 4px; font-size: 12px; color: var(--text-secondary, #999); }
.record-actions { margin-top: 8px; display: flex; gap: 8px; }
.load-more { text-align: center; padding: 12px; color: var(--el-color-primary); font-size: 13px; cursor: pointer; }

.stats-list { display: flex; flex-direction: column; gap: 6px; }
.stat-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-color, #f5f7fa); border-radius: 6px; font-size: 13px; }
.stat-name { font-weight: 600; min-width: 60px; }
.stat-detail { flex: 1; display: flex; gap: 12px; color: var(--text-secondary, #999); }
.stat-amount { font-weight: 600; color: var(--el-color-success); }
.my-stats-mini { font-size: 12px; color: var(--text-secondary, #999); font-weight: 400; }

.fee-record-list { display: flex; flex-direction: column; gap: 8px; }
.fee-record-card { padding: 12px; background: var(--bg-color, #f5f7fa); border-radius: 8px; }
.record-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.record-time { font-size: 12px; color: var(--text-secondary, #999); }
.record-amount { font-size: 16px; font-weight: 700; color: var(--el-color-success); }
.record-items { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.record-item-tag { font-size: 12px; padding: 2px 6px; background: #fff; border-radius: 4px; }
.record-item-more { font-size: 12px; color: var(--text-secondary, #999); }
.record-bottom { display: flex; gap: 8px; font-size: 12px; color: var(--text-secondary, #999); }

.region-quick-pick { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; width: 100%; }
.region-quick-label { font-size: 12px; color: var(--text-secondary, #999); white-space: nowrap; }
.region-tag { cursor: pointer; transition: all 0.2s; }
.region-tag:hover { background: var(--primary-color, #3b82f6); color: #fff; border-color: var(--primary-color, #3b82f6); }

.record-form { padding: 0 4px; }
.record-form :deep(.el-form-item) { margin-bottom: 16px; }
.record-form :deep(.el-form-item__label) { font-weight: 600; font-size: 14px; padding-bottom: 4px; }

.type-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.type-chip { padding: 8px 16px; border-radius: 20px; border: 1px solid var(--border-color, #dcdfe6); font-size: 14px; cursor: pointer; transition: all 0.2s; user-select: none; }
.type-chip.active { background: var(--primary-color, #3b82f6); color: #fff; border-color: var(--primary-color, #3b82f6); }
.type-chip.disabled { opacity: 0.4; cursor: not-allowed; }

.qty-row { display: flex; align-items: center; gap: 12px; }
.qty-val { font-size: 20px; font-weight: 600; min-width: 40px; text-align: center; }
.qty-unit { font-size: 14px; color: var(--text-secondary, #999); }
.switch-hint { font-size: 12px; color: var(--text-secondary, #999); margin-left: 8px; }

.stage-form .form-tip { font-size: 12px; color: var(--text-secondary, #999); margin-top: 4px; }

.settings-tip { margin: 0 0 12px 0; color: var(--el-text-color-secondary); font-size: 13px; }
.settings-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.settings-column-title { margin: 0 0 10px 0; padding-bottom: 6px; border-bottom: 2px solid var(--el-color-primary); font-size: 14px; font-weight: 600; color: var(--el-color-primary); }
.settings-group { margin-bottom: 12px; }
.settings-group:last-child { margin-bottom: 0; }
.settings-group-title { margin: 0 0 6px 0; padding-left: 8px; border-left: 3px solid var(--el-color-primary-light-5); font-size: 13px; font-weight: 600; }
.settings-empty { padding: 20px 0; text-align: center; color: var(--el-text-color-secondary); font-size: 13px; }

@media (max-width: 768px) {
  .settings-columns { grid-template-columns: 1fr; }
}
</style>
