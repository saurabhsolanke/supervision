import { PrismaClient, Role, PlanTier, WorkItemType, WorkItemState, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Supabase database with multi-tenant data...');

  // Default demo password for all seeded accounts
  const demoPasswordHash = await bcrypt.hash('Supervision2026!', 10);

  // 1. Clean existing records in reverse dependency order
  await prisma.workItemComment.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.boardColumn.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.tenantInvitation.deleteMany();
  await prisma.organizationMembership.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing records.');

  // 2. Create Users
  const superadmin = await prisma.user.create({
    data: {
      id: 'u-superadmin',
      email: 'superadmin@supervision.io',
      name: 'Global SuperAdmin',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      jobTitle: 'Supervision Platform Operator',
      isSuperAdmin: true,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      id: 'u-sarah-connor',
      email: 'sarah.connor@contoso.com',
      name: 'Sarah Connor',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      jobTitle: 'Principal Cloud Architect',
      isSuperAdmin: false,
    },
  });

  const alex = await prisma.user.create({
    data: {
      id: 'u-alex-chen',
      email: 'alex.chen@contoso.com',
      name: 'Alex Chen',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      jobTitle: 'Staff Platform Engineer',
    },
  });

  const devon = await prisma.user.create({
    data: {
      id: 'u-devon-vance',
      email: 'devon.vance@contoso.com',
      name: 'Devon Vance',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      jobTitle: 'Senior Fullstack Developer',
    },
  });

  const rita = await prisma.user.create({
    data: {
      id: 'u-rita-skeeter',
      email: 'rita.skeeter@contoso.com',
      name: 'Rita Skeeter',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      jobTitle: 'External Security Auditor (Viewer)',
    },
  });

  const marcus = await prisma.user.create({
    data: {
      id: 'u-marcus-brody',
      email: 'marcus@fabrikam.aero',
      name: 'Marcus Brody',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      jobTitle: 'Chief Avionics Engineer',
    },
  });

  const elena = await prisma.user.create({
    data: {
      id: 'u-elena-rostova',
      email: 'elena@fabrikam.aero',
      name: 'Elena Rostova',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      jobTitle: 'Telemetry Systems Lead',
    },
  });

  const david = await prisma.user.create({
    data: {
      id: 'u-david-thorne',
      email: 'd.thorne@trey-research.org',
      name: 'David Thorne',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      jobTitle: 'Lead Quantum Physicist',
    },
  });

  console.log('✅ Created users in Supabase.');

  // 3. Organization 1: Contoso Cloud Solutions
  const contoso = await prisma.organization.create({
    data: {
      id: 'org-contoso',
      slug: 'contoso',
      name: 'Contoso Cloud Solutions',
      logoUrl: '☁️',
      subscription: {
        create: {
          planTier: PlanTier.ENTERPRISE,
          status: 'ACTIVE',
          seatCount: 4,
          maxSeats: 50,
          currentPeriodEnd: new Date('2027-01-01'),
          billingCycle: 'annual',
        },
      },
      memberships: {
        create: [
          { userId: superadmin.id, role: Role.OWNER },
          { userId: sarah.id, role: Role.OWNER },
          { userId: alex.id, role: Role.ADMIN },
          { userId: devon.id, role: Role.MEMBER },
          { userId: rita.id, role: Role.VIEWER },
        ],
      },
    },
  });

  // Contoso Workspace & Project
  const contosoWs = await prisma.workspace.create({
    data: {
      id: 'ws-contoso-core',
      organizationId: contoso.id,
      name: 'Cloud Infrastructure & Core Services',
      description: 'Enterprise    backbones, Kubernetes clusters, and API gateways',
    },
  });

  const synapseProj = await prisma.project.create({
    data: {
      id: 'proj-synapse',
      organizationId: contoso.id,
      workspaceId: contosoWs.id,
      name: '   Synapse Gateway',
      key: 'SYN',
      description: 'High-throughput real-time message routing gateway for multi-region    deployments',
    },
  });

  // Synapse Columns
  const colNew = await prisma.boardColumn.create({
    data: {
      id: 'col-c1',
      organizationId: contoso.id,
      projectId: synapseProj.id,
      name: 'New',
      state: WorkItemState.NEW,
      order: 0,
      wipLimit: 8,
    },
  });

  const colActive = await prisma.boardColumn.create({
    data: {
      id: 'col-c2',
      organizationId: contoso.id,
      projectId: synapseProj.id,
      name: 'Active',
      state: WorkItemState.ACTIVE,
      order: 1,
      wipLimit: 4, // tight WIP limit to showcase visual warning indicator
    },
  });

  const colResolved = await prisma.boardColumn.create({
    data: {
      id: 'col-c3',
      organizationId: contoso.id,
      projectId: synapseProj.id,
      name: 'Resolved',
      state: WorkItemState.RESOLVED,
      order: 2,
      wipLimit: 6,
    },
  });

  const colClosed = await prisma.boardColumn.create({
    data: {
      id: 'col-c4',
      organizationId: contoso.id,
      projectId: synapseProj.id,
      name: 'Closed',
      state: WorkItemState.CLOSED,
      order: 3,
      wipLimit: null,
    },
  });

  const sprint34 = await prisma.sprint.create({
    data: {
      id: 'spr-synapse-34',
      projectId: synapseProj.id,
      name: 'Sprint 34 (Active)',
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-10-29'),
      isCurrent: true,
    },
  });

  // Synapse Work Items
  const wi1 = await prisma.workItem.create({
    data: {
      id: 'wi-101',
      itemNumber: 1042,
      organizationId: contoso.id,
      projectId: synapseProj.id,
      columnId: colNew.id,
      sprintId: sprint34.id,
      type: WorkItemType.USER_STORY,
      state: WorkItemState.NEW,
      priority: Priority.P2_HIGH,
      title: 'Implement distributed rate limiter using Redis token bucket',
      description:
        'As an API consumer, I want consistent rate-limiting responses with `Retry-After` headers so high-traffic bursts do not degrade platform availability.\n\n### Requirements:\n- Token bucket algorithm per tenant API key.\n- Fail-open gracefully if cache cluster is in maintenance.',
      acceptanceCriteria:
        '- Returns 429 Too Many Requests when threshold exceeded.\n- Response includes X-RateLimit-Limit and X-RateLimit-Remaining headers.\n- Unit test coverage > 90%.',
      effort: 5,
      order: 0,
      tags: ['api-gateway', 'redis', 'security'],
      assigneeId: alex.id,
      reporterId: sarah.id,
    },
  });

  await prisma.workItemComment.create({
    data: {
      workItemId: wi1.id,
      authorId: sarah.id,
      content: 'Make sure we align this with our Enterprise tenant tier quotas.',
    },
  });

  await prisma.workItem.create({
    data: {
      id: 'wi-102',
      itemNumber: 1043,
      organizationId: contoso.id,
      projectId: synapseProj.id,
      columnId: colNew.id,
      sprintId: sprint34.id,
      type: WorkItemType.FEATURE,
      state: WorkItemState.NEW,
      priority: Priority.P1_CRITICAL,
      title: 'Multi-Region    Service Bus event replication pipeline',
      description: 'Design active-passive failover and bi-directional message synchronization across West US 2 and North Europe regions.',
      acceptanceCriteria: '- Zero data loss (RPO < 5s).\n- Automatic DNS health probe failover within 30 seconds.',
      effort: 13,
      order: 1,
      tags: ['infrastructure', '  ', 'disaster-recovery'],
      assigneeId: sarah.id,
      reporterId: sarah.id,
    },
  });

  await prisma.workItem.create({
    data: {
      id: 'wi-103',
      itemNumber: 1044,
      organizationId: contoso.id,
      projectId: synapseProj.id,
      columnId: colActive.id,
      sprintId: sprint34.id,
      type: WorkItemType.BUG,
      state: WorkItemState.ACTIVE,
      priority: Priority.P1_CRITICAL,
      title: 'Memory leak in gRPC connection pool under high concurrency',
      description: 'Investigate connection pooling leak in the stream multiplexer. Memory climbs 250MB/hour when handling more than 15,000 req/sec.',
      acceptanceCriteria: '- Heap allocations remain stable over 48-hour continuous soak test.\n- Zombie sockets are pruned upon TCP keep-alive timeout.',
      effort: 8,
      order: 0,
      tags: ['bug', 'grpc', 'performance'],
      assigneeId: alex.id,
      reporterId: devon.id,
    },
  });

  await prisma.workItem.create({
    data: {
      id: 'wi-104',
      itemNumber: 1045,
      organizationId: contoso.id,
      projectId: synapseProj.id,
      columnId: colActive.id,
      sprintId: sprint34.id,
      type: WorkItemType.USER_STORY,
      state: WorkItemState.ACTIVE,
      priority: Priority.P2_HIGH,
      title: 'OAuth2 mTLS client certificate validation filter',
      description: 'Extract and validate SAN (Subject Alternative Names) from inbound X.509 client certificates at ingress proxy level.',
      acceptanceCriteria: '- Reject expired or revoked CRL certificates with 401 Unauthorized.\n- Forward extracted fingerprint in X-Client-Cert-SHA256 header.',
      effort: 5,
      order: 1,
      tags: ['auth', 'security', 'mtls'],
      assigneeId: devon.id,
      reporterId: alex.id,
    },
  });

  await prisma.workItem.create({
    data: {
      id: 'wi-105',
      itemNumber: 1046,
      organizationId: contoso.id,
      projectId: synapseProj.id,
      columnId: colActive.id,
      sprintId: sprint34.id,
      type: WorkItemType.TASK,
      state: WorkItemState.ACTIVE,
      priority: Priority.P3_MEDIUM,
      title: 'Upgrade OpenTelemetry SDK to v1.28 and configure OTLP exporter',
      description: 'Update telemetry packages across all microservices and pipe traces into    Monitor Application Insights.',
      acceptanceCriteria: '- Trace ID propagation matches W3C standard traceparent header.\n- Sampling rate configurable dynamically via environment variable.',
      effort: 3,
      order: 2,
      tags: ['telemetry', 'observability'],
      assigneeId: devon.id,
      reporterId: sarah.id,
    },
  });

  await prisma.workItem.create({
    data: {
      id: 'wi-106',
      itemNumber: 1047,
      organizationId: contoso.id,
      projectId: synapseProj.id,
      columnId: colActive.id,
      sprintId: sprint34.id,
      type: WorkItemType.EPIC,
      state: WorkItemState.ACTIVE,
      priority: Priority.P2_HIGH,
      title: 'Zero-Trust Tenant Network Boundary Isolation Architecture',
      description: 'Overhaul network virtualization and VPC peering to enforce micro-segmentation for Enterprise healthcare and financial tenants.',
      acceptanceCriteria: '- Tenant pods cannot communicate with other tenant network namespaces.\n- Calico network policies audited and verified.',
      effort: 21,
      order: 3,
      tags: ['epic', 'compliance', 'zero-trust'],
      assigneeId: sarah.id,
      reporterId: sarah.id,
    },
  });

  await prisma.workItem.create({
    data: {
      id: 'wi-107',
      itemNumber: 1048,
      organizationId: contoso.id,
      projectId: synapseProj.id,
      columnId: colActive.id,
      sprintId: sprint34.id,
      type: WorkItemType.BUG,
      state: WorkItemState.ACTIVE,
      priority: Priority.P3_MEDIUM,
      title: 'Payload truncation on HTTP chunked transfer responses > 10MB',
      description: 'Buffer stream prematurely closes when client acknowledges last chunk before trailer header arrives.',
      acceptanceCriteria: '- Check chunk boundaries against RFC 7230.\n- Regression test with 50MB payload.',
      effort: 3,
      order: 4,
      tags: ['bug', 'http'],
      assigneeId: alex.id,
      reporterId: devon.id,
    },
  });

  await prisma.workItem.create({
    data: {
      id: 'wi-108',
      itemNumber: 1049,
      organizationId: contoso.id,
      projectId: synapseProj.id,
      columnId: colResolved.id,
      sprintId: sprint34.id,
      type: WorkItemType.USER_STORY,
      state: WorkItemState.RESOLVED,
      priority: Priority.P2_HIGH,
      title: 'Add webhook signature verification with HMAC-SHA256',
      description: 'Send an `X-Signature-256` digest on outbound webhook delivery so customer backends can verify payload authenticity.',
      acceptanceCriteria: '- Verified against standard RFC 2104 test vectors.\n- Developer portal docs updated with code samples in Python, Go, and C#.',
      effort: 5,
      order: 0,
      tags: ['webhooks', 'security'],
      assigneeId: devon.id,
      reporterId: sarah.id,
    },
  });

  await prisma.workItem.create({
    data: {
      id: 'wi-109',
      itemNumber: 1050,
      organizationId: contoso.id,
      projectId: synapseProj.id,
      columnId: colClosed.id,
      sprintId: sprint34.id,
      type: WorkItemType.TASK,
      state: WorkItemState.CLOSED,
      priority: Priority.P4_LOW,
      title: 'Rotate TLS 1.3 wildcard certificates in    Key Vault',
      description: 'Routine quarterly rotation of SSL/TLS edge certificates across all ingress endpoints.',
      acceptanceCriteria: '- Zero downtime SSL handshake check during rotation.',
      effort: 2,
      order: 0,
      tags: ['devops', 'ssl'],
      assigneeId: alex.id,
      reporterId: sarah.id,
    },
  });

  // Second project for Contoso
  const idhProj = await prisma.project.create({
    data: {
      id: 'proj-identity',
      organizationId: contoso.id,
      workspaceId: contosoWs.id,
      name: 'Cloud Identity Hub',
      key: 'IDH',
      description: 'SAML 2.0 & OIDC identity federation for enterprise single sign-on (SSO)',
      columns: {
        create: [
          { name: 'New', state: WorkItemState.NEW, order: 0, wipLimit: 5, organizationId: contoso.id },
          { name: 'Active', state: WorkItemState.ACTIVE, order: 1, wipLimit: 3, organizationId: contoso.id },
          { name: 'Resolved', state: WorkItemState.RESOLVED, order: 2, wipLimit: 5, organizationId: contoso.id },
          { name: 'Closed', state: WorkItemState.CLOSED, order: 3, wipLimit: null, organizationId: contoso.id },
        ],
      },
      sprints: {
        create: {
          name: 'Sprint 12 (Active)',
          startDate: new Date('2026-10-20'),
          endDate: new Date('2026-11-03'),
          isCurrent: true,
        },
      },
    },
  });

  console.log('✅ Created Contoso Cloud Solutions data in Supabase.');

  // 4. Organization 2: Fabrikam Aerospace
  const fabrikam = await prisma.organization.create({
    data: {
      id: 'org-fabrikam',
      slug: 'fabrikam',
      name: 'Fabrikam Aerospace',
      logoUrl: '🚀',
      subscription: {
        create: {
          planTier: PlanTier.PRO,
          status: 'ACTIVE',
          seatCount: 2,
          maxSeats: 10,
          currentPeriodEnd: new Date('2026-12-15'),
          billingCycle: 'monthly',
        },
      },
      memberships: {
        create: [
          { userId: marcus.id, role: Role.OWNER },
          { userId: elena.id, role: Role.ADMIN },
        ],
      },
    },
  });

  const fabWs = await prisma.workspace.create({
    data: {
      id: 'ws-fab-avionics',
      organizationId: fabrikam.id,
      name: 'Avionics & Telemetry Engineering',
      description: 'Flight data processing and orbital trajectory tracking systems',
    },
  });

  const fltProj = await prisma.project.create({
    data: {
      id: 'proj-telemetry',
      organizationId: fabrikam.id,
      workspaceId: fabWs.id,
      name: 'Flight Telemetry Dashboard',
      key: 'FLT',
      description: 'Sub-millisecond sensor ingest dashboard for flight test telemetry',
    },
  });

  const fabColNew = await prisma.boardColumn.create({
    data: {
      name: 'New',
      state: WorkItemState.NEW,
      order: 0,
      wipLimit: 6,
      organizationId: fabrikam.id,
      projectId: fltProj.id,
    },
  });

  const fabColActive = await prisma.boardColumn.create({
    data: {
      name: 'Active',
      state: WorkItemState.ACTIVE,
      order: 1,
      wipLimit: 3,
      organizationId: fabrikam.id,
      projectId: fltProj.id,
    },
  });

  await prisma.boardColumn.create({
    data: {
      name: 'Resolved',
      state: WorkItemState.RESOLVED,
      order: 2,
      wipLimit: 4,
      organizationId: fabrikam.id,
      projectId: fltProj.id,
    },
  });

  await prisma.boardColumn.create({
    data: {
      name: 'Closed',
      state: WorkItemState.CLOSED,
      order: 3,
      wipLimit: null,
      organizationId: fabrikam.id,
      projectId: fltProj.id,
    },
  });

  const fabSprint = await prisma.sprint.create({
    data: {
      projectId: fltProj.id,
      name: 'Mission Flight Test Alpha',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-31'),
      isCurrent: true,
    },
  });

  await prisma.workItem.create({
    data: {
      itemNumber: 301,
      organizationId: fabrikam.id,
      projectId: fltProj.id,
      columnId: fabColNew.id,
      sprintId: fabSprint.id,
      type: WorkItemType.USER_STORY,
      state: WorkItemState.NEW,
      priority: Priority.P1_CRITICAL,
      title: 'Ingest 100,000 sensor telemetry readings/second via WebSocket',
      description: 'Stream accelerometer and attitude indicator data directly to Canvas 2D flight charts.',
      effort: 13,
      order: 0,
      tags: ['telemetry', 'avionics', 'websocket'],
      assigneeId: elena.id,
      reporterId: marcus.id,
    },
  });

  await prisma.workItem.create({
    data: {
      itemNumber: 302,
      organizationId: fabrikam.id,
      projectId: fltProj.id,
      columnId: fabColActive.id,
      sprintId: fabSprint.id,
      type: WorkItemType.BUG,
      state: WorkItemState.ACTIVE,
      priority: Priority.P1_CRITICAL,
      title: 'Altimeter calibration offset drift at supersonic velocities',
      description: 'Sensor reading lags true barometric pressure above Mach 1.4 by up to 120 feet.',
      effort: 8,
      order: 0,
      tags: ['aerodynamics', 'calibration'],
      assigneeId: marcus.id,
      reporterId: elena.id,
    },
  });

  console.log('✅ Created Fabrikam Aerospace data in Supabase.');

  // 5. Organization 3: Trey Research Labs
  const trey = await prisma.organization.create({
    data: {
      id: 'org-trey',
      slug: 'trey-research',
      name: 'Trey Research Labs',
      logoUrl: '🔬',
      subscription: {
        create: {
          planTier: PlanTier.STARTER,
          status: 'ACTIVE',
          seatCount: 1,
          maxSeats: 3,
          currentPeriodEnd: new Date('2026-11-20'),
          billingCycle: 'monthly',
        },
      },
      memberships: {
        create: [{ userId: david.id, role: Role.OWNER }],
      },
    },
  });

  const treyWs = await prisma.workspace.create({
    data: {
      id: 'ws-trey-lab',
      organizationId: trey.id,
      name: 'Quantum Computation Group',
      description: 'Quantum state simulation and Qiskit circuit modeling',
    },
  });

  const qasProj = await prisma.project.create({
    data: {
      id: 'proj-quantum',
      organizationId: trey.id,
      workspaceId: treyWs.id,
      name: 'Quantum Algorithm Simulator',
      key: 'QAS',
      description: 'Web-based simulation of 64-qubit entangled states',
      columns: {
        create: [
          { name: 'New', state: WorkItemState.NEW, order: 0, wipLimit: 4, organizationId: trey.id },
          { name: 'Active', state: WorkItemState.ACTIVE, order: 1, wipLimit: 2, organizationId: trey.id },
          { name: 'Resolved', state: WorkItemState.RESOLVED, order: 2, wipLimit: 2, organizationId: trey.id },
          { name: 'Closed', state: WorkItemState.CLOSED, order: 3, wipLimit: null, organizationId: trey.id },
        ],
      },
      sprints: {
        create: {
          name: 'Iteration Q3',
          startDate: new Date('2026-10-10'),
          endDate: new Date('2026-11-10'),
          isCurrent: true,
        },
      },
    },
  });

  const treyCol = await prisma.boardColumn.findFirst({
    where: { projectId: qasProj.id, state: WorkItemState.NEW },
  });

  if (treyCol) {
    await prisma.workItem.create({
      data: {
        itemNumber: 401,
        organizationId: trey.id,
        projectId: qasProj.id,
        columnId: treyCol.id,
        type: WorkItemType.FEATURE,
        state: WorkItemState.NEW,
        priority: Priority.P2_HIGH,
        title: "Shor's Algorithm factorization benchmark with WebAssembly",
        description: 'Compile quantum gate operations to Rust WebAssembly for client-side speedup.',
        effort: 8,
        order: 0,
        tags: ['quantum', 'wasm', 'rust'],
        assigneeId: david.id,
        reporterId: david.id,
      },
    });
  }

  console.log('✅ Created Trey Research data in Supabase.');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
