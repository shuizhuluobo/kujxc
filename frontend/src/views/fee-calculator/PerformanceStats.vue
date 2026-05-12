<template>
  <div class="performance-stats">
    <div class="section">
      <div class="section-header">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <h3>项目列表</h3>
        <div class="header-actions">
          <el-button v-if="canManageProject" type="primary" @click="openCreateProjectModal">新增项目</el-button>
          <el-button v-if="canViewPerformance && projects.length > 0" type="success" @click="handleExportAll">导出全部</el-button>
        </div>
      </div>

      <el-table v-if="projects.length > 0" :data="projects" stripe size="small" @row-click="handleProjectClick">
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column prop="projectName" label="项目名称" min-width="150" />
        <el-table-column label="计算方式" width="100">
          <template #default="{ row }">
            <el-tag :type="row.calculationType === CalculationType.QUANTITY ? 'primary' : 'success'" size="small">
              {{ CALCULATION_TYPE_LABELS[row.calculationType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="设备总量" width="100" v-if="false">
          <template #default="{ row }">{{ row.totalQuantity ? `${row.totalQuantity} 台` : '-' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="120">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" v-if="canManageProject">
          <template #default="{ row }">
            <el-button type="danger" size="small" link @click.stop="handleDeleteProject(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-state">
        <p>暂无项目记录</p>
      </div>
    </div>

    <div v-if="selectedProject" class="section">
      <div class="section-header">
        <h3>{{ selectedProject.projectName }}</h3>
        <div class="header-actions">
          <el-button type="default" @click="handleBackToList">返回列表</el-button>
          <el-button v-if="canViewPerformance" type="success" @click="handleExportCurrent">导出本项目</el-button>
        </div>
      </div>

      <div class="project-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">计算方式</span>
            <el-tag :type="selectedProject.calculationType === CalculationType.QUANTITY ? 'primary' : 'success'" size="small">
              {{ CALCULATION_TYPE_LABELS[selectedProject.calculationType] }}
            </el-tag>
          </div>
          <div class="info-item" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
            <span class="info-label">设备总量</span>
            <span class="info-value">{{ selectedProject.totalQuantity || 0 }} 台</span>
          </div>
          <div class="info-item" v-if="canViewPerformance">
            <span class="info-label">单价设置</span>
            <span class="info-value" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
              送货 {{ selectedProject.deliveryUnitPrice }}元 | 安装 {{ selectedProject.installUnitPrice }}元 | 调试 {{ selectedProject.debugUnitPrice }}元
            </span>
            <span class="info-value" v-else>
              {{ selectedProject.dailyPrice }}元/天
            </span>
          </div>
        </div>
        <el-button v-if="canManageProject" type="primary" size="small" @click="openEditProjectModal">编辑项目</el-button>
      </div>

      <div v-if="selectedProject.calculationType === CalculationType.QUANTITY" class="section">
        <div class="section-header small">
          <h4>客户设备清单</h4>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="openCreateDeviceModal">新增设备</el-button>
            <el-button type="default" size="small" @click="openImportModal">导入设备</el-button>
          </div>
        </div>

        <el-table 
          v-if="sortedDevices.length > 0" 
          :data="sortedDevices" 
          stripe 
          size="small"
          :row-class-name="getDeviceRowClass"
        >
          <el-table-column label="序号" type="index" width="60" />
          <el-table-column label="客户" width="120">
            <template #default="{ row }">{{ row.customer?.name || '-' }}</template>
          </el-table-column>
          <el-table-column label="设备名称" min-width="150">
            <template #default="{ row }">
              <span :class="{ 'completed-device': row.isCompleted }">{{ row.deviceName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="应送" width="70">
            <template #default="{ row }">{{ row.expectedQuantity }}</template>
          </el-table-column>
          <el-table-column label="送货" width="80">
            <template #default="{ row }">
              <span :class="{ 'stage-complete': row.deliveryQuantity >= row.expectedQuantity }">
                {{ row.deliveryQuantity }}/{{ row.expectedQuantity }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="安装" width="80">
            <template #default="{ row }">
              <span :class="{ 'stage-complete': row.installQuantity >= row.deliveryQuantity && row.deliveryQuantity > 0 }">
                {{ row.installQuantity }}/{{ row.deliveryQuantity }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="调试" width="80">
            <template #default="{ row }">
              <span :class="{ 'stage-complete': row.debugQuantity >= row.installQuantity && row.installQuantity > 0 }">
                {{ row.debugQuantity }}/{{ row.installQuantity }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.isCompleted ? 'success' : 'warning'" size="small">
                {{ row.isCompleted ? '已完成' : '进行中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="120">
            <template #default="{ row }">{{ row.remark || '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="220">
            <template #default="{ row }">
              <el-button 
                v-if="!row.isCompleted && row.deliveryQuantity < row.expectedQuantity" 
                type="primary" 
                size="small" 
                link 
                @click="openStageModal(row, 'delivery')"
              >送货</el-button>
              <el-button 
                v-if="!row.isCompleted && row.deliveryQuantity > 0 && row.installQuantity < row.deliveryQuantity" 
                type="success" 
                size="small" 
                link 
                @click="openStageModal(row, 'install')"
              >安装</el-button>
              <el-button 
                v-if="!row.isCompleted && row.installQuantity > 0 && row.debugQuantity < row.installQuantity" 
                type="warning" 
                size="small" 
                link 
                @click="openStageModal(row, 'debug')"
              >调试</el-button>
              <el-button v-if="canManageProject" type="primary" size="small" link @click="openEditDeviceModal(row)">编辑</el-button>
              <el-button v-if="canManageProject && !row.isCompleted" type="danger" size="small" link @click="handleDeleteDevice(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="devices.length === 0" class="empty-state small">
          <p>暂无设备清单，可通过导入或手动添加</p>
        </div>
      </div>

      <div class="records-section">
        <div class="section-header small">
          <h4>工作记录</h4>
          <el-button type="primary" size="small" @click="openCreateRecordModal">新增记录</el-button>
        </div>

        <el-table v-if="records.length > 0" :data="paginatedRecords" stripe size="small">
          <el-table-column label="日期" width="110">
            <template #default="{ row }">{{ formatDate(row.date) }}</template>
          </el-table-column>
          <el-table-column label="类型" width="80">
            <template #default="{ row }">
              <el-tag size="small" :type="getRecordTypeTag(row.recordType)">
                {{ RECORD_TYPE_LABELS[row.recordType!] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="数量/时长" width="110">
            <template #default="{ row }">
              <span v-if="selectedProject!.calculationType === CalculationType.QUANTITY">{{ row.quantity }} 台</span>
              <span v-else>{{ formatWorkHours(row.workHours!) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="客户" width="120" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
            <template #default="{ row }">{{ row.customer?.name || '-' }}</template>
          </el-table-column>
          <el-table-column label="设备" width="120" v-if="selectedProject.calculationType === CalculationType.QUANTITY">
            <template #default="{ row }">{{ getDeviceName(row.deviceId) || '-' }}</template>
          </el-table-column>
          <el-table-column label="协作人员" min-width="160">
            <template #default="{ row }">
              <div class="collaborator-cell">
                <el-tag v-for="c in row.collaborators" :key="c.id" size="small" class="collaborator-tag">{{ c.name }}</el-tag>
                <el-tag v-if="row.includeRecorder && row.creator" size="small" type="warning" class="collaborator-tag">{{ row.creator.name }}(记录)</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="150" v-if="selectedProject.calculationType === CalculationType.DAILY">
            <template #default="{ row }">{{ row.description || '-' }}</template>
          </el-table-column>
          <el-table-column label="记录人" width="80">
            <template #default="{ row }">{{ row.creator?.name || '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100" v-if="canManageProject">
            <template #default="{ row }">
              <el-button type="primary" size="small" link @click="openEditRecordModal(row)">编辑</el-button>
              <el-button type="danger" size="small" link @click="handleDeleteRecord(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="records.length > pageSize" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="records.length"
            layout="prev, pager, next"
          />
        </div>
        <div v-if="records.length === 0" class="empty-state small">
          <p>暂无工作记录</p>
        </div>
      </div>

      <div v-if="canViewPerformance" class="section">
        <div class="section-header">
          <h3>工作量汇总</h3>
          <el-button type="default" size="small" @click="refreshStats">刷新</el-button>
        </div>
        <el-table v-if="stats.length > 0" :data="stats" stripe size="small">
          <el-table-column label="序号" type="index" width="60" />
          <el-table-column label="用户" min-width="100">
            <template #default="{ row }">{{ row.userName }}</template>
          </el-table-column>
          <template v-if="selectedProject.calculationType === CalculationType.QUANTITY">
            <el-table-column label="送货数量" width="100">
              <template #default="{ row }">{{ row.deliveryCount }} 台</template>
            </el-table-column>
            <el-table-column label="送货金额" width="110">
              <template #default="{ row }">{{ row.deliveryAmount.toFixed(2) }} 元</template>
            </el-table-column>
            <el-table-column label="安装数量" width="100">
              <template #default="{ row }">{{ row.installCount }} 台</template>
            </el-table-column>
            <el-table-column label="安装金额" width="110">
              <template #default="{ row }">{{ row.installAmount.toFixed(2) }} 元</template>
            </el-table-column>
            <el-table-column label="调试数量" width="100">
              <template #default="{ row }">{{ row.debugCount }} 台</template>
            </el-table-column>
            <el-table-column label="调试金额" width="110">
              <template #default="{ row }">{{ row.debugAmount.toFixed(2) }} 元</template>
            </el-table-column>
          </template>
          <template v-else>
            <el-table-column label="工作时长" width="100">
              <template #default="{ row }">{{ formatWorkHours(row.totalWorkDays * HOURS_PER_DAY) }}</template>
            </el-table-column>
            <el-table-column label="工作金额" width="110">
              <template #default="{ row }">{{ row.workDaysAmount.toFixed(2) }} 元</template>
            </el-table-column>
          </template>
          <el-table-column label="合计" width="120">
            <template #default="{ row }"><strong>{{ row.totalAmount.toFixed(2) }} 元</strong></template>
          </el-table-column>
        </el-table>
        <div v-else class="empty-state">
          <p>暂无汇总数据</p>
        </div>
      </div>

      <div v-if="!canViewPerformance && myStats" class="section">
        <div class="section-header">
          <h3>我的统计</h3>
        </div>
        <div class="my-stats-card">
          <template v-if="selectedProject.calculationType === CalculationType.QUANTITY">
            <div class="stat-item">
              <span class="stat-label">送货数量</span>
              <span class="stat-value">{{ myStats.deliveryCount }} 台</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">安装数量</span>
              <span class="stat-value">{{ myStats.installCount }} 台</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">调试数量</span>
              <span class="stat-value">{{ myStats.debugCount }} 台</span>
            </div>
          </template>
          <template v-else>
            <div class="stat-item">
              <span class="stat-label">工作时长</span>
              <span class="stat-value">{{ formatWorkHours(myStats.totalWorkDays * HOURS_PER_DAY) }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <el-dialog v-model="showCreateProjectModal" title="新增项目" width="520px" @close="resetCreateProjectForm">
      <el-form :model="createProjectForm" label-width="100px">
        <el-form-item label="项目名称" required>
          <el-input v-model="createProjectForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="计算方式" required>
          <el-radio-group v-model="createProjectForm.calculationType">
            <el-radio :value="CalculationType.QUANTITY">按量计算</el-radio>
            <el-radio :value="CalculationType.DAILY">按天计算</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设备总量" v-if="createProjectForm.calculationType === CalculationType.QUANTITY" required>
          <el-input-number v-model="createProjectForm.totalQuantity" :min="1" style="width: 200px" />
          <span class="unit">台</span>
        </el-form-item>
        <el-form-item label="单价设置" v-if="createProjectForm.calculationType === CalculationType.QUANTITY">
          <div class="price-grid">
            <div class="price-row">
              <span class="price-label">送货单价</span>
              <el-input-number v-model="createProjectForm.deliveryUnitPrice" :min="0" :precision="2" style="width: 130px" />
              <span class="unit">元/台</span>
            </div>
            <div class="price-row">
              <span class="price-label">安装单价</span>
              <el-input-number v-model="createProjectForm.installUnitPrice" :min="0" :precision="2" style="width: 130px" />
              <span class="unit">元/台</span>
            </div>
            <div class="price-row">
              <span class="price-label">调试单价</span>
              <el-input-number v-model="createProjectForm.debugUnitPrice" :min="0" :precision="2" style="width: 130px" />
              <span class="unit">元/台</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="按天单价" v-if="createProjectForm.calculationType === CalculationType.DAILY">
          <el-input-number v-model="createProjectForm.dailyPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/天</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createProjectForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateProjectModal = false">取消</el-button>
        <el-button type="primary" @click="handleCreateProject">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditProjectModal" title="编辑项目" width="520px">
      <el-form :model="editProjectForm" label-width="100px">
        <el-form-item label="项目名称" required>
          <el-input v-model="editProjectForm.projectName" />
        </el-form-item>
        <el-form-item label="设备总量" v-if="selectedProject?.calculationType === CalculationType.QUANTITY">
          <el-input-number v-model="editProjectForm.totalQuantity" :min="1" style="width: 200px" />
          <span class="unit">台</span>
        </el-form-item>
        <el-form-item label="单价设置" v-if="selectedProject?.calculationType === CalculationType.QUANTITY">
          <div class="price-grid">
            <div class="price-row">
              <span class="price-label">送货单价</span>
              <el-input-number v-model="editProjectForm.deliveryUnitPrice" :min="0" :precision="2" style="width: 130px" />
              <span class="unit">元/台</span>
            </div>
            <div class="price-row">
              <span class="price-label">安装单价</span>
              <el-input-number v-model="editProjectForm.installUnitPrice" :min="0" :precision="2" style="width: 130px" />
              <span class="unit">元/台</span>
            </div>
            <div class="price-row">
              <span class="price-label">调试单价</span>
              <el-input-number v-model="editProjectForm.debugUnitPrice" :min="0" :precision="2" style="width: 130px" />
              <span class="unit">元/台</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="按天单价" v-if="selectedProject?.calculationType === CalculationType.DAILY">
          <el-input-number v-model="editProjectForm.dailyPrice" :min="0" :precision="2" style="width: 130px" />
          <span class="unit">元/天</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editProjectForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditProjectModal = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProject">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showRecordModal" :title="editingRecord ? '编辑记录' : '新增记录'" width="560px" @close="resetRecordForm">
      <el-form :model="recordForm" label-width="100px">
        <el-form-item label="工作日期" required>
          <el-date-picker v-model="recordForm.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>

        <template v-if="selectedProject?.calculationType === CalculationType.QUANTITY">
          <el-form-item label="记录类型" required>
            <el-checkbox-group v-model="recordForm.recordTypes">
              <el-checkbox v-for="rt in QUANTITY_RECORD_TYPES" :key="rt" :label="rt">
                {{ RECORD_TYPE_LABELS[rt] }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="客户" required>
            <el-select v-model="recordForm.customerId" placeholder="选择客户" style="width: 100%">
              <el-option v-for="customer in customers" :key="customer.id" :label="customer.name" :value="customer.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备">
            <el-select v-model="recordForm.deviceId" placeholder="选择设备（可选）" clearable style="width: 100%">
              <el-option v-for="device in filteredDevices" :key="device.id" :label="device.deviceName" :value="device.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="数量" required>
            <el-input-number v-model="recordForm.quantity" :min="1" style="width: 200px" />
            <span class="unit">台</span>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="工作时长" required>
            <el-input-number v-model="recordForm.workDuration" :min="0.5" :step="0.5" :precision="1" style="width: 130px" />
            <el-select v-model="recordForm.workUnit" style="width: 90px; margin-left: 8px">
              <el-option v-for="(label, key) in WORK_UNIT_LABELS" :key="key" :label="label" :value="key" />
            </el-select>
          </el-form-item>
          <el-form-item label="工作描述">
            <el-input v-model="recordForm.description" type="textarea" :rows="3" placeholder="请描述工作内容" />
          </el-form-item>
        </template>

        <el-form-item label="协作人员">
          <el-select v-model="recordForm.collaboratorIds" multiple placeholder="请选择协作人员" style="width: 100%" filterable>
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
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
        <el-button @click="showRecordModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRecord">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCreateDeviceModal" title="新增设备" width="480px" @close="resetDeviceForm">
      <el-form :model="deviceForm" label-width="100px">
        <el-form-item label="客户" required>
          <el-select v-model="deviceForm.customerId" placeholder="选择客户" style="width: 100%">
            <el-option v-for="customer in customers" :key="customer.id" :label="customer.name" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required>
          <el-input v-model="deviceForm.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="应送数量" required>
          <el-input-number v-model="deviceForm.expectedQuantity" :min="1" style="width: 200px" />
          <span class="unit">台</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="deviceForm.remark" placeholder="可选备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDeviceModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDevice">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDeviceModal" title="编辑设备" width="480px">
      <el-form :model="deviceForm" label-width="100px">
        <el-form-item label="客户" required>
          <el-select v-model="deviceForm.customerId" placeholder="选择客户" style="width: 100%">
            <el-option v-for="customer in customers" :key="customer.id" :label="customer.name" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required>
          <el-input v-model="deviceForm.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="应送数量" required>
          <el-input-number v-model="deviceForm.expectedQuantity" :min="1" style="width: 200px" />
          <span class="unit">台</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="deviceForm.remark" placeholder="可选备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDeviceModal = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateDevice">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showConfirmDeviceModal" title="确认数量" width="400px">
      <el-form :model="confirmForm" label-width="100px">
        <div class="confirm-info">
          <p><strong>客户：</strong>{{ editingDevice?.customer?.name }}</p>
          <p><strong>设备：</strong>{{ editingDevice?.deviceName }}</p>
          <p><strong>应送数量：</strong>{{ editingDevice?.expectedQuantity }} 台</p>
        </div>
        <el-form-item label="实送数量" required>
          <el-input-number v-model="confirmForm.actualQuantity" :min="0" :max="editingDevice?.expectedQuantity" style="width: 200px" />
          <span class="unit">台</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConfirmDeviceModal = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmDevice">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showStageModal" :title="stageModalTitle" width="500px">
      <el-form :model="stageForm" label-width="100px">
        <div class="confirm-info">
          <p><strong>客户：</strong>{{ editingDevice?.customer?.name }}</p>
          <p><strong>设备：</strong>{{ editingDevice?.deviceName }}</p>
          <p v-if="currentStage === 'delivery'"><strong>待送货：</strong>{{ (editingDevice?.expectedQuantity || 0) - (editingDevice?.deliveryQuantity || 0) }} 台</p>
          <p v-if="currentStage === 'install'"><strong>待安装：</strong>{{ (editingDevice?.deliveryQuantity || 0) - (editingDevice?.installQuantity || 0) }} 台</p>
          <p v-if="currentStage === 'debug'"><strong>待调试：</strong>{{ (editingDevice?.installQuantity || 0) - (editingDevice?.debugQuantity || 0) }} 台</p>
        </div>
        <el-form-item label="数量" required>
          <el-input-number 
            v-model="stageForm.quantity" 
            :min="1" 
            :max="stageMaxQuantity" 
            style="width: 200px" 
          />
          <span class="unit">台</span>
        </el-form-item>
        <el-form-item label="协作人员">
          <el-select v-model="stageForm.collaboratorIds" multiple placeholder="选择协作人员" style="width: 100%">
            <el-option 
              v-for="user in users" 
              :key="user.id" 
              :label="user.name" 
              :value="user.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStageModal = false">取消</el-button>
        <el-button type="primary" @click="handleRecordStage">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showImportModal" title="导入设备清单" width="500px">
      <div class="import-info">
        <p>请上传Excel文件（.xlsx格式），包含以下列：</p>
        <ul>
          <li><strong>客户名称</strong> - 客户姓名（支持：客户名称、客户、单位名称）</li>
          <li><strong>设备名称</strong> - 设备型号或名称（支持：设备名称、设备、型号、品牌、品牌型号）</li>
          <li><strong>数量</strong> - 应送数量（支持：数量、应送数量、台数）</li>
        </ul>
      </div>
      <el-upload
        class="upload-demo"
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".xlsx"
        :show-file-list="false"
      >
        <el-button type="primary" size="small">选择文件</el-button>
      </el-upload>
      <div v-if="importData.length > 0" class="import-preview">
        <h4>预览数据（前10条）</h4>
        <el-table :data="importData.slice(0, 10)" size="small">
          <el-table-column prop="customerName" label="客户名称" />
          <el-table-column prop="deviceName" label="设备名称" />
          <el-table-column prop="quantity" label="数量" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="showImportModal = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :disabled="importData.length === 0">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { customersApi, usersApi, performanceApi } from '@/api';
import { usePerformance } from './composables/usePerformance';
import type { Project, WorkRecord, User, Customer } from '@/types';
import {
    CalculationType,
    CALCULATION_TYPE_LABELS,
    RecordType,
    RECORD_TYPE_LABELS,
    QUANTITY_RECORD_TYPES,
    WorkUnit,
    WORK_UNIT_LABELS,
    HOURS_PER_DAY,
    formatWorkHours,
    convertToHours,
} from '@/types';

const authStore = useAuthStore();
const canManageProject = computed(() => authStore.canManageProject);
const canViewPerformance = computed(() => authStore.canViewPerformance);

const {
    projects,
    selectedProject,
    records,
    stats,
    myStats,
    loading,
    selectProject,
    createProject,
    updateProject,
    deleteProject,
    createRecord,
    updateRecord,
    deleteRecord,
    loadStats,
    loadMyStats,
    formatDate,
    init,
} = usePerformance();

const users = ref<User[]>([]);
const customers = ref<Customer[]>([]);

const showCreateProjectModal = ref(false);
const showEditProjectModal = ref(false);
const showRecordModal = ref(false);
const editingRecord = ref<WorkRecord | null>(null);
const currentPage = ref(1);
const pageSize = 15;

const createProjectForm = reactive({
    projectName: '',
    calculationType: CalculationType.QUANTITY,
    totalQuantity: 1,
    deliveryUnitPrice: 0,
    installUnitPrice: 0,
    debugUnitPrice: 0,
    dailyPrice: 0,
    remark: '',
});

const editProjectForm = reactive({
    projectName: '',
    totalQuantity: 1,
    deliveryUnitPrice: 0,
    installUnitPrice: 0,
    debugUnitPrice: 0,
    dailyPrice: 0,
    remark: '',
});

const recordForm = reactive({
    date: '',
    recordTypes: [] as RecordType[],
    quantity: 1,
    customerId: '' as string | undefined,
    deviceId: '' as string | undefined,
    workDuration: 1,
    workUnit: WorkUnit.DAY as WorkUnit,
    description: '',
    collaboratorIds: [] as string[],
    includeRecorder: true,
    remark: '',
});

const devices = ref<Array<{
    id: string;
    projectId: string;
    customerId: string;
    customer?: { id: string; name: string };
    deviceName: string;
    expectedQuantity: number;
    actualQuantity: number;
    confirmed: boolean;
    confirmedBy?: string;
    confirmedAt?: string;
    remark?: string;
    createdAt: string;
    creatorId: string;
    creator?: { id: string; name: string };
    deliveryQuantity: number;
    deliveryBy?: string;
    deliveryAt?: string;
    deliveryCollaborators: string[];
    installQuantity: number;
    installBy?: string;
    installAt?: string;
    installCollaborators: string[];
    debugQuantity: number;
    debugBy?: string;
    debugAt?: string;
    debugCollaborators: string[];
    isCompleted: boolean;
    completedAt?: string;
}>>([]);

const showCreateDeviceModal = ref(false);
const showEditDeviceModal = ref(false);
const showConfirmDeviceModal = ref(false);
const showImportModal = ref(false);
const showStageModal = ref(false);
const currentStage = ref<'delivery' | 'install' | 'debug'>('delivery');
const editingDevice = ref<typeof devices.value[0] | null>(null);
const importData = ref<Array<{ customerName: string; deviceName: string; quantity: number }>>([]);

const deviceForm = reactive({
    customerId: '',
    deviceName: '',
    expectedQuantity: 1,
    remark: '',
});

const confirmForm = reactive({
    actualQuantity: 0,
});

const stageForm = reactive({
    quantity: 1,
    collaboratorIds: [] as string[],
});

const sortedDevices = computed(() => {
    return [...devices.value].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
});

const stageModalTitle = computed(() => {
    const titles = {
        delivery: '录入送货',
        install: '录入安装',
        debug: '录入调试',
    };
    return titles[currentStage.value];
});

const stageMaxQuantity = computed(() => {
    if (!editingDevice.value) return 1;
    if (currentStage.value === 'delivery') {
        return editingDevice.value.expectedQuantity - editingDevice.value.deliveryQuantity;
    }
    if (currentStage.value === 'install') {
        return editingDevice.value.deliveryQuantity - editingDevice.value.installQuantity;
    }
    if (currentStage.value === 'debug') {
        return editingDevice.value.installQuantity - editingDevice.value.debugQuantity;
    }
    return 1;
});

const getDeviceRowClass = ({ row }: { row: typeof devices.value[0] }) => {
    return row.isCompleted ? 'completed-row' : '';
};

const filteredDevices = computed(() => {
    if (!recordForm.customerId) return devices.value;
    return devices.value.filter(d => d.customerId === recordForm.customerId);
});

const getDeviceName = (deviceId?: string) => {
    if (!deviceId) return '';
    const device = devices.value.find(d => d.id === deviceId);
    return device?.deviceName || '';
};

const getUserName = (userId?: string) => {
    if (!userId) return '';
    const user = users.value.find(u => u.id === userId);
    return user?.name || '';
};

const paginatedRecords = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return records.value.slice(start, start + pageSize);
});

const getRecordTypeTag = (type?: RecordType) => {
    const map: Record<string, string> = {
        [RecordType.DELIVERY]: 'primary',
        [RecordType.INSTALL]: 'success',
        [RecordType.DEBUG]: 'warning',
        [RecordType.CONSTRUCTION]: 'info',
    };
    return type ? map[type] || '' : '';
};

const loadUsers = async () => {
    try {
        const response = await usersApi.getAll();
        users.value = response.data.data;
    } catch (error) {
        console.error('Failed to load users:', error);
    }
};

const loadCustomers = async () => {
    try {
        const response = await customersApi.getAll();
        customers.value = response.data.data;
    } catch (error) {
        console.error('Failed to load customers:', error);
    }
};

const handleProjectClick = (project: Project) => {
    selectProject(project);
};

const handleBackToList = () => {
    selectedProject.value = null;
};

const loadDevices = async () => {
    if (!selectedProject.value) return;
    try {
        const response = await performanceApi.getDevices(selectedProject.value.id);
        devices.value = response.data.data || response.data || [];
    } catch (error) {
        console.error('Failed to load devices:', error);
        devices.value = [];
    }
};

const openCreateDeviceModal = () => {
    editingDevice.value = null;
    resetDeviceForm();
    showCreateDeviceModal.value = true;
};

const openEditDeviceModal = (device: typeof devices.value[0]) => {
    editingDevice.value = device;
    deviceForm.customerId = device.customerId;
    deviceForm.deviceName = device.deviceName;
    deviceForm.expectedQuantity = device.expectedQuantity;
    deviceForm.remark = device.remark || '';
    showEditDeviceModal.value = true;
};

const openConfirmDeviceModal = (device: typeof devices.value[0]) => {
    editingDevice.value = device;
    confirmForm.actualQuantity = device.expectedQuantity;
    showConfirmDeviceModal.value = true;
};

const openStageModal = (device: typeof devices.value[0], stage: 'delivery' | 'install' | 'debug') => {
    editingDevice.value = device;
    currentStage.value = stage;
    stageForm.quantity = 1;
    stageForm.collaboratorIds = [];
    showStageModal.value = true;
};

const openImportModal = () => {
    importData.value = [];
    showImportModal.value = true;
};

const resetDeviceForm = () => {
    deviceForm.customerId = '';
    deviceForm.deviceName = '';
    deviceForm.expectedQuantity = 1;
    deviceForm.remark = '';
};

const handleSaveDevice = async () => {
    if (!selectedProject.value || !deviceForm.customerId || !deviceForm.deviceName) return;
    try {
        await performanceApi.createDevice(selectedProject.value.id, {
            customerId: deviceForm.customerId,
            deviceName: deviceForm.deviceName,
            expectedQuantity: deviceForm.expectedQuantity,
            remark: deviceForm.remark || undefined,
        });
        showCreateDeviceModal.value = false;
        await loadDevices();
    } catch (error) {
        console.error('Failed to create device:', error);
    }
};

const handleUpdateDevice = async () => {
    if (!editingDevice.value) return;
    try {
        await performanceApi.updateDevice(editingDevice.value.id, {
            customerId: deviceForm.customerId,
            deviceName: deviceForm.deviceName,
            expectedQuantity: deviceForm.expectedQuantity,
            remark: deviceForm.remark || undefined,
        });
        showEditDeviceModal.value = false;
        await loadDevices();
    } catch (error) {
        console.error('Failed to update device:', error);
    }
};

const handleDeleteDevice = async (device: typeof devices.value[0]) => {
    try {
        await ElMessageBox.confirm('确定要删除这个设备吗？', '提示', { type: 'warning' });
        await performanceApi.deleteDevice(device.id);
        await loadDevices();
    } catch {}
};

const handleConfirmDevice = async () => {
    if (!editingDevice.value) return;
    try {
        await performanceApi.confirmDevice(editingDevice.value.id, {
            actualQuantity: confirmForm.actualQuantity,
        });
        showConfirmDeviceModal.value = false;
        await loadDevices();
    } catch (error) {
        console.error('Failed to confirm device:', error);
    }
};

const handleRecordStage = async () => {
    if (!editingDevice.value) return;
    try {
        const data = {
            quantity: stageForm.quantity,
            collaboratorIds: stageForm.collaboratorIds,
        };
        
        if (currentStage.value === 'delivery') {
            await performanceApi.recordDelivery(editingDevice.value.id, data);
        } else if (currentStage.value === 'install') {
            await performanceApi.recordInstall(editingDevice.value.id, data);
        } else if (currentStage.value === 'debug') {
            await performanceApi.recordDebug(editingDevice.value.id, data);
        }
        
        showStageModal.value = false;
        await loadDevices();
    } catch (error) {
        console.error('Failed to record stage:', error);
    }
};

const handleFileChange = async (file: any) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const xlsx = await import('xlsx');
            const workbook = xlsx.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = xlsx.utils.sheet_to_json(sheet);
            
            importData.value = jsonData.map((row: any) => ({
                customerName: row['客户名称'] || row['客户'] || row['单位名称'] || '',
                deviceName: row['设备名称'] || row['设备'] || row['型号'] || row['品牌'] || row['品牌型号'] || '',
                quantity: Number(row['数量'] || row['应送数量'] || row['台数'] || 0),
            })).filter(row => row.customerName && row.deviceName && row.quantity > 0);
        } catch (error) {
            console.error('Failed to parse Excel:', error);
        }
    };
    reader.readAsArrayBuffer(file.raw);
};

const handleImport = async () => {
    if (!selectedProject.value || importData.value.length === 0) return;
    
    for (const item of importData.value) {
        const customer = customers.value.find(c => c.name === item.customerName);
        if (!customer) continue;
        
        try {
            await performanceApi.createDevice(selectedProject.value.id, {
                customerId: customer.id,
                deviceName: item.deviceName,
                expectedQuantity: item.quantity,
            });
        } catch (error) {
            console.error('Failed to import device:', error);
        }
    }
    
    showImportModal.value = false;
    await loadDevices();
};

const openCreateProjectModal = () => {
    resetCreateProjectForm();
    showCreateProjectModal.value = true;
};

const resetCreateProjectForm = () => {
    createProjectForm.projectName = '';
    createProjectForm.calculationType = CalculationType.QUANTITY;
    createProjectForm.totalQuantity = 1;
    createProjectForm.deliveryUnitPrice = 0;
    createProjectForm.installUnitPrice = 0;
    createProjectForm.debugUnitPrice = 0;
    createProjectForm.dailyPrice = 0;
    createProjectForm.remark = '';
};

const handleCreateProject = async () => {
    console.log('handleCreateProject called');
    console.log('Form data:', createProjectForm);
    if (!createProjectForm.projectName) {
        console.log('Project name is empty');
        return;
    }
    try {
        console.log('Calling createProject...');
        await createProject({
            projectName: createProjectForm.projectName,
            calculationType: createProjectForm.calculationType,
            totalQuantity: createProjectForm.calculationType === CalculationType.QUANTITY ? createProjectForm.totalQuantity : undefined,
            deliveryUnitPrice: createProjectForm.deliveryUnitPrice,
            installUnitPrice: createProjectForm.installUnitPrice,
            debugUnitPrice: createProjectForm.debugUnitPrice,
            dailyPrice: createProjectForm.dailyPrice,
            remark: createProjectForm.remark || undefined,
        });
        showCreateProjectModal.value = false;
        console.log('Project created successfully');
    } catch (error) {
        console.error('Failed to create project:', error);
    }
};

const openEditProjectModal = () => {
    if (!selectedProject.value) return;
    editProjectForm.projectName = selectedProject.value.projectName;
    editProjectForm.totalQuantity = selectedProject.value.totalQuantity || 1;
    editProjectForm.deliveryUnitPrice = selectedProject.value.deliveryUnitPrice;
    editProjectForm.installUnitPrice = selectedProject.value.installUnitPrice;
    editProjectForm.debugUnitPrice = selectedProject.value.debugUnitPrice;
    editProjectForm.dailyPrice = selectedProject.value.dailyPrice;
    editProjectForm.remark = selectedProject.value.remark || '';
    showEditProjectModal.value = true;
};

const handleUpdateProject = async () => {
    if (!selectedProject.value) return;
    try {
        await updateProject(selectedProject.value.id, {
            projectName: editProjectForm.projectName,
            totalQuantity: selectedProject.value.calculationType === CalculationType.QUANTITY ? editProjectForm.totalQuantity : undefined,
            deliveryUnitPrice: editProjectForm.deliveryUnitPrice,
            installUnitPrice: editProjectForm.installUnitPrice,
            debugUnitPrice: editProjectForm.debugUnitPrice,
            dailyPrice: editProjectForm.dailyPrice,
            remark: editProjectForm.remark || undefined,
        });
        showEditProjectModal.value = false;
    } catch (error) {
        console.error('Failed to update project:', error);
    }
};

const handleDeleteProject = async (project: Project) => {
    try {
        await ElMessageBox.confirm('确定要删除这个项目吗？', '提示', { type: 'warning' });
        await deleteProject(project.id);
    } catch {}
};

const openCreateRecordModal = () => {
    editingRecord.value = null;
    resetRecordForm();
    const today = new Date();
    recordForm.date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    showRecordModal.value = true;
};

const openEditRecordModal = (record: WorkRecord) => {
    editingRecord.value = record;
    recordForm.date = record.date;
    recordForm.recordTypes = record.recordType ? [record.recordType] : [];
    recordForm.quantity = record.quantity || 1;
    recordForm.customerId = record.customerId || '';
    recordForm.deviceId = record.deviceId || '';
    if (record.workHours) {
        if (record.workHours % HOURS_PER_DAY === 0) {
            recordForm.workDuration = record.workHours / HOURS_PER_DAY;
            recordForm.workUnit = WorkUnit.DAY;
        } else {
            recordForm.workDuration = record.workHours;
            recordForm.workUnit = WorkUnit.HOUR;
        }
    } else {
        recordForm.workDuration = 1;
        recordForm.workUnit = WorkUnit.DAY;
    }
    recordForm.description = record.description || '';
    recordForm.collaboratorIds = [...record.collaboratorIds];
    recordForm.includeRecorder = record.includeRecorder;
    recordForm.remark = record.remark || '';
    showRecordModal.value = true;
};

const resetRecordForm = () => {
    recordForm.date = '';
    recordForm.recordTypes = [];
    recordForm.quantity = 1;
    recordForm.customerId = '';
    recordForm.deviceId = '';
    recordForm.workDuration = 1;
    recordForm.workUnit = WorkUnit.DAY;
    recordForm.description = '';
    recordForm.collaboratorIds = [];
    recordForm.includeRecorder = true;
    recordForm.remark = '';
};

const handleSaveRecord = async () => {
    if (!selectedProject.value || !recordForm.date) return;

    const workHours = selectedProject.value.calculationType === CalculationType.DAILY
        ? convertToHours(recordForm.workDuration, recordForm.workUnit)
        : undefined;

    const baseData = {
        date: recordForm.date,
        quantity: selectedProject.value.calculationType === CalculationType.QUANTITY ? recordForm.quantity : undefined,
        customerId: recordForm.customerId || undefined,
        deviceId: recordForm.deviceId || undefined,
        workHours,
        description: recordForm.description || undefined,
        collaboratorIds: recordForm.collaboratorIds,
        includeRecorder: recordForm.includeRecorder,
        remark: recordForm.remark || undefined,
    };

    try {
        if (editingRecord.value) {
            await updateRecord(selectedProject.value.id, editingRecord.value.id, {
                ...baseData,
                recordType: recordForm.recordTypes[0],
            });
        } else {
            if (selectedProject.value.calculationType === CalculationType.QUANTITY && recordForm.recordTypes.length > 0) {
                for (const recordType of recordForm.recordTypes) {
                    await createRecord(selectedProject.value.id, {
                        ...baseData,
                        recordType,
                    });
                }
            } else {
                await createRecord(selectedProject.value.id, {
                    ...baseData,
                    recordType: recordForm.recordTypes[0],
                });
            }
        }
        showRecordModal.value = false;
    } catch (error) {
        console.error('Failed to save record:', error);
    }
};

const handleDeleteRecord = async (record: WorkRecord) => {
    if (!selectedProject.value) return;
    try {
        await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', { type: 'warning' });
        await deleteRecord(selectedProject.value.id, record.id);
    } catch {}
};

const refreshStats = async () => {
    if (!selectedProject.value) return;
    await Promise.all([loadStats(selectedProject.value.id), loadMyStats(selectedProject.value.id)]);
};

const handleExportCurrent = async () => {
    if (!selectedProject.value) return;
    try {
        const response = await performanceApi.exportProject(selectedProject.value.id);
        downloadFile(response.data, `${selectedProject.value.projectName}.xlsx`);
    } catch (error) {
        console.error('Failed to export project:', error);
    }
};

const handleExportAll = async () => {
    try {
        const projectIds = projects.value.map(p => p.id);
        const response = await performanceApi.exportProjects(projectIds);
        downloadFile(response.data, '项目台账_批量导出.xlsx');
    } catch (error) {
        console.error('Failed to export projects:', error);
    }
};

const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};

onMounted(async () => {
    await init();
    await Promise.all([loadUsers(), loadCustomers()]);
});
</script>

<style scoped>
.performance-stats {
    padding: 16px;
}

.section {
    background: var(--card-bg);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color-lighter);
}

.header-actions {
    display: flex;
    gap: 10px;
}

.section-header.small {
    margin-bottom: 12px;
    padding-bottom: 8px;
}

.section-header h3,
.section-header h4 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary);
}

.section-header.small h4 {
    font-size: 14px;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
}

.empty-state.small {
    padding: 20px;
}

.project-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding: 16px;
    background: var(--bg-color);
    border-radius: 8px;
}

.info-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-label {
    color: var(--text-secondary);
    font-size: 13px;
    white-space: nowrap;
}

.info-value {
    font-size: 14px;
    color: var(--text-primary);
}

.records-section {
    margin-bottom: 20px;
}

.collaborator-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.collaborator-tag {
    margin: 0;
}

.pagination-container {
    display: flex;
    justify-content: center;
    padding: 16px 0;
}

.price-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.price-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.price-label {
    width: 60px;
    font-size: 13px;
    color: var(--text-secondary);
}

.unit {
    margin-left: 8px;
    color: var(--text-secondary);
    font-size: 13px;
}

.switch-hint {
    margin-left: 12px;
    font-size: 12px;
    color: var(--text-secondary);
}

.my-stats-card {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
}

.stat-item {
    background: var(--bg-color);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
}

.stat-label {
    display: block;
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 8px;
}

.stat-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
}

:deep(.el-dialog__body) {
    padding: 20px;
}

:deep(.el-form-item) {
    margin-bottom: 16px;
}

.completed-row {
    background-color: #f0f9eb !important;
}

.completed-row:hover > td {
    background-color: #e1f3d8 !important;
}

.completed-device {
    color: #67c23a;
    font-weight: 500;
}

.stage-complete {
    color: #67c23a;
    font-weight: 500;
}

.confirm-info {
    background: var(--bg-color);
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
}

.confirm-info p {
    margin: 4px 0;
    font-size: 14px;
}

.import-info {
    margin-bottom: 16px;
}

.import-info ul {
    margin: 8px 0;
    padding-left: 20px;
}

.import-info li {
    margin: 4px 0;
    font-size: 13px;
}

.import-preview {
    margin-top: 16px;
}

.import-preview h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
}
</style>
