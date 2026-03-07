# KWorkOrder - 工单与知识库管理系统

KWorkOrder 是一套现代化的全栈工单管理系统，集成了 Wiki 知识库功能，旨在为企业提供高效的工单追踪与知识沉淀方案。

## 🌟 核心特性

- **多端适配**：基于响应式设计，完美适配桌面端与移动端（支持 Capacitor 原生打包）。
- **流程管理**：完整的工单生命周期管理（待处理、历史记录、详情追踪）。
- **知识库 (Wiki)**：
  - 支持 Markdown 编辑与预览。
  - 支持附件上传（最大 500MB+）。
  - 内置物理文件自动清理机制（防止冗余图片和附件堆积）。
- **权限控管**：基于 RBAC 的精细化权限模型。
- **搜索优化**：集成拼音快捷搜索与元数据过滤。
- **用户体验**：深色模式切换、流畅的微动画与现代化的 UI 交互。

## 🏗️ 架构概览

### Backend (后端)
- **框架**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **数据库**: PostgreSQL
- **验证**: class-validator + Passport JWT

### Frontend (前端)
- **核心**: [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **UI 组件**: [Element Plus](https://element-plus.org/) (PC) & [Vant](https://vant-ui.github.io/vant/) (Mobile)
- **编辑器**: md-editor-v3

### Mobile (移动端)
- **跨平台**: [Capacitor](https://capacitorjs.com/)

## 🎨 开发者

**Luobo** (水煮萝卜)

## 📄 开源协议

本项目仅供内部或个人学习使用。

---
© 2026 Luobo. All Rights Reserved.
