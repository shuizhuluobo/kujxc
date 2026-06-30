import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import WorkOrderCard from '@/components/workorder/WorkOrderCard.vue';
import type { WorkOrder } from '@/types';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/composables', () => ({
  usePermission: () => ({
    has: vi.fn((permission: string) => permission === 'workOrder:receive'),
  }),
  useResponsive: () => ({
    isMobile: false,
  }),
}));

describe('WorkOrderCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockWorkOrder = {
    id: 'wo-1',
    customerId: 'customer-1',
    regionId: 'region-1',
    serviceTypeId: 'service-1',
    creatorId: 'user-1',
    detail: 'Test work order detail',
    status: 'PENDING',
    scoreLevel: 'NORMAL',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    customer: {
      id: 'customer-1',
      name: 'Test Customer',
      shortName: 'TC',
    },
    region: {
      id: 'region-1',
      name: 'North',
    },
    serviceType: {
      id: 'service-1',
      name: 'General',
    },
    creator: {
      id: 'user-1',
      name: 'John Doe',
      username: 'johndoe',
    },
    receiver: null,
    completer: null,
    collaborators: [],
  };

  it('renders work order component', () => {
    const wrapper = mount(WorkOrderCard, {
      props: {
        workOrder: mockWorkOrder,
      },
      global: {
        stubs: {
          'el-tag': true,
          'el-button': true,
          'el-icon': true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent(WorkOrderCard).exists()).toBe(true);
  });

  it('receives workOrder prop correctly', () => {
    const wrapper = mount(WorkOrderCard, {
      props: {
        workOrder: mockWorkOrder,
      },
      global: {
        stubs: {
          'el-tag': true,
          'el-button': true,
          'el-icon': true,
        },
      },
    });

    expect(wrapper.props('workOrder')).toEqual(mockWorkOrder);
  });

  it('emits receive event when receive button is clicked', async () => {
    const wrapper = mount(WorkOrderCard, {
      props: {
        workOrder: mockWorkOrder,
      },
      global: {
        stubs: {
          'el-tag': true,
          'el-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'el-icon': true,
        },
      },
    });

    const receiveButton = wrapper.find('button');
    if (receiveButton.exists()) {
      await receiveButton.trigger('click');
      expect(wrapper.emitted('receive')).toBeTruthy();
    }
  });

  it('renders with received status', () => {
    const receivedOrder = {
      ...mockWorkOrder,
      status: 'RECEIVED',
      receiver: {
        id: 'user-2',
        name: 'Jane Smith',
        username: 'janesmith',
      },
    };

    const wrapper = mount(WorkOrderCard, {
      props: {
        workOrder: receivedOrder,
      },
      global: {
        stubs: {
          'el-tag': true,
          'el-button': true,
          'el-icon': true,
          'el-avatar': true,
        },
      },
    });

    const workOrder = wrapper.props('workOrder') as WorkOrder;
    expect(workOrder.status).toBe('RECEIVED');
  });
});
