import { getChainFlows } from '@/lib/features/chainFlows';
import { NetflowChart } from '@/components/features/flows/NetflowChart';
import { FlowsTable } from '@/components/features/flows/FlowsTable';

export const revalidate = 30;

export default async function ChainFlowsPage() {
  const [chainFlows] = await Promise.all([getChainFlows({ symbol: 'BTC' })]);

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: 0,
      }}
    >
      <NetflowChart flows={chainFlows} />
      <FlowsTable flows={chainFlows} />
    </div>
  );
}
