<template>
  <div class="borrow-page">
    <div class="page-header">
      <h2>借用管理</h2>
      <el-tag type="info">Phase2 预留</el-tag>
    </div>
    <el-empty description="借用管理功能预留中（BorrowOrder）" />
    <el-card class="tip-card">
      <p>已预留 BorrowOrder 表与路由占位，后续复用 StockLedger 实现借用/归还。</p>
      <p>当前路由权限：borrow:manage</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.borrow-page { max-width: 900px; margin: 0 auto; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.tip-card { margin-top: 16px; line-height: 1.8; color: var(--text-secondary); }
</style>
